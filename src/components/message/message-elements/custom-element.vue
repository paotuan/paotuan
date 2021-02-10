<template>
<!--<message-bubble :isMine=isMine :message=message>-->
<!--  <div class="custom-element-wrapper">-->
<!--    <span class="text">-->
<!--      {{text}}-->
<!--    </span>-->
<!--  </div>-->
<!--</message-bubble>-->
  <div class="group-tip-element-wrapper">{{text}}</div>
</template>

<script>
import { mapState } from 'vuex'
import MessageBubble from '../message-bubble'

export default {
  name: 'CustomElement',
  props: {
    payload: {
      type: Object,
      required: true
    },
    message: {
      type: Object,
      required: true
    },
    isMine: {
      type: Boolean
    }
  },
  components: {
    MessageBubble,
  },
  computed: {
    ...mapState({
      currentUserProfile: state => state.user.currentUserProfile
    }),
    text() {
      return this.translateCustomMessage(this.payload)
    },
  },
  methods: {
    translateCustomMessage(payload) {
      return payload.description
    }
  }
}
</script>

<style lang="stylus" scoped>
.text
  font-weight bold

.group-tip-element-wrapper
  background $white
  padding 4px 15px
  border-radius 3px
  color $secondary
  font-size 12px
// text-shadow $secondary 0 0 0.05em
</style>
