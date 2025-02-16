/*
 * delete.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

let fs = require('fs');
let path = require('path')
let fsExtra = require("fs-extra");

const parentDir = path.dirname(__dirname);
let removeList = [
    path.join(parentDir, "dist"),
    path.join(parentDir, "release"),
];

removeList.forEach(value => {
    console.log("remove: ", value)
    if (fs.existsSync(value)) {
        fsExtra.removeSync(value)
    }
});
