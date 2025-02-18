/*
 * cryption.js
 *
 * Created by Ruibin.Chow on 2025/02/18.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const crypto = require('crypto');

const PASSWORD = 'mySecurePassword123!';
const SALT = 'a1b2c3d4e5f6g7h8';

// 固定参数配置（建议通过环境变量配置）
const CONFIG = {
  PASSWORD, // 主密码
  SALT,         // 固定盐值（至少16字节）
  ITERATIONS: 100000, // PBKDF2迭代次数
  KEY_LENGTH: 32, // AES-256需要32字节
  ALGORITHM: 'aes-256-cbc',
  IV_LENGTH: 16 // AES的IV长度
};

// 密钥派生函数（同步版）
function deriveKey() {
  return crypto.pbkdf2Sync(
    CONFIG.PASSWORD,
    CONFIG.SALT,
    CONFIG.ITERATIONS,
    CONFIG.KEY_LENGTH,
    'sha512'
  );
}

// 加密函数
function encrypt(plainText) {
  const key = deriveKey();
  const iv = crypto.randomBytes(CONFIG.IV_LENGTH);
  
  const cipher = crypto.createCipheriv(CONFIG.ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // 返回格式: IV + 密文（便于存储）
  return iv.toString('hex') + ':' + encrypted;
}

// 解密函数
function decrypt(cipherText) {
  const key = deriveKey();
  const [ivHex, encryptedText] = cipherText.split(':');

  if (!ivHex || !encryptedText) {
    throw new Error('Invalid cipher text format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(CONFIG.ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/*
// 使用示例
const originalText = 'Sensitive data 123';
console.log('原文:', originalText);

// 加密
const encrypted = encrypt(originalText);
console.log('加密结果:', encrypted);

// 解密
const decrypted = decrypt(encrypted);
console.log('解密结果:', decrypted);

// 验证相同输入是否生成不同密文（因IV随机）
console.log('二次加密结果:', encrypt(originalText)); // 输出不同
console.log('二次加密结果:', encrypt(originalText)); // 输出不同
*/

module.exports = {
  decrypt,
  encrypt
};

