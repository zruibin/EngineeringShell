/*
 * log.js
 *
 * Created by Ruibin.Chow on 2023/05/05.
 * Copyright (c) 2023年 Ruibin.Chow All rights reserved.
 */


let isElectron = false;
if (navigator.userAgent.toLowerCase().indexOf(' electron/') > -1){
  isElectron = true;
  // console.log("appPath: ", window.bridge.getAppPath());
  // window.bridge?.send("logger.info", window.bridge.getAppVersion());
  // window.bridge?.send("ban", `3333`);
  // window.bridge?.invoke("invoke.test", "1122334").then((data) => {
  //   window.bridge?.send("logger.info",`log invoke.test -> ${JSON.stringify(data)}`);
  // });
}

console.log(`isElectron: ${isElectron}, userAgent: ${navigator.userAgent.toLowerCase()}`);

const tag = "[F][App]";

export default {
  info() {
    if (isElectron) {
      window.bridge?.send("logger.info", `${tag}[I] ${[...arguments].join('')}`);
    } else {
      console.log(`${tag}[I]`, ...arguments);
    }
  },                   
  warn() {
    if (isElectron) {
      window.bridge?.send("logger.warn", `${tag}[W] ${[...arguments].join('')}`);
    } else {
      console.log(`${tag}[W]`, ...arguments);
    }
  },
  error() {
    if (isElectron) {
      window.bridge?.send("logger.error", `${tag}[E] ${[...arguments].join('')}`);
    } else {
      console.log(`${tag}[E]`, ...arguments);
    }
  },
  debug() {
    if (isElectron) {
      window.bridge?.send("logger.debug", `${tag}[D] ${[...arguments].join('')}`);
    } else {
      console.log(`${tag}[D]`, ...arguments);
    }
  },
  verbose() {
    if (isElectron) {
      window.bridge?.send("logger.verbose", `${tag}[V] ${[...arguments].join('')}`);
    } else {
      console.log(`${tag}[V]`, ...arguments);
    }
  },
};
