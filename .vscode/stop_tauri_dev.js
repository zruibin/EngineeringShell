/*
 * stop_tauri_dev.js
 *
 * Created by Ruibin.Chow on 2025/03/11.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const { exec } = require('child_process');
const os = require('os');

// 定义端口号，需替换为实际端口
const port = 3000;

const platform = os.platform();

if (platform === 'darwin' || platform === 'linux') {
    exec(`lsof -t -i:${port} | xargs kill -9 || true`, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行命令出错: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`命令执行有错误输出: ${stderr}`);
            return;
        }
        console.log(`已停止监听端口 ${port} 的进程`);
    });
} else if (platform === 'win32') {
    exec(`powershell -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort ${port}).OwningProcess | ForEach-Object { $_.Kill() }"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行命令出错: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`命令执行有错误输出: ${stderr}`);
            return;
        }
        console.log(`已停止监听端口 ${port} 的进程`);
    });
} else {
    console.log('不支持的操作系统');
}
