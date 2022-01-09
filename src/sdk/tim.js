import TIM from '@/sdk'
import { handleMessage } from '@/sdk/bot'
import TIMUploadPlugin from 'tim-upload-plugin'

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
  tim.setLogLevel(4)
  // 注册 cos
  tim.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin })
}

export function generateShareSig() {
  return btoa(sdkappid + '/' + sdksecret.split('').reverse().join(''))
}

export function registerListeners(tim, listenerMap, scope) {
  for (let event in listenerMap) {
    // 可能会出现由于页面刷新、重新登录等导致多次注册监听器的情况
    // 这里最简单粗暴的办法是每次注册之前反注册一次原来的监听器
    tim.off(event, listenerMap[event], scope)
    tim.on(event, listenerMap[event], scope)
  }
}

// ==========================================================================

const botims = {} // 群id -> 群骰子

class BotContext {
  constructor(groupId) {
    this.bot = window.TIMC().create({ SDKAppID: sdkappid })
    this.groupId = groupId
    this.name = groupId.replace('@TGS#', 'bot_') // bot 名字每个群唯一，避免冲突
    this.init()
  }

  init() {
    // 无日志级别
    this.bot.setLogLevel(4)
    // 注册 cos
    this.bot.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin })
    // register listeners
    registerListeners(this.bot, {
      [TIM.EVENT.SDK_READY]: this.onReadyStateUpdate,
      [TIM.EVENT.SDK_NOT_READY]: this.onReadyStateUpdate,
      [TIM.EVENT.KICKED_OUT]: this.onKickedOut,
      [TIM.EVENT.ERROR]: this.onSdkError,
      [TIM.EVENT.MESSAGE_RECEIVED]: this.onMessageReceived,
    }, this)
  }

  enable() {
    return new Promise((resolve, reject) => {
      // 登录（重复登录也无所谓）
      this.bot.login({ userID: this.name, userSig: window.genTestUserSig(this.name, Number(sdkappid), sdksecret).userSig })
          .then(() => {
            console.log('登录成功')

            // 判断是否加群，先让它加群
            // 这个接口倒不用在 sdk ready 后调用？否则写起来麻烦一点 TODO 后面最好还是改一下严谨起见
            this.bot.joinGroup({ groupID: this.groupId })
                .then(resp => resolve(resp.data))
                .catch(e => reject(e))

          })
          .catch(e => {
            console.log('登录失败', e)
            reject(e)
          })
    })
  }

  disable() {
    // logout 一定是 logout
    // disable 不一定要 logout，只是我们选择了这种方式实现7·吗i
    return this.bot.logout()
  }

  logout() {
    return this.bot.logout()
  }

  setAvatar(url) {
    return this.bot.updateMyProfile({ avatar: url })
  }

  onReadyStateUpdate({ name }) {
    console.log('[bot]' + name)
    const isSDKReady = name === TIM.EVENT.SDK_READY
    if (isSDKReady) {
      // 把自己的昵称改为 bot，也不做重复判断了，实际应该不会有人一直无聊开开关关
      // 也不等待成功了，失败也无所谓
      // 如果用户想自定义 bot 的名字，可以改它的群名片
      // 注意要在 sdk ready 后调用
      this.bot.updateMyProfile({ nick: 'bot' })
    }
  }

  onSdkError(e) {
    console.log(e.data)
  }

  onKickedOut(e) {
    // TODO 给用户提示
    console.log('sdk kick reason ' + e.data.type)
  }

  onMessageReceived({ data: msglist }) {
    msglist.forEach(msg => handleMessage(this.bot, msg))
  }
}

// 为某个群启用 bot
export function enableBot(groupId) {
  // 如果这个群的 bot 实例还没有初始化，就新建一个
  if (!botims[groupId]) {
    botims[groupId] = new BotContext(groupId)
  }
  return botims[groupId].enable()
}

// 为某个群禁用 bot
export function disableBot(groupId) {
  // 如果本来 bot 就没被启用，那没事了
  if (!botims[groupId]) return new Promise(resolve => resolve())

  // 目前是退出登录，也可以还是在线但是不处理消息
  return botims[groupId].disable()
}

// 设置 bot 头像
export function setBotAvatar(groupId, url) {
  // 如果 bot 没启用则报错
  if (!botims[groupId]) return new Promise((_, reject) => reject())

  return botims[groupId].setAvatar(url)
}

// 退出时退出所有骰子
export function logoutAllBots() {
  Object.values(botims).forEach(bot => {
    bot.logout()
  })
}
