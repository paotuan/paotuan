<template>
  <el-tabs
      :value="currentGame.currentTab"
      type="card"
      class="group-right-panels background-blur"
      @input="$store.commit('setCurrentTab', { groupId: currentConversation.groupProfile.groupID, tab: $event })"
      @tab-click="handleClick"
      @tab-remove="handleRemove"
  >
    <template v-for="tab in allTabs">
      <el-tab-pane v-if="tab === 'group'" :key="tab" label="群信息" :name="tab">
        <!-- 因为内部状态多，用 key 重置之 -->
        <group-profile :key="currentConversation.groupProfile.groupID" :group-profile="currentConversation.groupProfile" />
      </el-tab-pane>
      <el-tab-pane v-else-if="tab === 'note'" :key="tab" :name="tab">
        <el-badge slot="label" is-dot :hidden="!currentGame.noteUnread">重要笔记</el-badge>
        <note-panel :group-profile="currentConversation.groupProfile" />
      </el-tab-pane>
      <el-tab-pane v-else-if="tab === 'log'" :key="tab" label="Log 录制" :name="tab">
        <log-panel :group-profile="currentConversation.groupProfile" />
      </el-tab-pane>
      <el-tab-pane v-else :key="tab" :label="getCardName(tab)" :name="tab" :closable="true">
        <card-panel :member="tab" />
      </el-tab-pane>
    </template>
  </el-tabs>
</template>
<script>
import { mapState } from 'vuex'
import GroupProfile from '../conversationProfile/group-profile.vue'
import LogPanel from './log-panel'
import NotePanel from './note-panel'
import CardPanel from './card-panel'
import Sortable from 'sortablejs'

export default {
  name: 'RightPanel',
    components: {
      LogPanel,
      NotePanel,
      CardPanel,
      GroupProfile,
    },
  data() {
    return {
      activeName: 'group'
    }
  },
  computed: {
    ...mapState({
      currentConversation: state => state.conversation.currentConversation,
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID],
      allTabs() { return this.currentGame.openedCards }
    })
  },
  mounted() {
    // init sortable
    const tabsWrapper = document.querySelector('.group-right-panels div[role=tablist]')
    Sortable.create(tabsWrapper, {
      onEnd: ({ newIndex, oldIndex }) => {
        // splice 会改变原数组，是否不好？不过无所谓，不管了
        const tab = this.allTabs.splice(oldIndex, 1)[0]
        this.allTabs.splice(newIndex, 0, tab)
        this.$store.commit('setOpenedUserCards', { groupId: this.currentConversation.groupProfile.groupID, list: this.allTabs })
      }
    })
  },
  methods: {
    handleClick(tab) {
      // 如果点了笔记 tab 则清除红点
      if (tab.name === 'note') {
        this.$store.commit('setNoteUnread', { groupId: this.currentConversation.groupProfile.groupID, unread: false })
      }
    },
    handleRemove(tab) {
      this.$store.dispatch('closeUserCard', { groupId: this.currentConversation.groupProfile.groupID, userId: tab })
    },
    getCardName(tab) {
      return this.currentGame.cards['o' + tab].basic.name
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
