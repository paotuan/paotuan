const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: './',
  assetsDir: './',
  productionSourceMap: false,
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('tim', resolve('src/sdk/tim.js'))
    // 删除预加载
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
    // 压缩代码
    config.optimization.minimize(true)
    // 分割代码
    config.optimization.splitChunks({
        chunks: 'all'
    })
    // cdn
    config.externals({
      vue: 'Vue',
      'element-ui': 'ELEMENT',
      sortablejs: 'Sortable',
      'js-cookie': 'Cookies',
      'vue-clipboard2': 'VueClipboard',
      vuex: 'Vuex',
      xlsx: 'XLSX',
      // for rpg-dice-roller
      mathjs: 'math',
      'random-js': 'Random' // babel 会处理出一堆很大的加密方法，其实不用处理
    })
    config.plugin('html').tap((args) => {
      args[0].cdns = `
        <script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.11/vue.runtime.min.js" crossorigin="anonymous"></script>
        <script src="https://cdn.bootcdn.net/ajax/libs/element-ui/2.13.0/index.js" crossorigin="anonymous"></script>
        <link href="https://cdn.bootcdn.net/ajax/libs/element-ui/2.13.0/theme-chalk/index.css" rel="stylesheet">
        <script src="https://cdn.bootcdn.net/ajax/libs/vuex/3.1.2/vuex.min.js" crossorigin="anonymous"></script>
        <script src="https://cdn.bootcdn.net/ajax/libs/js-cookie/2.2.1/js.cookie.min.js" crossorigin="anonymous"></script>
        <script src="https://cdn.bootcdn.net/ajax/libs/Sortable/1.14.0/Sortable.min.js" crossorigin="anonymous"></script>
        <script src="https://cdn.bootcdn.net/ajax/libs/vue-clipboard2/0.3.1/vue-clipboard.min.js" crossorigin="anonymous"></script>
      `
      return args
    })
  },
  css: {
    extract: true,
    sourceMap: false,
    loaderOptions: {
      stylus: {
        'resolve url': true,
        // 自定义主题场景
        import: [path.resolve(__dirname, './src/assets/css/base.styl')]
      }
    }
  }
}
