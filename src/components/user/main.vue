<template>
  <el-row>
    <el-col :span="5">
      <profile-bar/>
      <side-bar/>
    </el-col>
    <el-col :span="19">
      <current-conversation/>
    </el-col>
    <image-previewer/>
  </el-row>
</template>
<script>
import CurrentConversation from '@/components/conversation/current-conversation'
import SideBar from '@/components/layout/side-bar'
import ProfileBar from '@/components/layout/profile-bar'
import ImagePreviewer from '@/components/message/image-previewer.vue'

export default {
  name: 'Main',
  components: {
    SideBar,
    CurrentConversation,
    ImagePreviewer,
    ProfileBar,
  },
}
</script>
