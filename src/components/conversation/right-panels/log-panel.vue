<template>
  <div>
    <div>
      <span>启用 log</span>
      <el-switch
          :value="currentGame.logEnabled"
          @input="$store.commit('toggleLogEnabled', { groupId: groupProfile.groupID, enabled: $event })"
      />
    </div>
    <el-button-group>
      <el-button size="small">导出为文本</el-button>
      <el-button size="small">导出为HTML</el-button>
      <el-button size="small">导出为JSON</el-button>
      <el-button type="danger" size="small">清空</el-button>
    </el-button-group>
    <draggable
        handle=".handle"
        ghost-class="moving"
        :value="currentGame.logs"
        @input="$store.commit('updateLogs', { groupId: groupProfile.groupID, logs: $event })">
      <div v-for="log in currentGame.logs" :key="log.id">
        <i class="el-icon-rank handle"/>
        <div :title="log.from">{{ log.nick || log.from }}</div>
        <div :title="log.time">{{ log.content }}</div>
        <i class="el-icon-close" @click="onDeleteLog(log.id)"/>
      </div>
    </draggable>
  </div>
</template>
<script>
import { Switch } from 'element-ui'
import { mapState } from 'vuex'
import draggable from 'vuedraggable'

export default {
  props: ['groupProfile'],
  components: {
    ElSwitch: Switch,
    draggable,
  },
  computed: {
    ...mapState({
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID]
    }),
  },
  methods: {
    onDeleteLog(id) {
      this.$store.commit('updateLogs', {
        groupId: this.groupProfile.groupID,
        logs: this.currentGame.logs.filter(log => log.id !== id)
      })
    }
  }
}
</script>
<style scoped>
::v-deep .moving {
  background-color: rgb(238, 238, 238);
}
</style>