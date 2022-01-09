import { _loadScript } from '../utils'

/**
 * 这个文件的作用是替换原生的 TIM 引入
 * import TIM from 'tim-js-sdk'
 * 改成从这个文件引入即可
 */

// 这个就相当于正常引入 tim 暴露的 TIM 变量，用于 user 本身。机器人需要从 TIMC 构造新的 TIM
let defaultTIM = null

// 因为现在 TIM 改成异步加载，所以做一层 wrapper
let defaultTIMWrapper = new Proxy({}, {
  get(target, p) {
    if (!defaultTIM) {
      console.error('TIM SDK not loaded!')
      return undefined
    }
    return defaultTIM[p]
  }
})

export default defaultTIMWrapper

// 直接在这里声明 promise，这样在首次 import 本文件时就能尽早加载
const loadTimSDK = new Promise(resolve => {
  // 不重复加载
  if (window.TIMC) {
    resolve()
    return
  }

  _loadScript('./tim-js.js', () => {
    // create default tim
    defaultTIM = window.TIMC()
    resolve()
  })
})

const loadLibSig = new Promise(resolve => {
  // 不重复加载
  if (window.LibGenerateTestUserSig) {
    resolve()
    return
  }

  _loadScript('./libsig.min.js', () => {
    window.genTestUserSig = (userID, SDKAPPID, SECRETKEY) => {
      /**
       * 签名过期时间，建议不要设置的过短
       * <p>
       * 时间单位：秒
       * 默认时间：7 x 24 x 60 x 60 = 604800 = 7 天
       */
      const EXPIRETIME = 604800

      const generator = new window.LibGenerateTestUserSig(SDKAPPID, SECRETKEY, EXPIRETIME)
      const userSig = generator.genTestUserSig(userID)
      return {
        SDKAppID: SDKAPPID,
        userSig: userSig
      }
    }
    resolve()
  })
})

// 加载 TIM 和 libSig SDK，加载成功后才能登录
export function loadSDKs() {
  return Promise.all([loadTimSDK, loadLibSig])
}
