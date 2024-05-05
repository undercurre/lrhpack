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
