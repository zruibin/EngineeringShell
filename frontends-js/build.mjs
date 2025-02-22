
// build.mjs
import { build } from 'esbuild'

build({
  entryPoints: ['../frontends-common/script/cryption.ts'],
  outdir: '../frontends-common/script/',
  bundle: false, // 不打包为单个文件
  platform: 'node',
  format: 'cjs', // 或 'esm'
  sourcemap: true,
}).catch(() => process.exit(1))