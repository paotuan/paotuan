<template>
  <bgm :bgm="currentGame.bgm"/>
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