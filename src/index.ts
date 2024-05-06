import { SyncHook } from "tapable"; //这是一个同步钩子
import Compilation from "./compilation";
import fs from "fs";
import path from "path";

//Compiler其实是一个类，它是整个编译过程的大管家，而且是单例模式
class Compiler {
  public options: Configuration;
  public hooks: Hooks;

  constructor(options: Configuration) {
    this.options = options; // 存储配置信息

    // 提供内部钩子
    this.hooks = {
      run: new SyncHook(), // 会在编译刚开始的时候触发此run钩子
      done: new SyncHook(), // 会在编译结束的时候触发此done钩子
    };
  }

  compile(
    callback: (err: any, stats: Stats, fileDependencies: string[]) => void
  ) {
    //虽然webpack只有一个Compiler，但是每次编译都会产出一个新的Compilation，
    //这里主要是为了考虑到watch模式，它会在启动时先编译一次，然后监听文件变化，如果发生变化会重新开始编译
    //每次编译都会产出一个新的Compilation，代表每次的编译结果
    let compilation = new Compilation(this.options);
    compilation.build(callback); //执行compilation的build方法进行编译，编译成功之后执行回调
  }

  // 第四步： 执行Compiler对象run方法开始执行编译
  run(callback: (err: any, stats: Stats) => void) {
    this.hooks.run.call(); // 在编译前触发run钩子执行，表示开始启动编译了
    const onCompiled = (err: any, stats: Stats, fileDependencies: string[]) => {
      //第十步：确定好输出内容之后，根据配置的输出路径和文件名，将文件内容写入到文件系统（这里就是硬盘）
      for (let filename in stats.assets) {
        let filePath = path.join(this.options.output.path, filename);
        fs.writeFileSync(filePath, stats.assets[filename], "utf8");
      }

      callback(err, {
        toJson: () => stats,
        hash: "",
        time: 0,
        errors: [],
        warnings: [],
        assetsByChunkName: {},
        assets: {},
        modules: [],
        chunks: [],
        entrypoints: {},
        reasons: {},
        usedExports: {},
        providedExports: {},
      });
      // 实现 watch 模式
      fileDependencies.forEach((fileDependencie: string) => {
        fs.watch(fileDependencie, () => this.compile(onCompiled));
      });

      this.hooks.done.call(); // 当编译成功后会触发done这个钩子执行
    };
    this.compile(onCompiled); // 开始编译
  }
}

// 第一步：搭建结构，读取配置参数，这里接受的是lrhpack.config.js中的参数
function lrhpack(options: Configuration) {
  // 第二步：用配置参数对象初始化`Compiler`对象
  const compiler = new Compiler(options);
  // 第三步：挂载配置文件中的插件
  const { plugins } = options;
  for (let plugin of plugins) {
    plugin.apply(compiler);
  }
  return compiler;
}

export default lrhpack;
