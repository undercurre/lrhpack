import { transform } from "@babel/core";
import path from "path";
import { tryExtensions } from "./path";

//生成运行时代码
export function getSource(chunk: Chunk) {
  return `
    (() => {
     var modules = {
       ${chunk.modules.map(
         (module: Module) => `
         "${module.id}": (module, exports) => {
           ${module._source}
         }
       `
       )}  
     };
     var cache = {};
     function require(moduleId) {
       var cachedModule = cache[moduleId];
       if (cachedModule !== undefined) {
         return cachedModule.exports;
       }
       var module = (cache[moduleId] = {
         exports: {},
       });
       modules[moduleId](module, module.exports, require);
       return module.exports;
     }
     var exports ={};
     ${chunk.entryModule._source}
   })();
    `;
}

export function transformTSSource(
  sourceCode: string,
  modulePath: string
): string {
  if (path.extname(modulePath) === ".ts") {
    const transformRes = transform(sourceCode, {
      filename: modulePath,
      presets: [["@babel/preset-env", { modules: "commonjs" }]],
      plugins: [
        ["@babel/plugin-transform-typescript", { allowNamespaces: true }],
        "@babel/plugin-transform-modules-commonjs",
      ],
    });

    const code = transformRes?.code ?? "";
    // 正则表达式，匹配 require 语句中的路径字符串
    const regex = /require\(['"](.+?)['"]\)/g;
    const replaced = code.replace(regex, (match, pathString) => {
      // 这里的回调函数会对每个匹配项调用一次
      // match 是整个匹配项
      // pathString 是匹配项中的路径字符串
      // 您可以在这里对路径字符串进行处理，并返回替换后的内容
      const baseName = path.basename(pathString);
      const changeName = path.dirname(modulePath) + "/" + baseName;
      const depModulePath = tryExtensions(changeName, [".js", ".ts"]);
      return `require("${depModulePath}")`; // 示例：将路径字符串转换为大写
    });
    console.log("修改后的code", code);
    return replaced;
  }

  return "";
}
