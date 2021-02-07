<template>
  <div>
    <bgm :bgm="currentGame.bgm"/>
    <el-alert
        title="主持人发布的重要笔记将会显示在这里"
        type="info"
        description="你也可以把自己觉得重要的消息收藏在这里（敬请期待）"
        show-icon
    />
    <div>
      <el-card v-for="note in currentGame.notes" :key="note.id">
        {{ note.payload }}
      </el-card>
    </div>
  </div>
</template>
<script>
import bgm from './widgets/bgm'
import { mapState } from 'vuex'

export default {
  components: {
    bgm
  },
  computed: {
    ...mapState({
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID]
    })
  },
}
</script>