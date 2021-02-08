<template>
  <el-tabs :value="currentGame.currentTab" type="card"
           @input="$store.commit('setCurrentTab', { groupId: currentConversation.groupProfile.groupID, tab: $event })"
           @tab-click="handleClick">
    <el-tab-pane label="群信息" name="group">
      <group-profile :groupProfile="currentConversation.groupProfile" />
    </el-tab-pane>
    <el-tab-pane label="主持人面板" name="kp">
      <kp-panel :groupProfile="currentConversation.groupProfile" />
    </el-tab-pane>
    <el-tab-pane name="note">
      <el-badge slot="label" is-dot :hidden="!currentGame.noteUnread">重要笔记</el-badge>
      <note-panel :group-profile="currentConversation.groupProfile" />
    </el-tab-pane>
    <el-tab-pane label="Log 录制" name="log">
      <log-panel :group-profile="currentConversation.groupProfile" />
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import { mapState } from 'vuex'
import GroupProfile from '../conversationProfile/group-profile.vue'
import KpPanel from './kp-panel'
import LogPanel from './log-panel'
import NotePanel from './note-panel'

export default {
  name: 'RightPanel',
    components: {
      LogPanel,
      KpPanel,
      NotePanel,
      GroupProfile,
    },
  data() {
    return {
      activeName: 'group'
    }
  },
  computed: {
    // todo provide 给下面
    ...mapState({
      currentConversation: state => state.conversation.currentConversation,
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID]
    })
  },
  methods: {
    handleClick(tab) {
      // 如果点了笔记 tab 则清除红点
      if (tab.name === 'note') {
        this.$store.commit('setNoteUnread', { groupId: this.currentConversation.groupProfile.groupID, unread: false })
      }
    }
  }
}
</script>
<style scoped>
::v-deep .el-tabs {
  height: 100%;
}

::v-deep .el-tabs__item {
  height: 50px;
  line-height: 50px;
}

::v-deep .el-tabs__header {
  margin: 0;
}

::v-deep .el-tabs__content {
  height: calc(100vh - 50px); /* 50px 是减去 tab 头部的高度 */
  overflow-y: auto;
}

::v-deep .el-tabs__content::-webkit-scrollbar {
  width: 10px;
}

/* 调整红点位置 */
::v-deep .el-badge {
  display: block;
}

::v-deep .el-badge__content {
  margin-top: 15px;
}
</style>