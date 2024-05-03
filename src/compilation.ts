import path from "path";
import fs from "fs";
import { dependencies } from "webpack";

import parser from "@babel/parser";
import types from "@babel/types";
import traverse from "@babel/traverse";
import generator from "@babel/generator";

const baseDir = toUnixPath(process.cwd()); //获取工作目录，在哪里执行命令就获取哪里的目录，这里获取的也是跟操作系统有关系，要替换成/

export default class Compilation {
  public options: Configuration;
  public modules: any[]; //本次编译所有生成出来的模块
  public chunks: any[]; //本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块
  public assets: any; //本次编译产出的资源文件
  public fileDependencies: string[]; //本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译

  constructor(option: Configuration) {
    this.options = option;
    this.modules = [];
    this.chunks = [];
    this.assets = {};
    this.fileDependencies = [];
  }

  //当编译模块的时候，name：这个模块是属于哪个代码块chunk的，modulePath：模块绝对路径
  buildModule(name: string, modulePath: string) {
    //6.2.1 读取模块内容，获取源代码
    let sourceCode = fs.readFileSync(modulePath, "utf8");
    //buildModule最终会返回一个modules模块对象，每个模块都会有一个id,id是相对于根目录的相对路径
    let moduleId = "./" + path.posix.relative(baseDir, modulePath);
    //模块id:从根目录出发，找到与该模块的相对路径（./src/index.js）
    //6.2.2 创建模块对象
    let module = {
      id: moduleId,
      names: [name], //names设计成数组是因为代表的是此模块属于哪个代码块，可能属于多个代码块
      dependencies: [], //它依赖的模块
      _source: "", //该模块的代码信息
    };
    //6.2.3 找到对应的 `Loader` 对源代码进行翻译和替换
    let loaders: RuleSetUse[] = [];
    if (this.options.module) {
      let { rules = [] } = this.options.module;
      rules.forEach((rule) => {
        let { test } = rule;
        //如果模块的路径和正则匹配，就把此规则对应的loader添加到loader数组中
        if (test && modulePath.match(test)) {
          loaders.push(...rule.use);
        }
      });
      //自右向左对模块进行转译
      sourceCode = loaders.reduceRight((code, loader) => {
        return loader(code);
      }, sourceCode);
    }

    //通过loader翻译后的内容一定得是js内容，因为最后得走我们babel-parse，只有js才能成编译AST
    //第七步：找出此模块所依赖的模块，再对依赖模块进行编译
     //7.1：先把源代码编译成 [AST](https://astexplorer.net/)
     let ast = parser.parse(sourceCode, { sourceType: "module" });
     traverse(ast, {
       CallExpression: (nodePath) => {
         const { node } = nodePath;
       //7.2：在 `AST` 中查找 `require` 语句，找出依赖的模块名称和绝对路径
         if (node.callee.name === "require") {
           let depModuleName = node.arguments[0].value; //获取依赖的模块
           let dirname = path.posix.dirname(modulePath); //获取当前正在编译的模所在的目录
           let depModulePath = path.posix.join(dirname, depModuleName); //获取依赖模块的绝对路径
           let extensions = this.options.resolve?.extensions || [ ".js" ]; //获取配置中的extensions
           depModulePath = tryExtensions(depModulePath, extensions); //尝试添加后缀，找到一个真实在硬盘上存在的文件
           //7.3：将依赖模块的绝对路径 push 到 `this.fileDependencies` 中
           this.fileDependencies.push(depModulePath);
           //7.4：生成依赖模块的`模块 id`
           let depModuleId = "./"  path.posix.relative(baseDir, depModulePath);
           //7.5：修改语法结构，把依赖的模块改为依赖`模块 id` require("./name")=>require("./src/name.js")
           node.arguments = [types.stringLiteral(depModuleId)];
           //7.6：将依赖模块的信息 push 到该模块的 `dependencies` 属性中
           module.dependencies.push({ depModuleId, depModulePath });
         }
       },
     });

     //7.7：生成新代码，并把转译后的源代码放到 `module._source` 属性上
     let { code } = generator(ast);
     module._source = code;
     //7.8：对依赖模块进行编译（对 `module 对象`中的 `dependencies` 进行递归执行 `buildModule` ）
     module.dependencies.forEach(({ depModuleId, depModulePath }) => {
       //考虑到多入口打包 ：一个模块被多个其他模块引用，不需要重复打包
       let existModule = this.modules.find((item) => item.id === depModuleId);
       //如果modules里已经存在这个将要编译的依赖模块了，那么就不需要编译了，直接把此代码块的名称添加到对应模块的names字段里就可以
       if (existModule) {
         //names指的是它属于哪个代码块chunk
         existModule.names.push(name);
       } else {
         //7.9：对依赖模块编译完成后得到依赖模块的 `module 对象`，push 到 `this.modules` 中
         let depModule = this.buildModule(name, depModulePath);
         this.modules.push(depModule);
       }
     });
     //7.10：等依赖模块全部编译完成后，返回入口模块的 `module` 对象
    return module;
  }

  build(callback: () => void) {
    //第五步：根据配置文件中的`entry`配置项找到所有的入口
    let entry: Configuration["entry"] | { main: string } = {};
    if (typeof this.options.entry === "string") {
      entry.main = this.options.entry; //如果是单入口，将entry:"xx"变成{main:"xx"}，这里需要做兼容
    } else {
      entry = this.options.entry;
    }

    //第六步：从入口文件触发，调用配置的loader规则，对各模块进行编译
    for (let entryName in entry) {
      // entryName="main" entryName就是entry对象的属性名，也将会成为代码块的名称
      let entryFilePath = path.posix.join(
        baseDir,
        (entry as Record<string, string>)[entryName]
      );
      //path.posix为了解决不同操作系统的路径分隔符,这里拿到的就是入口文件的绝对路径
      //6.1 把入口文件的绝对路径添加到依赖数组（`this.fileDependencies`）中，记录此次编译依赖的模块
      this.fileDependencies.push(entryFilePath);
      //6.2 得到入口模块的的 `module` 对象 （里面放着该模块的路径、依赖模块、源代码等）
      let entryModule = this.buildModule(entryName, entryFilePath);
      //6.3 将生成的入口文件 `module` 对象 push 进 `this.modules` 中
      this.modules.push(entryModule);
        //第八步：等所有模块都编译完成后，根据模块之间的依赖关系，组装代码块 `chunk`（一般来说，每个入口文件会对应一个代码块`chunk`，每个代码块`chunk`里面会放着本入口模块和它依赖的模块）
+     let chunk = {
+       name: entryName, //entryName="main" 代码块的名称
+       entryModule, //此代码块对应的module的对象,这里就是src/index.js 的module对象
+       modules: this.modules.filter((item) => item.names.includes(entryName)), //找出属于该代码块的模块
+     };
+     this.chunks.push(chunk);
    //第九步：把各个代码块 `chunk` 转换成一个一个文件加入到输出列表
        this.chunks.forEach((chunk) => {
        let filename = this.options.output.filename.replace("[name]", chunk.name);
        this.assets[filename] = getSource(chunk);
        });
    }
    // 这里开始做编译工作，编译成功执行callback
    callback(
       null,
       {
         chunks: this.chunks,
         modules: this.modules,
         assets: this.assets,
       },
       this.fileDependencies
     );
  }
}
