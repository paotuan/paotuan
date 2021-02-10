<template>
  <div>
    <div class="log-switch">
      <div class="label">启用 Log</div>
      <el-switch
          :value="currentGame.logEnabled"
          @input="$store.commit('toggleLogEnabled', { groupId: groupProfile.groupID, enabled: $event })"
      />
    </div>
    <div class="btn-container">
      <el-button-group>
        <el-button size="small">导出为文本</el-button>
        <el-button size="small">导出为HTML</el-button>
        <el-button size="small">导出为JSON</el-button>
        <el-button type="danger" size="small" @click="clearAllLogs">清空</el-button>
      </el-button-group>
    </div>
<!--    <el-card v-show="currentGame.logs.length > 0" shadow="never">-->
      <draggable
          class="log-container"
          handle=".handle"
          ghost-class="moving"
          :value="currentGame.logs"
          @input="$store.commit('updateLogs', { groupId: groupProfile.groupID, logs: $event })">
        <div v-for="log in currentGame.logs" :key="log.id" class="log-item">
          <div>
            <i class="el-icon-rank handle"/>
            <div :title="log.from" class="nick">{{ log.nick || log.from }}</div>
            <div :title="log.time" class="content">{{ log.content }}</div>
          </div>
          <i class="el-icon-close delete" @click="onDeleteLog(log.id)"/>
        </div>
      </draggable>
<!--    </el-card>-->
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
    },
    clearAllLogs() {
      this.$store.commit('updateLogs', { groupId: this.groupProfile.groupID, logs: [] })
    }
  }
}
</script>
<style lang="stylus" scoped>
::v-deep .moving {
  background-color: rgb(238, 238, 238);
}

.log-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 20px;
  padding: 15px 0;
  border-bottom: 1px solid #DCDFE6
}

.label {
  font-size: 14px;
  color: $base;
}

.btn-container {
  width: max-content;
  margin: 20px auto;
}

.log-container {
  margin: 0 10px;
}

.log-item {
  display: flex;
  justify-content: space-between;
  margin 10px 0

  & > div {
    display: flex;
  }

  &:hover {
    .handle, .delete {
      visibility visible
    }
  }
}

.nick {
  word-break break-all
  font-weight bold
  margin 0 5px
  font-size 14px
  flex-shrink 0
}

.content {
  word-break break-all
  margin 0 5px
  font-size 14px
}

.handle {
  cursor move
  visibility hidden
  color $secondary
  font-weight bold
}

.delete {
  cursor pointer
  visibility hidden
  color $danger
  font-weight bold
}
</style>