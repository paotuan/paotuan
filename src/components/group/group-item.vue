<template>
  <div @click="handleGroupClick" class="scroll-container">
    <div class="group-item">
      <avatar :src="avatar" />
      <div class="group-name text-ellipsis">{{ group.name }}</div>
    </div>
  </div>
</template>

<script>
import {expandCosUrl} from '@/utils'

export default {
  props: ['group'],
  computed: {
    avatar() {
      return expandCosUrl(this.group.avatar)
    }
  },
  data() {
    return {
      visible: false,
      options: [
        {
          text: '退出群组',
          handler: this.quitGroup
        }
      ]
    }
  },
  methods: {
    handleGroupClick() {
      const conversationID = `GROUP${this.group.groupID}`
      this.$store.dispatch('checkoutConversation', conversationID)
    },
    quitGroup() {
      this.tim.quitGroup(this.group.groupID)
      .catch(error => {
          this.$store.commit('showMessage', {
            type: 'error',
            message: error.message
          })
        })
    }
  }
}
</script>

<style lang="stylus" scoped>
.scroll-container
  overflow-y scroll
  flex 1
  .group-item
    display flex
    padding 10px 20px
    cursor pointer
    position relative
    overflow hidden
    transition .2s
    &:hover
      background-color $background
    .avatar
      width 30px
      height 30px
      border-radius 50%
      margin-right 10px
      flex-shrink 0
    .group-name
      flex 1
      color $font-light
      line-height 30px
</style>
