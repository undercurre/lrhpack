declare interface Compiler {
  options: Configuration;
  hooks: Hooks;
}

declare interface Configuration {
  mode: "development" | "production" | "none";
  entry: string | string[] | { [key: string]: string };
  output: {
    filename: string;
    path: string;
  };
  module?: {
    rules?: RuleSetRule[];
  };
  resolve?: {
    extensions?: string[];
  };
  devtool?: string;
  plugins: Plugin[];
  // 在这里你可以添加其他的配置选项
}

declare interface Hooks {
  run: SyncHook;
  done: SyncHook;
}

declare interface Plugin {
  apply(compiler: Compiler): void;
}

interface RuleSetRule {
  test?: RegExp; // 匹配规则，用于指定要应用规则的文件
  include?: string | RegExp | (string | RegExp)[]; // 包含规则，用于指定要匹配的文件路径
  exclude?: string | RegExp | (string | RegExp)[]; // 排除规则，用于指定要排除的文件路径
  use?: RuleSetUse[]; // 应用规则，指定使用的 loader 或者 loader 链
  enforce?: "pre" | "post"; // 强制执行规则，可选值为 'pre' 或 'post'
  // 其他配置选项...
}

type RuleSetUse = RuleSetLoader | string;

interface RuleSetLoader {
  loader: string; // 指定 loader 的名称
  options?: { [key: string]: any }; // 任意配置选项，具体取决于 loader
}
