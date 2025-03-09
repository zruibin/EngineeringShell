/*
 * move.ts
 *
 * Created by Ruibin.Chow on 2025/03/09.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

import fs from 'fs';
import path  from 'path';
// 添加自定义搜索路径
[
  process.cwd()
].forEach(p => {
  module.paths.push(p);
  module.paths.push(path.join(p, 'node_modules'));
});


/**
 * 同步移动目录及其所有子目录和文件
 * @param {string} source 源目录路径
 * @param {string} destination 目标目录路径
 */
function moveDirectorySync(source: string, destination: string): void {
    try {
        if (!fs.existsSync(source)) {
            throw new Error(`源目录不存在: ${source}`);
        }

        // 如果目标目录存在，确保它为空
        if (fs.existsSync(destination)) {
            if (fs.lstatSync(destination).isDirectory()) {
                removeDirectorySync(destination); // 删除已存在的目标目录
            } else {
                fs.unlinkSync(destination); // 如果目标不是目录，删除它
            }
        }

        // 尝试重命名（移动）目录
        fs.renameSync(source, destination);
        // console.log(`已移动目录: ${source} -> ${destination}`);
    } catch (err) {
        if (err.code === 'EXDEV' || err.code === 'ENOTEMPTY') { // 跨设备或目标不为空
            console.warn(`无法直接移动目录，尝试复制并删除: ${err.message}`);
            copyDirectorySync(source, destination);
            removeDirectorySync(source);
            // console.log(`已移动目录（通过复制和删除）: ${source} -> ${destination}`);
        } else {
            console.error(`移动目录失败: ${err.message}`);
        }
    }
}

/**
 * 同步复制目录及其所有子目录和文件
 * @param {string} src 源目录路径
 * @param {string} dest 目标目录路径
 */
function copyDirectorySync(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectorySync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * 同步删除目录及其所有子目录和文件
 * @param {string} dirPath 目录路径
 */
function removeDirectorySync(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                removeDirectorySync(fullPath);
            } else {
                fs.unlinkSync(fullPath);
            }
        }

        fs.rmdirSync(dirPath);
    }
}


let moveList = [];

const distDirName = 'release';
const destination = path.join(process.cwd(), distDirName);
const prePath = path.join(process.cwd(), 'src-tauri/target/release/');
moveList.push(path.join(prePath, 'bundle'));

switch (process.platform) {
  case 'darwin':
    moveList.push(path.join(prePath, 'app'));
    break;
  case 'win32':
    moveList.push(path.join(prePath, 'app.exe'));
    break;
  case 'linux':
    
    break;
  default:
    console.error('Unsupported platform.');
    break;
}

if (!fs.existsSync(destination)) {
  fs.mkdirSync(destination, { recursive: true });
}

moveList.forEach(value => {
  // console.log('move: ', value);
  try {
    const stats = fs.lstatSync(value);
    if (stats.isDirectory()) {
      moveDirectorySync(value, destination);
      console.log(`目录已移动: ${value} -> ${distDirName}`);
    } else if (stats.isFile()) {
      const distFile = path.join(destination, path.relative(prePath, value));
      fs.renameSync(value, distFile);
      console.log(`文件已移动: ${value} -> ${distDirName}`);
    } else {
      // console.log('move not exists:', value);
      console.log(`${value} 是其他类型的文件系统对象.`);
    }
  } catch(err) {
    console.log('move err: ', err);
  }
});




