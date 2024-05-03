//自定义插件WebpackDonePlugin
class DonePlugin {
  apply(compiler: Compiler) {
    compiler.hooks.done.tap("WebpackDonePlugin", () => {
      console.log("结束编译");
    });
  }
}

export default DonePlugin;
