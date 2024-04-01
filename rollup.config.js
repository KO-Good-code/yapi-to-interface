import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'
// rollup-plugin-typescript2跟rollup-plugin-copy冲突
import typescript from 'rollup-plugin-typescript'
import copy from 'rollup-plugin-copy'
const path = require('path')

// 进行配置
const config = {
  input: path.resolve('src/index.ts'),
  output: {
    file: path.resolve('dist/content.js'),
    format: 'umd',
    name: 'za-api-to-interface',
    strict: false,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ['transform-class-properties'],
    }),
    // 会自动读取 文件tsconfig.json配置，如果不配置，打包识别不了ts，会直接报错
    typescript(),
    // 复制
    copy({
      targets: [{ src: 'src/public/*', dest: 'dist' }]
    })
  ],
}

// 如果是正式环境就压缩
if (process.env.produce) {
  config.plugins.push(uglify())
}

export default config 
