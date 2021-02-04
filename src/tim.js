import TIM from 'tim-js-sdk'
import COSSDK from 'cos-js-sdk-v5'
import Vue from 'vue'

let tim = null

// 在非 vue 文件中（如 vuex 模块）使用 import tim 实例，会保持 tim 未被初始化时的值 （null）
// 因此这里通过暴露一个 proxy 的方式使得每次调用都能获取到最新的 tim 实例
// 后续可以排查一下在 vuex action 中调用 tim 的地方
let timWrapper = new Proxy({}, {
  get(target, p) {
    if (!tim) {
      console.warn('use tim before init!!!')
      return undefined
    }
    return tim[p]
  }
})
export default timWrapper

export function initTimInstance(appid) {
  if (tim) return // TODO 改实例了

  // 初始化 SDK 实例
  tim = TIM.create({ SDKAppID: appid })

  // 无日志级别
  tim.setLogLevel(4)

  // 注册 cos
  tim.registerPlugin({ 'cos-js-sdk': COSSDK })

  window.tim = tim
  Vue.prototype.tim = tim
}