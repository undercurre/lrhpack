import { transform } from "@babel/core";
import path from "path";

//生成运行时代码
export function getSource(chunk: Chunk) {
  return `
    (() => {
     var modules = {
       ${chunk.modules.map(
         (module: Module) => `
         "${module.id}": (module) => {
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
      presets: ["@babel/preset-env", "@babel/preset-typescript"],
      plugins: ["@babel/plugin-transform-typescript"],
    });

    const code = transformRes?.code ?? "";
    // 正则表达式，匹配 require 语句中的路径字符串
    const regex = /require\(['"](.+?)['"]\)/;

    // 使用正则表达式匹配路径字符串
    const match = code.match(regex);

    if (match) {
      const pathString = match[1]; // 获取匹配到的路径字符串
      console.log("路径字符串:", pathString);
    } else {
      console.log("未找到路径字符串");
    }
  }

  return "";
}
