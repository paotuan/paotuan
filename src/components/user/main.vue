<template>
  <el-row>
    <el-col :span="5">
      <profile-bar/>
      <side-bar/>
    </el-col>
    <el-col :span="19">
      <current-conversation v-if="showCurrentConversation"/>
      <div v-else class="conversation-empty">
        <el-button type="primary" @click="$store.commit('updateCreateGroupModelVisible', true)">&gt;&gt; 发起跑团 &lt;&lt;</el-button>
      </div>
    </el-col>
    <image-previewer/>
  </el-row>
</template>
<script>
import CurrentConversation from '@/components/conversation/current-conversation'
import SideBar from '@/components/layout/side-bar'
import ProfileBar from '@/components/layout/profile-bar'
import ImagePreviewer from '@/components/message/image-previewer.vue'
import {mapState} from 'vuex'

export default {
  name: 'Main',
  components: {
    SideBar,
    CurrentConversation,
    ImagePreviewer,
    ProfileBar,
  },
  computed: {
    ...mapState({
      currentConversation: state => state.conversation.currentConversation,
    }),
    // 是否显示当前会话组件
    showCurrentConversation() {
      return !!this.currentConversation.conversationID
    },
  }
}
</script>
<style scoped>
.conversation-empty {
  height: 100vh;
  line-height: 100vh;
  text-align: center;
  background-color: white;
}
</style>
