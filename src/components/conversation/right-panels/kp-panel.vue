<template>
  <div>
    <span>启用骰子</span>
    <el-switch v-model="botEnable" :disabled="botSwitchLoading" @change="onBotSwitch" />
  </div>
</template>
<script>
import { Switch } from 'element-ui'
import { initBotimInstance } from '@/tim'

export default {
  props: ['groupProfile'],
  components: {
    ElSwitch: Switch,
  },
  data() {
    return {
      botEnable: false,
      botSwitchLoading: false,
    }
  },
  methods: {
    onBotSwitch(enable) {
      if (enable) {
        this.initBot()
      }
    },

    initBot() {
      initBotimInstance(this.groupProfile.groupID)
    }
  }
}
</script>