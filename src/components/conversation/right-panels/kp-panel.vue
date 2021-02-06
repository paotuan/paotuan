<template>
  <div>
    <span>启用骰子</span>
    <el-switch :value="currentGame.botEnabled" :disabled="botSwitchLoading" @change="onBotSwitch" />
  </div>
</template>
<script>
import { Switch } from 'element-ui'
import { initBotimInstance } from '@/tim'
import { mapState } from 'vuex'

export default {
  props: ['groupProfile'],
  components: {
    ElSwitch: Switch,
  },
  data() {
    return {
      botEnable: this.currentGame.botEnabled,
      botSwitchLoading: false,
    }
  },
  computed: {
    ...mapState({
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID]
    })
  },
  methods: {
    onBotSwitch(enabled) {
      this.$store.commit('toggleBotEnabled', { groupId: this.groupProfile.groupID, enabled })
      if (enabled) {
        // this.initBot()
      }
    },

    initBot() {
      initBotimInstance(this.groupProfile.groupID)
    }
  }
}
</script>