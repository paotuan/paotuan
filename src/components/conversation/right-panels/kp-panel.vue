<template>
  <div>
    <span>启用骰子</span>
    <el-switch :value="currentGame.botEnabled" :disabled="botSwitchLoading" @change="onBotSwitch"/>
  </div>
</template>
<script>
import { Switch } from 'element-ui'
import { mapState } from 'vuex'

export default {
  props: ['groupProfile'],
  components: {
    ElSwitch: Switch,
  },
  data() {
    return {
      botSwitchLoading: false, // 这个作为一个局部状态理论上是不严谨的，但是考虑到是瞬间状态所以无所谓了
    }
  },
  computed: {
    ...mapState({
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID]
    })
  },
  methods: {
    onBotSwitch(enabled) {
      this.botSwitchLoading = true
      this.$store.dispatch('toggleBotEnabled', { groupId: this.groupProfile.groupID, enabled })
          .catch((e) => {
            console.log('切换 bot 失败', e)
          })
          .finally(() => {
            this.botSwitchLoading = false
          })
    },
  }
}
</script>