/*
 * channel.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const WebSocket = require('ws');
const logger = require('../log');

class Channel {
  #ws = null;
  #onMessageCallback = null; // (message) => void

  constructor() {

  }

  #connection(resolve, reject) {
    this.#ws = new WebSocket("ws://127.0.0.1:9002");

    this.#ws.onopen = () => {
      logger.info('已连接到服务器');
      // this.#ws.send('你好，服务器！');
      resolve(1)
    };

    this.#ws.onmessage = (event) => {
      if (this.#onMessageCallback) {
        this.#onMessageCallback(event.data);
      }
    };

    this.#ws.onerror = (event) => {
      logger.error('连接错误:', event?.message);
      reject(1)
    };

    this.#ws.onclose = () => {
      logger.info('连接已关闭');
    };

    setTimeout(() => {
      logger.info("to Disconnect");
      this.#ws.close();
    }, 10000);
  }

  asyncRun() {
    return new Promise((resolve, reject) => {
      this.#connection(resolve, reject);
    });
  }

  send(data) {
    if (data) {
      this.#ws.send(data);
    }
  }

  onReceive(callback) {
    this.#onMessageCallback = callback;
  }
}

const channel = new Channel();

module.exports = channel;
