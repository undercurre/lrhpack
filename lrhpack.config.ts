import path from "path";
import RunPlugin from "./src/run";
import DonePlugin from "./src/done";

const loader1 = (source: string) => {
  return source + "//给你的代码加点注释：loader1";
};

const loader2 = (source: string) => {
  return source + "//给你的代码加点注释：loader2";
};

const config: Configuration = {
  mode: "development", //防止代码被压缩
  entry: "./resource/index.ts", //入口文件
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [loader1, loader2],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"], // 在导入语句中省略这些后缀
  },
  devtool: "source-map", //防止干扰源文件
  plugins: [new RunPlugin(), new DonePlugin()],
};

export default config;
