/*
 * delete.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const path = require('path');
// 添加自定义搜索路径
[
  process.cwd()
].forEach(p => {
  module.paths.push(p);
  module.paths.push(path.join(p, 'node_modules'));
});

const fs = require('fs');
const fsExtra = require("fs-extra");

let removeList = [
    path.join(process.cwd(), "dist"),
    path.join(process.cwd(), "release"),
];

removeList.forEach(value => {
    console.log("remove: ", value)
    if (fs.existsSync(value)) {
        fsExtra.removeSync(value)
    }
});
