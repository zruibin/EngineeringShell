
declare interface Window {
  bridge: {
    hello: () => void,
    getAppPath: () => string;
  };
}
