import path from "path";
import * as webpack from "webpack";

const config: webpack.Configuration = {
  mode: "development", //防止代码被压缩
  entry: "./resource/index.ts", //入口文件
  output: {
    path: path.resolve(__dirname, "test_dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // 匹配.ts和.tsx文件
        use: "ts-loader", // 使用ts-loader处理这些文件
        exclude: /node_modules/, // 排除node_modules目录
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"], // 在导入语句中省略这些后缀
  },
  devtool: "source-map", //防止干扰源文件
};

export default config;
