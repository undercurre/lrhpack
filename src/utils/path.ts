import fs from "fs";

//这里因为要获取入口文件的绝对路径，考虑到操作系统的兼容性问题，需要将路径的 \ 都替换成 /
function toUnixPath(filePath: string) {
  return filePath.replace(/\\/g, "/");
}

//获取文件路径
function tryExtensions(modulePath, extensions) {
  if (fs.existsSync(modulePath)) {
    return modulePath;
  }
  for (let i = 0; i < extensions?.length; i++) {
    let filePath = modulePath + extensions[i];
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  throw new Error(`无法找到${modulePath}`);
}
