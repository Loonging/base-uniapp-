const resolve = (dir) => require('path').join(__dirname, dir)
const PROD = ['production', 'prod'].includes(process.env.NODE_ENV)
const BrotliPlugin = require('brotli-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const zopfli = require('@gfx/zopfli')

module.exports = {
  devServer: {
    publicPath: PROD ? './' : '/',
    open: true,
    proxy: {
      '/api': {
        target: 'http://rap2.taobao.org:38080/app/mock/237921',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/'
        }
      }
    }
  },
  transpileDependencies: ['uni-simple-router'],
  lintOnSave: process.env.NODE_ENV !== 'production',
  runtimeCompiler: true,
  productionSourceMap: !PROD,
  configureWebpack: (config) => {
    if (PROD) {
      const compressionTest = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i
      config.plugins = [
        new CompressionPlugin({
          algorithm(input, compressionOptions, callback) {
            return zopfli.gzip(input, compressionOptions, callback)
          },
          compressionOptions: {
            numiterations: 15
          },
          minRatio: 0.99,
          test: compressionTest
        }),
        new BrotliPlugin({
          test: compressionTest,
          minRatio: 0.99
        })
      ]
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false
      // eslint-disable-next-line camelcase
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log']
    }
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch').delete('preload')
    config.resolve.symlinks(true)
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@utils', resolve('src/utils'))
      .set('@components', resolve('src/components'))
    config.node.set('__dirname', true).set('__filename', true)
  }
}
