<template>
  <div>
    {{ JSON.stringify(currentCard) }}
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  props: ['member'],
  computed: {
    ...mapState({
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID],
      currentCard: function () { return this.currentGame.cards[this.member] }
    }),
  }
}
</script>