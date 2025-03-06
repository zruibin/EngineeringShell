/*
 * delete.ts
 *
 * Created by Ruibin.Chow on 2025/02/16.
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

let removeList = [
  path.join(process.cwd(), 'dist'),
  path.join(process.cwd(), 'release'),
];

const args = process.argv.slice(2);
if (args?.length > 0 && args[0] === '--all') {
  removeList.push(path.join(process.cwd(), 'src-tauri', 'target'));
}

removeList.forEach(value => {
  console.log('remove: ', value);
  if (fs.existsSync(value)) {
    fs.rmSync(value, { recursive: true, force: true });
  }
});
