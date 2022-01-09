<template>
  <el-switch :value="currentGame.botEnabled" :disabled="botSwitchLoading" @change="onBotSwitch"/>
</template>
<script>
import { mapState } from 'vuex'
import { loadLibs } from '@/sdk/bot'

export default {
  data() {
    return {
      botSwitchLoading: false, // 这个作为一个局部状态理论上是不严谨的，但是考虑到是瞬间状态所以无所谓了
    }
  },
  computed: {
    ...mapState({
      groupID: state => state.conversation.currentConversation.groupProfile.groupID,
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID]
    })
  },
  methods: {
    async onBotSwitch(enabled) {
      this.botSwitchLoading = true
      try {
        // 加载骰子所需的库
        await loadLibs()
        await this.$store.dispatch('toggleBotEnabled', { groupId: this.groupID, enabled })
      } catch(e) {
        this.$store.commit('showMessage', {
          type: 'error',
          message: '切换机器人失败，请联系管理员',
        })
        console.log('切换 bot 失败', e)
      } finally {
        this.botSwitchLoading = false
      }
    },
  }
}
</script>
