import TIM, { createTIM } from '@/sdk'
import { handleMessage } from '@/sdk/bot'
import COSSDK from 'cos-js-sdk-v5'

let tim = null
let sdkappid = null
let sdksecret = null

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

export function initTimInstance(appid, secret) {
  if (tim) return // TODO 改实例了

  sdkappid = appid // 保存一下appid
  sdksecret = secret

  // 初始化 SDK 实例
  tim = TIM.create({ SDKAppID: appid })

  // 注册 cos
  tim.registerPlugin({ 'cos-js-sdk': COSSDK })
}

// ==========================================================================

const botims = {} // 群id -> 群骰子

// 为某个群启用 bot
export function enableBot(groupId) {
  // 如果这个群的 bot 实例还没有初始化，就新建一个
  if (!botims[groupId]) {
    initBotimInstance(groupId)
  }

  const bot = botims[groupId]
  const name = groupId.replace('@TGS#', 'bot_') // bot 名字每个群唯一，避免冲突

  return new Promise((resolve, reject) => {
    // 登录（重复登录也无所谓）
    bot.login({ userID: name, userSig: window.genTestUserSig(name, sdkappid, sdksecret).userSig })
        .then(() => {
          console.log('登录成功')

          // 判断是否加群，先让它加群
          bot.joinGroup({ groupID: groupId })
              .then(resp => resolve(resp.data))
              .catch(e => reject(e))

        })
        .catch(e => {
          console.log('登录失败', e)
          reject(e)
        })
  })
}

// 为某个群禁用 bot
export function disableBot(groupId) {
  // 如果本来 bot 就没被启用，那没事了
  if (!botims[groupId]) return new Promise(resolve => resolve())

  return botims[groupId].logout()
}

// 初始化 bot 实例，登录以后调用
function initBotimInstance(groupId) {
  // new 一个实例
  let bot = botims[groupId] = createTIM().create({ SDKAppID: sdkappid })

  // 无日志级别
  bot.setLogLevel(4)

  // 注册 cos
  bot.registerPlugin({ 'cos-js-sdk': COSSDK })

  // 设置监听器
  bot.on(TIM.EVENT.SDK_NOT_READY, () => console.log('sdk not ready'))
  bot.on(TIM.EVENT.ERROR, e => console.log(e.data))
  bot.on(TIM.EVENT.KICKED_OUT, e => {
    console.log('sdk kick reason ' + e.data.type)
  })
  bot.on(TIM.EVENT.SDK_READY, () => console.log('sdk ready'))
  bot.on(TIM.EVENT.MESSAGE_RECEIVED, function (event) {
    event.data.forEach(msg => handleMessage(bot, msg))
  })
}