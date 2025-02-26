
let dev = false;
if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
  dev = true;
}

export default {
  isDev: () => { return dev; }
};