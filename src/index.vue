<template>
  <div
      class="container"
      v-loading="loading"
      element-loading-text="正在拼命初始化……首次加载需要更多资源，请耐心等待"
      element-loading-background="rgba(0, 0, 0, 0.8)">
    <div id="wrapper" v-if="!isLogin">
      <login :key="initialAppid" :initial-appid="initialAppid" :initial-secret="initialSecret" @submit="doLogin"/>
      <div class="meta">意见/建议可移步 <a href="https://github.com/paotuan/paotuan/issues" target="_blank">Github</a>，或加交流群：115699014</div>
    </div>
    <div v-else class="chat-wrapper">
      <Main />
    </div>
  </div>
</template>

<script>
import { Notification } from 'element-ui'
import { mapState } from 'vuex'
import Login from './components/user/login'
import { translateGroupSystemNotice } from './utils/common'
import { initTimInstance, logoutAllBots, registerListeners } from 'tim'
import Cookies from 'js-cookie'
import { loadSDKs } from './sdk'

export default {
  title: 'paotuan',
  data() {
    return {
      loading: true, // 初始化过程中
      initialAppid: '',
      initialSecret: '',
      invitedGroup: '', // 被邀请进群的 id
    }
  },
  components: {
    Login,
    Main: () => import('./components/user/main')
  },
  computed: {
    ...mapState({
      currentUserProfile: state => state.user.currentUserProfile,
      currentConversation: state => state.conversation.currentConversation,
      videoCall: state => state.conversation.videoCall,
      audioCall: state => state.conversation.audioCall,
      isLogin: state => state.user.isLogin,
      isSDKReady: state => state.user.isSDKReady,
      isBusy: state => state.video.isBusy,
      userID: state => state.user.userID,
      userSig: state => state.user.userSig,
      sdkAppID: state => state.user.sdkAppID
    }),
  },
  mounted() {
    // 做一些初始化逻辑
    // 1. 提取参数
    let params = new URLSearchParams(location.hash.startsWith('#/') ? location.hash.substr(2) : '')
    let sig = params.get('s') || Cookies.get('s') // sig 首选 url 里的，次选 cookie 里的
    this.invitedGroup = params.get('g') || '' // 是否是邀请进群的链接
    let userid = Cookies.get('uin') // 是否记住了用户名
    let canAutoLogin = Cookies.get('autologin') === 'true' // 是否自动登录. 注意类型
    try {
      [this.initialAppid, this.initialSecret] = atob(sig).split('/').map((value, index) => {
        return index === 0 ? value : value.split('').reverse().join('')
      })
    } catch (e) {
      console.log('invalid sig', sig)
    }
    // 2. 判断是否能自动登录，3个参数俱全都可以
    if (canAutoLogin && this.initialAppid && this.initialSecret && userid) {
      this.doLogin({ appid: this.initialAppid, secret: this.initialSecret, userID: userid })
    } else {
      // 不能自动登录就保持在登录页面
      this.loading = false
    }
    // 做完了就把参数去掉，避免污染地址栏
    location.hash = ''
  },

  methods: {
    initListener() {
      registerListeners(this.tim, {
        // 登录成功后会触发 SDK_READY 事件，该事件触发后，可正常使用 SDK 接口
        [this.TIM.EVENT.SDK_READY]: this.onReadyStateUpdate,
        // SDK NOT READT
        [this.TIM.EVENT.SDK_NOT_READY]: this.onReadyStateUpdate,
        // 被踢出
        [this.TIM.EVENT.KICKED_OUT]: this.onKickOut,
        // SDK内部出错
        [this.TIM.EVENT.ERROR]: this.onError,
        // 收到新消息
        [this.TIM.EVENT.MESSAGE_RECEIVED]: this.onReceiveMessage,
        // 会话列表更新
        [this.TIM.EVENT.CONVERSATION_LIST_UPDATED]: this.onUpdateConversationList,
        // 群组列表更新
        [this.TIM.EVENT.GROUP_LIST_UPDATED]: this.onUpdateGroupList,
        // 网络监测
        [this.TIM.EVENT.NET_STATE_CHANGE]: this.onNetStateChange,
        // 已读回执
        [this.TIM.EVENT.MESSAGE_READ_BY_PEER]: this.onMessageReadByPeer,
      }, this)
    },

    onReceiveMessage({ data: messageList }) {
      // this.handleVideoMessage(messageList)
      this.handleAt(messageList)
      this.handleAddGroupTip(messageList)
      this.handleQuitGroupTip(messageList)
      // this.handleCloseGroupLive(messageList)
      this.$store.commit('pushCurrentMessageList', messageList)
      // this.$store.commit('pushAvChatRoomMessageList', messageList)
      this.$store.dispatch('insertGameLogs', messageList) // 记录 log
      this.$store.dispatch('handleKPNote', messageList) // 过滤 kp 指令
    },
    onError({ data }) {
      if (data.message !== 'Network Error') {
        this.$store.commit('showMessage', {
          message: data.message,
          type: 'error'
        })
      }
    },
    onMessageReadByPeer() {

    },
    onReadyStateUpdate({ name }) {
      const isSDKReady = name === this.TIM.EVENT.SDK_READY
      this.$store.commit('toggleIsSDKReady', isSDKReady)

      if (isSDKReady) {
        this.tim
            .getMyProfile()
            .then(({ data }) => {
              this.$store.commit('updateCurrentUserProfile', data)
            })
            .catch(error => {
              this.$store.commit('showMessage', {
                type: 'error',
                message: error.message
              })
            })
        this.$store.dispatch('getBlacklist')

        // 判断要不要自动加群
        if (this.invitedGroup) {
          this.tim.joinGroup({ groupID: '@TGS#' + this.invitedGroup })
            .then(() => { // 重复入群也无所谓
              this.$store.commit('showMessage', {
                type: 'success',
                message: '邀请入群成功'
              })
            })
            .catch((e) => {
              console.log('invited failed', e)
              this.$store.commit('showMessage', {
                type: 'error',
                message: '邀请入群失败'
              })
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          this.loading = false
        }
      }
    },
    kickedOutReason(type) {
      switch (type) {
        case this.TIM.TYPES.KICKED_OUT_MULT_ACCOUNT:
          return '由于多实例登录'
        case this.TIM.TYPES.KICKED_OUT_MULT_DEVICE:
          return '由于多设备登录'
        case this.TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED:
          return '由于 userSig 过期'
        default:
          return ''
      }
    },
    checkoutNetState(state) {
      switch (state) {
        case this.TIM.TYPES.NET_STATE_CONNECTED:
          return { message: '已接入网络', type: 'success' }
        case this.TIM.TYPES.NET_STATE_CONNECTING:
          return { message: '当前网络不稳定', type: 'warning' }
        case this.TIM.TYPES.NET_STATE_DISCONNECTED:
          return { message: '当前网络不可用', type: 'error' }
        default:
          return ''
      }
    },
    onNetStateChange(event) {
      this.$store.commit('showMessage', this.checkoutNetState(event.data.state))
    },
    onKickOut(event) {
      this.$store.commit('showMessage', {
        message: `${this.kickedOutReason(event.data.type)}被踢出，请重新登录。`,
        type: 'error'
      })
      // this.$store.commit('toggleIsLogin', false)
      this.$store.commit('reset')
      logoutAllBots()
    },
    onUpdateConversationList(event) {
      this.$store.commit('updateConversationList', event.data)
    },
    onUpdateGroupList(event) {
      this.$store.commit('updateGroupList', event.data)
    },
    onReceiveGroupSystemNotice(event) {
      const isKickedout = event.data.type === 4
      const isCurrentConversation =
          `GROUP${event.data.message.payload.groupProfile.groupID}` ===
          this.currentConversation.conversationID
      // 在当前会话被踢，需reset当前会话
      if (isKickedout && isCurrentConversation) {
        this.$store.commit('resetCurrentConversation')
      }
      Notification({
        title: '新系统通知',
        message: translateGroupSystemNotice(event.data.message),
        duration: 3000,
        onClick: () => {
          const SystemConversationID = '@TIM#SYSTEM'
          this.$store.dispatch('checkoutConversation', SystemConversationID)
        }
      })
    },
    /**
     * 处理 @ 我的消息
     * @param {Message[]} messageList
     */
    handleAt(messageList) {
      // 筛选有 @ 符号的文本消息
      const atTextMessageList = messageList.filter(
          message =>
              message.type === this.TIM.TYPES.MSG_TEXT &&
              message.payload.text.includes('@')
      )
      for (let i = 0; i < atTextMessageList.length; i++) {
        const message = atTextMessageList[i]
        const matched = message.payload.text.match(/@\w+/g)
        if (!matched) {
          continue
        }
        // @ 我的
        if (matched.includes(`@${this.currentUserProfile.userID}`)) {
          // 当前页面不可见时，调用window.Notification接口，系统级别通知。
          if (this.$store.getters.hidden) {
            this.notifyMe(message)
          }
          Notification({
            title: `有人在群${message.conversationID.slice(5)}提到了你`,
            message: message.payload.text,
            duration: 3000
          })
          this.$bus.$emit('new-messsage-at-me', {
            data: { conversationID: message.conversationID }
          })
        }
      }
    },
    selectConversation(conversationID) {
      if (conversationID !== this.currentConversation.conversationID) {
        this.$store.dispatch('checkoutConversation', conversationID)
      }
    },
    /**
     * 使用 window.Notification 进行全局的系统通知
     * @param {Message} message
     */
    notifyMe(message) {
      // 需检测浏览器支持和用户授权
      if (!('Notification' in window)) {
        return
      } else if (window.Notification.permission === 'granted') {
        this.handleNotify(message)
      } else if (window.Notification.permission !== 'denied') {
        window.Notification.requestPermission().then(permission => {
          // 如果用户同意，就可以向他们发送通知
          if (permission === 'granted') {
            this.handleNotify(message)
          }
        })
      }
    },
    handleNotify(message) {
      const notification = new window.Notification('有人提到了你', {
        icon: 'https://webim-1252463788.file.myqcloud.com/demo/img/logo.dc3be0d4.png',
        body: message.payload.text
      })
      notification.onclick = () => {
        window.focus()
        this.$store.dispatch('checkoutConversation', message.conversationID)
        notification.close()
      }
    },
    // 收到有群成员加群通知时，重新拉一把群资料，否则群成员面板不会实时更新
    handleAddGroupTip(messageList) {
      const groupTips = messageList.filter(message => {
        return this.currentConversation.conversationID === message.conversationID &&
            message.type === this.TIM.TYPES.MSG_GRP_TIP &&
            message.payload.operationType === this.TIM.TYPES.GRP_TIP_MBR_JOIN
      })
      if (groupTips.length > 0) {
        this.$store.dispatch('getGroupMemberList', this.currentConversation.conversationID.replace('GROUP', ''))
      }
    },
    /**
     * 收到有群成员退群/被踢出的groupTip时，需要将相关群成员从当前会话的群成员列表中移除
     * @param {Message[]} messageList
     */
    handleQuitGroupTip(messageList) {
      // 筛选出当前会话的退群/被踢群的 groupTip
      const groupTips = messageList.filter(message => {
        return this.currentConversation.conversationID === message.conversationID &&
            message.type === this.TIM.TYPES.MSG_GRP_TIP &&
            (message.payload.operationType === this.TIM.TYPES.GRP_TIP_MBR_QUIT ||
                message.payload.operationType === this.TIM.TYPES.GRP_TIP_MBR_KICKED_OUT)
      })
      // 清理当前会话的群成员列表
      if (groupTips.length > 0) {
        groupTips.forEach(groupTip => {
          if (Array.isArray(groupTip.payload.userIDList) || groupTip.payload.userIDList.length > 0) {
            this.$store.commit('deleteGroupMemberList', groupTip.payload.userIDList)
          }
        })
      }
    },
    /**
     * 登录
     */
    async doLogin({ appid, secret, userID, isRememberUin = true, isAutoLogin = true }) {
      // 0. 参数校验，之所以放在这里而不是表单的 validate，是因为自动登录逻辑不走表单
      const numappid = Number(appid)
      if (numappid <= 0) {
        this.$store.commit('showMessage', { message: '登录失败：参数不合法', type: 'error' })
        return
      }
      this.loading = true
      // 1. 确保 TIM 和 libsig SDK 加载完成
      await loadSDKs()
      // 2. 根据提供的 appid 初始化 tim 实例
      initTimInstance(appid, secret)
      // 3. 初始化实例以后，设置监听器
      this.initListener()
      // 4. 正式发起登录
      const userSig = window.genTestUserSig(userID, numappid, secret).userSig
      try {
        await this.tim.login({ userID, userSig })
        this.$store.commit('toggleIsLogin', true)
        this.$store.commit('startComputeCurrent')
        this.$store.commit({
          type: 'GET_USER_INFO',
          userID: userID,
          userSig: userSig,
          sdkAppID: appid
        })
        this.$store.commit('showMessage', {
          type: 'success',
          message: '登录成功'
        })
        // 写 cookie
        Cookies.set('s', btoa(appid + '/' + secret.split('').reverse().join('')), { expires: 7 })
        Cookies.set('autologin', isAutoLogin)
        if (isRememberUin) {
          Cookies.set('uin', userID, { expires: 7 })
        } else {
          // 如果不记住用户名，那么也把之前记住的用户名给清掉
          Cookies.remove('uin')
        }
      } catch(error) {
        this.loading = false
        this.$store.commit('showMessage', {
          message: '登录失败：' + error.message,
          type: 'error'
        })
      }
    }
  }
}
</script>
<style scoped>
.meta {
  position: absolute;
  bottom: 10px;
  color: rgb(243, 243, 243);
  font-size: 14px;
}

a, a:visited {
  color: rgb(243, 243, 243);
}
</style>
<style lang="stylus">
body {
  overflow: hidden;
  margin: 0;
  font-family: 'Microsoft YaHei', '微软雅黑', 'MicrosoftJhengHei', 'Lantinghei SC', 'Open Sans', Arial, 'Hiragino Sans GB', 'STHeiti', 'WenQuanYi Micro Hei', SimSun, sans-serif;
  // font-family  "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif
  // text-shadow: $regular 0 0 0.05em
  background-color: rgb(48, 56, 65);
  -ms-scroll-chaining: chained;
  -ms-overflow-style: none;
  -ms-content-zooming: zoom;
  -ms-scroll-rails: none;
  -ms-content-zoom-limit-min: 100%;
  -ms-content-zoom-limit-max: 500%;
  -ms-scroll-snap-type: proximity;
  -ms-scroll-snap-points-x: snapList(100%, 200%, 300%, 400%, 500%);
  -ms-overflow-style: none;
  overflow: auto;

  div {
    box-sizing: border-box;

    &::before, &::after {
      box-sizing: border-box;
    }
  }
}

#wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height $height
}

.container
  position relative
  height 100vh

.loading {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-wrapper {
  width: $width;
  height: $height;
}

/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}

/* 滚动槽 */
::-webkit-scrollbar-track {
  border-radius: 10px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.1);
}
</style>
