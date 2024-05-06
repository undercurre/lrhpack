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

declare interface RuleSetRule {
  test?: RegExp; // 匹配规则，用于指定要应用规则的文件
  include?: string | RegExp | (string | RegExp)[]; // 包含规则，用于指定要匹配的文件路径
  exclude?: string | RegExp | (string | RegExp)[]; // 排除规则，用于指定要排除的文件路径
  use?: RuleSetUse[]; // 应用规则，指定使用的 loader 或者 loader 链
  enforce?: "pre" | "post"; // 强制执行规则，可选值为 'pre' 或 'post'
  // 其他配置选项...
}

declare type RuleSetUse = (source: string) => string;

declare interface Stats {
  /**
   * A hash representing the compilation.
   */
  hash: string;

  /**
   * The time in milliseconds it took for the compilation to finish.
   */
  time: number;

  /**
   * An array of webpack compiler error messages.
   */
  errors: string[];

  /**
   * An array of webpack compiler warning messages.
   */
  warnings: string[];

  /**
   * A map of chunk names to their sizes.
   */
  assetsByChunkName: { [chunkName: string]: string | string[] };

  /**
   * A map of module identifier to the size of the module.
   */
  assets: Asset;

  /**
   * A map of module identifier to the modules referenced by the module.
   */
  modules: Array<Module>;

  /**
   * A map of chunk names to the chunks generated by the compilation.
   */
  chunks: Array<Chunk>;

  /**
   * A map of chunk name to the entry point.
   */
  entrypoints: { [entrypointName: string]: Entrypoint };

  /**
   * A map of module identifier to the reasons the module was included.
   */
  reasons: { [moduleIdentifier: string]: Reason[] };

  /**
   * A map of module identifier to the modules that were dependent on it.
   */
  usedExports: { [moduleIdentifier: string]: boolean };

  /**
   * A map of module identifier to the modules that imported it.
   */
  providedExports: { [moduleIdentifier: string]: string[] };

  /**
   * Converts the stats object to a JSON object.
   */
  toJson(options?: ToJsonOptions): any;
}

declare interface Module {
  names: string[];
  id: string;
  _source: string;
}

declare interface Chunk {
  name: string;
  modules: Module[];
  entryModule: Module;
}

declare type Asset = Record<string, string>;

interface Entrypoint {}

interface Reason {}

declare interface ToJsonOptions {
  /**
   * Include asset information.
   */
  assets?: boolean;

  /**
   * Include built modules information.
   */
  builtAt?: boolean;

  /**
   * Include cached information.
   */
  cached?: boolean;

  /**
   * Include chunk information.
   */
  chunks?: boolean;

  /**
   * Include chunk group information.
   */
  chunkGroups?: boolean;

  /**
   * Include chunk modules information.
   */
  chunkModules?: boolean;

  /**
   * Include chunk origins information.
   */
  chunkOrigins?: boolean;

  /**
   * Include entry points information.
   */
  entrypoints?: boolean;

  /**
   * Include error details.
   */
  errors?: boolean;

  /**
   * Include logging information.
   */
  logging?: boolean;

  /**
   * Include logging debug information.
   */
  loggingDebug?: boolean;

  /**
   * Include logging trace information.
   */
  loggingTrace?: boolean;

  /**
   * Include module information.
   */
  modules?: boolean;

  /**
   * Include performance hints.
   */
  performance?: boolean;

  /**
   * Include public path information.
   */
  publicPath?: boolean;

  /**
   * Include reasons information.
   */
  reasons?: boolean;

  /**
   * Include source information.
   */
  source?: boolean;

  /**
   * Include timing information.
   */
  timings?: boolean;

  /**
   * Include used exports information.
   */
  usedExports?: boolean;

  /**
   * Include version information.
   */
  version?: boolean;

  /**
   * Include warnings.
   */
  warnings?: boolean;
}

interface Chunk {}

interface Entrypoint {}

interface Reason {}

declare interface ToJsonOptions {
  /**
   * Include asset information.
   */
  assets?: boolean;

  /**
   * Include built modules information.
   */
  builtAt?: boolean;

  /**
   * Include cached information.
   */
  cached?: boolean;

  /**
   * Include chunk information.
   */
  chunks?: boolean;

  /**
   * Include chunk group information.
   */
  chunkGroups?: boolean;

  /**
   * Include chunk modules information.
   */
  chunkModules?: boolean;

  /**
   * Include chunk origins information.
   */
  chunkOrigins?: boolean;

  /**
   * Include entry points information.
   */
  entrypoints?: boolean;

  /**
   * Include error details.
   */
  errors?: boolean;

  /**
   * Include logging information.
   */
  logging?: boolean;

  /**
   * Include logging debug information.
   */
  loggingDebug?: boolean;

  /**
   * Include logging trace information.
   */
  loggingTrace?: boolean;

  /**
   * Include module information.
   */
  modules?: boolean;

  /**
   * Include performance hints.
   */
  performance?: boolean;

  /**
   * Include public path information.
   */
  publicPath?: boolean;

  /**
   * Include reasons information.
   */
  reasons?: boolean;

  /**
   * Include source information.
   */
  source?: boolean;

  /**
   * Include timing information.
   */
  timings?: boolean;

  /**
   * Include used exports information.
   */
  usedExports?: boolean;

  /**
   * Include version information.
   */
  version?: boolean;

  /**
   * Include warnings.
   */
  warnings?: boolean;
}
