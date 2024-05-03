//自定义插件WebpackRunPlugin
class RunPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.run.tap("WebpackRunPlugin", () => {
      console.log("开始编译");
    });
  }
}

export default RunPlugin;
