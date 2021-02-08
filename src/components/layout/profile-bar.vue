<template>
  <div class="profile-container">
    <my-profile />
    <div>
      <div class="nick">{{ currentUserProfile.nick }}</div>
      <div class="uid">{{ currentUserProfile.userID }}</div>
    </div>
  </div>
</template>
<script>
import MyProfile from '../../components/my-profile'
import { mapState } from 'vuex'

export default {
  components: {
    MyProfile
  },
  computed: {
    ...mapState({
      currentUserId: state => state.user.userID,
      currentUserProfile: state => state.user.currentUserProfile,
    }),
  }
}
</script>
<style lang="stylus" scoped>
.profile-container {
  display flex
  padding 15px
  background-color $background-deep-dark
}

.nick {
  color $font-light
}

.uid {
  font-size 12px
  color $secondary
}
</style>