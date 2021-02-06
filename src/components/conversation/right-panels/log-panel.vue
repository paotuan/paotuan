<template>
  <div>
    <div>
      <span>启用 log</span>
      <el-switch
          :value="currentGame.logEnabled"
          @input="$store.commit('toggleLogEnabled', { groupId: groupProfile.groupID, enabled: $event })"
      />
    </div>
    <div>
      <div v-for="log in currentGame.logs" :key="log.id">
        <div :title="log.from">{{ log.nick || log.from }}</div>
        <div :title="log.time">{{ log.content }}</div>
      </div>
    </div>
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
  computed: {
    ...mapState({
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID]
    }),
  }
}
</script>