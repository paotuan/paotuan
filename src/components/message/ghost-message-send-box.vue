<template>
  <div id="ghost-message-send-box" ref="ghost" style="display: none" @click="send" />
</template>
<script>
export default {
  props: ['toAccount', 'currentConversationType'],
  methods: {
    send() {
      const content = this.$refs.ghost.innerText
      if (content.trim().length === 0) return
      const message = this.tim.createTextMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: { text: content }
      })
      this.$store.commit('pushCurrentMessageList', message)
      this.$bus.$emit('scroll-bottom')
      this.tim.sendMessage(message).catch(error => {
        this.$store.commit('showMessage', {
          type: 'error',
          message: error.message
        })
      })
      this.$refs.ghost.innerText = ''
    }
  }
}
</script>