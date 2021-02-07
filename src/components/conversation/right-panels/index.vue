<template>
  <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
    <el-tab-pane label="群信息" name="first">
      <group-profile :groupProfile="currentConversation.groupProfile" />
    </el-tab-pane>
    <el-tab-pane label="主持人面板" name="second">
      <kp-panel :groupProfile="currentConversation.groupProfile" />
    </el-tab-pane>
    <el-tab-pane label="重要信息" name="third">
      <info-panel />
    </el-tab-pane>
    <el-tab-pane label="Log 录制" name="fourth">
      <log-panel :group-profile="currentConversation.groupProfile" />
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import { mapState } from 'vuex'
import GroupProfile from '../conversationProfile/group-profile.vue'
import KpPanel from './kp-panel'
import LogPanel from './log-panel'
import InfoPanel from './info-panel'

export default {
  name: 'RightPanel',
    components: {
      LogPanel,
      KpPanel,
      InfoPanel,
      GroupProfile,
    },
  data() {
    return {
      activeName: 'first'
    }
  },
  computed: {
    ...mapState({
      currentConversation: state => state.conversation.currentConversation
    })
  },
  methods: {
    handleClick(tab, event) {
      // console.log(tab, event);
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
</style>