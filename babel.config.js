module.exports = {
  presets: ['@vue/app'],
  ignore: ['sdk/**'],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator'
  ]
}
