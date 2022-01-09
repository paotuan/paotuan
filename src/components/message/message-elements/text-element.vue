<template>
  <message-bubble :isMine=isMine :message=message>
    <template v-for="(item, index) in contentList">
      <span :key="index" v-if="item.name === 'text'" v-html="postProcess(item.text)"></span>
      <img v-else-if="item.name === 'img'" :src="item.src" width="20px" height="20px" :key="index"/>
    </template>
  </message-bubble>
  <!-- <div class="chat-bubble">
    <div class="message-content" :class="isMine ? 'message-send' : 'message-received'">
      <template v-for="(item, index) in contentList">
        <span :key="index" v-if="item.name === 'text'">{{ item.text }}</span>
        <img v-else-if="item.name === 'img'" :src="item.src" width="20px" height="20px" :key="index"/>
      </template>
    </div>
  </div> -->
</template>

<script>
import MessageBubble from '../message-bubble'
import { decodeText, escapeHTML } from '@/utils/decodeText'
import { ALL_PROPS, ALL_SKILLS } from '@/sdk/card'

const regex = new RegExp(`(${
  [...Object.keys(ALL_PROPS), ...Object.keys(ALL_SKILLS)].join('|')
})`, 'g')

export default {
  name: 'TextElement',
  components: {
    MessageBubble
  },
  props: {
    payload: {
      type: Object,
      required: true
    },
    message: {
      type: Object,
      required: true
    },
    isMine: {
      type: Boolean
    }
  },
  computed: {
    contentList() {
      return decodeText(this.payload)
    }
  },
  methods: {
    // 文字消息后处理
    // 目前需要处理的内容：KP发的群消息
    postProcess(content) {
      // 1. 群消息
      if (this.message.conversationType === this.TIM.TYPES.CONV_GROUP) {
        // 2. 是群主发的
        const sender = this.$store.state.group.currentMemberList.filter(member => member.userID === this.message.from)
        if (sender.length > 0 && sender[0].role === this.TIM.TYPES.GRP_MBR_ROLE_OWNER) {
          let prefix = content.match(/(困难|极难|极限)/)
          prefix = prefix ? prefix[0] : ''
          return this.escape(content).replace(regex, `<span class="underline" onclick="_onclickspan('${prefix}$1')">$1</span>`)
        }
      }
      // 不符合条件的
      return this.escape(content)
    },
    escape(content) {
      return escapeHTML(content)
    }
  }
}

// 这里用粗暴的模拟输入方式，避免搞各种组件和生命周期
window._onclickspan = (skill) => {
  let ghost = document.getElementById('ghost-message-send-box')
  ghost.innerText = '.d% ' + skill
  ghost.click()
}
</script>
<style>
.underline {
  cursor: pointer;
  text-decoration: underline;
}
</style>
<style lang="stylus" scoped>
// .chat-bubble
//   position relative
//   .message-content
//     font-size 14px
//     position relative
//     max-width 350px
//     word-wrap break-word
//     word-break break-all
//     padding 10px
//     span
//       white-space pre-wrap
//       margin 0
//       text-shadow $regular 0 0 0.05em
//     &::before
//       position: absolute
//       top: 0
//       width: 12px
//       height: 40px
//       content "\e900"
//       font-family 'tim' !important
//       font-size 24px // 32px 在mac上会模糊 24px正常
//   .message-received
//     background-color $white
//     margin-left 15px
//     border-radius 0 4px 4px 4px
//     &::before
//       left -10px
//       transform scaleX(-1)
//       color $white
//     &.new
//       transform: scale(0);
//       transform-origin: top left;
//       animation: bounce 500ms linear both;
//   .message-send
//     background-color $light-primary
//     margin-right 15px
//     border-radius 4px 0 4px 4px
//     color $white
//     &::before
//       right: -10px
//       color $light-primary
//     &.new
//       transform: scale(0);
//       transform-origin: top right;
//       animation: bounce 500ms linear both;

// @keyframes bounce {
//   0% { transform: matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   4.7% { transform: matrix3d(0.45, 0, 0, 0, 0, 0.45, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   9.41% { transform: matrix3d(0.883, 0, 0, 0, 0, 0.883, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   14.11% { transform: matrix3d(1.141, 0, 0, 0, 0, 1.141, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   18.72% { transform: matrix3d(1.212, 0, 0, 0, 0, 1.212, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   24.32% { transform: matrix3d(1.151, 0, 0, 0, 0, 1.151, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   29.93% { transform: matrix3d(1.048, 0, 0, 0, 0, 1.048, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   35.54% { transform: matrix3d(0.979, 0, 0, 0, 0, 0.979, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   41.04% { transform: matrix3d(0.961, 0, 0, 0, 0, 0.961, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   52.15% { transform: matrix3d(0.991, 0, 0, 0, 0, 0.991, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   63.26% { transform: matrix3d(1.007, 0, 0, 0, 0, 1.007, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   85.49% { transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
//   100% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
// }
</style>
