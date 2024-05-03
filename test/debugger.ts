import webpack from "../src/index";
import webpackOptions from "../lrhpack.config";

const compiler = webpack(webpackOptions);

//开始编译
compiler.run((err, stats) => {
  console.log(err);
  console.log(
    stats?.toJson({
      assets: true, //打印本次编译产出的资源
      chunks: true, //打印本次编译产出的代码块
      modules: true, //打印本次编译产出的模块
    })
  );
});