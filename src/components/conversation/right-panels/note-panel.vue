<template>
  <div>
    <el-alert
        title="主持人发布的重要笔记将会显示在这里"
        type="info"
        description="你也可以把自己觉得重要的消息收藏在这里（敬请期待）"
        show-icon
    />
    <bgm :bgm="currentGame.bgm"/>
    <div ref="draggable" class="card-list">
      <el-card v-for="note in currentGame.notes" :key="note.id" class="card" shadow="hover">
        <div v-if="note.type === TIM.TYPES.MSG_TEXT" class="note-text">{{ note.payload }}</div>
        <img v-else-if="note.type === TIM.TYPES.MSG_IMAGE" class="note-img" :src="formatUrl(note.payload)"
             @click="handlePreview(note.payload)"/>
        <div class="tools">
          <el-button icon="el-icon-copy-document" size="mini" circle @click="handleCopyCard(note.payload)"/>
          <el-button icon="el-icon-close" size="mini" circle @click="handleDelete(note.id)"/>
        </div>
      </el-card>
    </div>
  </div>
</template>
<script>
import bgm from './widgets/bgm'
import { mapState } from 'vuex'
import Sortable from 'sortablejs'

export default {
  props: ['groupProfile'],
  components: {
    bgm,
  },
  computed: {
    ...mapState({
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID]
    })
  },
  mounted() {
    Sortable.create(this.$refs.draggable, {
      ghostClass: 'moving',
      onEnd: ({ newIndex, oldIndex }) => {
        // splice 会改变原数组，是否不好？不过无所谓，不管了
        const tab = this.currentGame.notes.splice(oldIndex, 1)[0]
        this.currentGame.notes.splice(newIndex, 0, tab)
        this.$store.commit('updateNotes', { groupId: this.groupProfile.groupID, notes: this.currentGame.notes })
      }
    })
  },
  methods: {
    formatUrl(url) {
      return url.slice(0, 2) === '//' ? `https:${url}` : url
    },
    handlePreview(url) {
      this.$bus.$emit('image-preview', { url })
    },
    handleCopyCard(content) {
      this.$copyText(content)
          .then(() => {
            this.$store.commit('showMessage', {
              type: 'success',
              message: '复制成功'
            })
          })
    },
    handleDelete(id) {
      const notes = this.currentGame.notes.filter(note => note.id !== id)
      this.$store.commit('updateNotes', { groupId: this.groupProfile.groupID, notes })
    },
  }
}
</script>
<style scoped>
.card-list {
  margin: 10px;
}

.card {
  position: relative;
}

.card + .card {
  margin-top: 10px;
}

.tools {
  display: none;
  position: absolute;
  right: 10px;
  top: 10px;
}

.card:hover .tools {
  display: block;
}

.note-text {
  font-size: 14px;
  word-break: break-all;
}

.note-img {
  max-width: 250px;
  cursor: zoom-in;
}

::v-deep .moving {
  background-color: rgb(238, 238, 238);
}
</style>
