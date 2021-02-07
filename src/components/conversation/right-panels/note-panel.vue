<template>
  <div>
    <bgm :bgm="currentGame.bgm"/>
    <el-alert
        title="主持人发布的重要笔记将会显示在这里"
        type="info"
        description="你也可以把自己觉得重要的消息收藏在这里（敬请期待）"
        show-icon
    />
    <draggable
        ghost-class="moving"
        :value="currentGame.notes"
        @input="$store.commit('updateNotes', { groupId: groupProfile.groupID, notes: $event })">
      <el-card v-for="note in currentGame.notes" :key="note.id">
        <div v-if="note.type === TIM.TYPES.MSG_TEXT">{{ note.payload }}</div>
        <img v-else-if="note.type === TIM.TYPES.MSG_IMAGE" class="note-img" :src="formatUrl(note.payload)"
             @click="handlePreview(note.payload)"/>
      </el-card>
    </draggable>
  </div>
</template>
<script>
import bgm from './widgets/bgm'
import { mapState } from 'vuex'
import draggable from 'vuedraggable'

export default {
  props: ['groupProfile'],
  components: {
    bgm,
    draggable,
  },
  computed: {
    ...mapState({
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID]
    })
  },
  methods: {
    formatUrl(url) {
      return url.slice(0, 2) === '//' ? `https:${url}` : url
    },
    handlePreview(url) {
      this.$bus.$emit('image-preview', { url })
    },
  }
}
</script>
<style scoped>
.note-img {
  width: 100%;
  cursor: zoom-in;
}

::v-deep .moving {
  background-color: rgb(238, 238, 238);
}
</style>