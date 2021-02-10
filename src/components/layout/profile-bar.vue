<template>
  <div class="profile-container">
    <my-profile />
    <div class="base-info">
      <div class="nick">{{ currentUserProfile.nick || currentUserProfile.userID }}</div>
      <div class="uid">{{ currentUserProfile.userID }}</div>
    </div>
    <div class="header-bar">
      <button title="刷新列表" @click="handleRefresh">
        <i class="tim-icon-refresh"></i>
      </button>
      <el-dropdown @command="handleCreateChat">
        <button class="btn2" title="创建会话">
          <i class="tim-icon-add"></i>
        </button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="group">创建群聊</el-dropdown-item>
          <el-dropdown-item command="c2c">发起单聊</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog title="发起会话" :visible.sync="showC2CDialog" width="40%">
      <el-input placeholder="请输入用户ID(QQ号)" v-model="userID" @keydown.enter.native="handleCreateC2C"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showC2CDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleCreateC2C">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="创建群组" :visible="createGroupModelVisible"
               @close="$store.commit('updateCreateGroupModelVisible', false)" width="40%">
      <create-group />
    </el-dialog>
  </div>
</template>
<script>
import MyProfile from '../../components/my-profile'
import CreateGroup from '../../components/group/create-group'
import { mapState } from 'vuex'

export default {
  components: {
    MyProfile,
    CreateGroup,
  },
  data() {
    return {
      showC2CDialog: false,
      userID: '',
      timeout: null,
    }
  },
  computed: {
    ...mapState({
      currentUserId: state => state.user.userID,
      currentUserProfile: state => state.user.currentUserProfile,
      createGroupModelVisible: state => state.group.createGroupModelVisible,
    }),
  },
  methods: {
    handleRefresh() {
      this.refreshConversation()()
    },
    refreshConversation() {
      let that = this
      return function () {
        if (!that.timeout) {
          that.timeout = setTimeout(() =>{
            that.timeout = null
            that.tim.getConversationList().then(() => {
              that.$store.commit('showMessage', {
                message: '刷新成功',
                type: 'success'
              })
            })
          }, 1000)
        }
      }
    },
    handleCreateChat(cmd) {
      console.log(cmd)
      if (cmd === 'c2c') {
        this.showC2CDialog = true
      } else {
        this.$store.commit('updateCreateGroupModelVisible', true)
      }
    },
    handleCreateC2C() {
      if (this.userID !== '@TIM#SYSTEM') {
        this.$store
            .dispatch('checkoutConversation', `C2C${this.userID}`)
            .then(() => {
              this.showC2CDialog = false
            }).catch(() => {
          this.$store.commit('showMessage', {
            message: '没有找到该用户',
            type: 'warning'
          })
        })
      } else {
        this.$store.commit('showMessage', {
          message: '没有找到该用户',
          type: 'warning'
        })
      }
      this.userID = ''
    }
  }
}
</script>
<style lang="stylus" scoped>
.profile-container
  display flex
  padding 15px
  background-color $background-deep-dark

.base-info
  display flex
  flex-direction column
  justify-content space-between
  flex-grow 1

.nick
  color $font-light

.uid
  font-size 12px
  color $secondary

.header-bar
  button
    float right
    display: inline-block;
    cursor: pointer;
    background $background-deep-dark
    border: none
    color: $font-dark;
    box-sizing: border-box;
    transition: .3s;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    padding 0
    width 30px
    height 30px
    line-height 34px
    font-size: 24px;
    text-align: center;
    white-space: nowrap;
    border-radius: 50%
    outline 0
    &:hover
      // background $light-primary
      // color $white
      transform: rotate(360deg);
      color $light-primary

  .btn2
    margin-right 10px
</style>