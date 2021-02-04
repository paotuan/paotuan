import TIM from 'tim-js-sdk'
import COSSDK from 'cos-js-sdk-v5'
import Vue from 'vue'

let tim = null
export default tim

export function initTimInstance() {
  if (tim) return; // TODO 改实例了

  // 初始化 SDK 实例
  tim = TIM.create({
    SDKAppID: window.genTestUserSig('').SDKAppID
  })

  window.setLogLevel = tim.setLogLevel

// 无日志级别
  tim.setLogLevel(4)

// 注册 cos
  tim.registerPlugin({'cos-js-sdk':COSSDK})

  window.tim = tim
  Vue.prototype.tim = tim
}