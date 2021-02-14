<template>
  <div class="group-member-list-wrapper">
    <div class="header">
      <span class="member-count text-ellipsis">群成员：{{members.length}}</span>
      <i class="el-icon-link" title="复制邀请链接" @click="copyInviteLink" />
      <i class="el-icon-refresh" title="刷新群成员信息" @click="refreshGroupMember" />
      <!-- sdk 限制公开群不能邀请入群，只能申请加群 -->
<!--      <popover v-model="addGroupMemberVisible">-->
<!--        <add-group-member></add-group-member>-->
<!--        <div slot="reference" class="btn-add-member" title="添加群成员">-->
<!--          <span class="tim-icon-friend-add"></span>-->
<!--        </div>-->
<!--      </popover>-->
    </div>
    <div class="scroll-content">
      <div class="group-member-list">
        <div v-for="member in members" :key="member.userID">
<!--          <popover placement="right" :key="member.userID">-->
<!--            <group-member-info :member="member" />-->
            <div slot="reference" class="group-member" @click="currentMemberID = member.userID">
              <div class="info">
                <avatar :title=getGroupMemberAvatarText(member.role) :src="member.avatar" />
                <div class="names">
                  <div class="member-name text-ellipsis">{{ getShowUserNick(member) }}</div>
                  <div class="member-id">{{ getShowUserId(member) }}</div>
                </div>
              </div>
              <div class="actions">
                <el-popover v-if="isOwner && isBotOfThisGroup(member)" title="修改机器人头像" placement="top" trigger="click">
                  <el-input
                      v-model="botAvatar"
                      placeholder="请输入头像 URL"
                      @keydown.enter.native="setBotAvatar(member.userID)"
                  />
                  <el-button slot="reference" class="action-btn" title="修改机器人头像" icon="el-icon-picture-outline" size="mini" circle/>
                </el-popover>
                <el-popover v-if="isOwner" title="修改群名片" placement="top" trigger="click">
                  <el-input
                      v-model="nameCard"
                      placeholder="请输入群名片"
                      @keydown.enter.native="setGroupMemberNameCard(member.userID)"
                  />
                  <el-button slot="reference" class="action-btn" title="修改群名片" icon="el-icon-edit" size="mini" circle/>
                </el-popover>
<!--                <el-button v-if="isOwner && member.role !== 'Owner'" type="danger" icon="el-icon-turn-off-microphone" size="mini" circle/>-->
                <el-popconfirm v-if="isOwner && member.role !== 'Owner'" :title="`将${getShowUserNick(member)}踢出群组？`"
                               placement="top" trigger="click" @confirm="kickoutGroupMember(member.userID)">
                  <el-button slot="reference" class="action-btn" title="踢出群聊" type="danger" icon="el-icon-delete" size="mini" circle/>
                </el-popconfirm>
                <div class="coc-card" :class="{ isBot: member.userID.startsWith('bot') }">
                  <div>
                    <el-button type="text" size="mini" @click="openUserCard(member.userID)">查看人物卡</el-button>
                  </div>
                  <card-import v-if="isOwner" :group-id="groupProfile.groupID" :member="member" />
                </div>
              </div>
            </div>
<!--          </popover>-->
        </div>
      </div>
    </div>
<!--    <div class="more">-->
<!--      <el-button v-if="showLoadMore" type="text" @click="loadMore">查看更多</el-button>-->
<!--    </div>-->
  </div>
</template>

<script>
import { Popover } from 'element-ui'
import { mapState } from 'vuex'
// import AddGroupMember from './add-group-member.vue'
// import GroupMemberInfo from './group-member-info.vue'
import { generateShareSig, setBotAvatar } from '@/tim'
import CardImport from '../right-panels/widgets/card-import'

export default {
  data() {
    return {
      addGroupMemberVisible: false,
      currentMemberID: '',
      count: 30, // 显示的群成员数量

      botAvatar: '', // 机器人头像 url 输入框
      nameCard: '', // 群名片输入框
    }
  },
  props: ['groupProfile'],
  components: {
    CardImport,
    Popover,
    // AddGroupMember,
    // GroupMemberInfo
  },
  computed: {
    ...mapState({
      currentConversation: state => state.conversation.currentConversation,
      currentMemberList: state => state.group.currentMemberList
    }),
    showLoadMore() {
      return this.members.length < this.groupProfile.memberCount
    },
    members() {
      return this.currentMemberList//.slice(0, this.count)
    },
    isOwner() {
      return this.groupProfile.selfInfo.role === this.TIM.TYPES.GRP_MBR_ROLE_OWNER
    },
  },
  methods: {
    getGroupMemberAvatarText(role) {
      switch (role) {
        case 'Owner':
          return '群主'
        case 'Admin':
          return '管理员'
        default:
          return '群成员'
      }
    },
    getShowUserNick(member) {
      // 优先级：群名片、昵称、id
      return member.nameCard || member.nick || member.userID
    },
    getShowUserId(member) {
      if (member.userID.startsWith('bot')) {
        return '机器人'
      } else if (member.nameCard || member.nick) {
        return member.userID
      } else {
        return '' // 如果没有设置用户名和昵称，也不显示
      }
    },
    isBotOfThisGroup(member) {
      // if (!this.groupProfile) return false
      // 精确判断是自己群的机器人，以防万一其他机器人乱入
      return this.groupProfile.groupID.replace('@TGS#', 'bot_') === member.userID
    },
    loadMore() {
      this.$store
        .dispatch('getGroupMemberList', this.groupProfile.groupID)
        .then(() => {
          this.count += 30
        })
    },
    copyInviteLink() {
      this.$copyText(`${location.origin}/#/?s=${generateShareSig()}&g=${this.groupProfile.groupID.replace('@TGS#', '')}&d=\n点击链接加入群聊一起玩~`)
        .then(() => {
          this.$store.commit('showMessage', {
            type: 'success',
            message: '邀请链接复制成功！快发给小伙伴们一起玩吧~'
          })
        })
        .catch((e) => {
          console.log('copy link error', e)
          this.$store.commit('showMessage', {
            type: 'error',
            message: '邀请链接复制失败'
          })
        })
    },
    refreshGroupMember() {
      // 群成员更新资料后不会自动同步，这里给个功能让玩家可以手动刷新
      this.$store.dispatch('getGroupMemberList', this.currentConversation.groupProfile.groupID)
        .then(() => {
          this.$store.commit('showMessage', {
            type: 'success',
            message: '刷新成功'
          })
        })
    },
    setBotAvatar() {
       setBotAvatar(this.currentConversation.groupProfile.groupID, this.botAvatar)
        .then(() => {
          this.botAvatar = ''
          this.$store.commit('showMessage', {
            message: '修改成功'
          })
        })
        .catch(error => {
          console.log(error)
          this.$store.commit('showMessage', {
            type: 'error',
            message: '修改头像失败，请检查是否启用机器人，未启用状态不能修改'
          })
        })
    },
    setGroupMemberNameCard(userID) {
      this.tim
        .setGroupMemberNameCard({
          groupID: this.currentConversation.groupProfile.groupID,
          userID: userID,
          nameCard: this.nameCard
        })
        .then(() => {
          this.nameCard = ''
          this.$store.commit('showMessage', {
            message: '修改成功'
          })
        })
        .catch(error => {
          this.$store.commit('showMessage', {
            type: 'error',
            message: error.message
          })
        })
    },
    kickoutGroupMember(userID) {
      this.tim
        .deleteGroupMember({
          groupID: this.currentConversation.groupProfile.groupID,
          reason: '被群主踢出',
          userIDList: [userID]
        })
        .then(() => {
          this.$store.commit('deleteGroupMemeber', userID)
        })
        .catch(error => {
          this.$store.commit('showMessage', {
            type: 'error',
            message: error.message
          })
        })
    },
    openUserCard(userId) {
      this.$store.dispatch('openUserCard', { groupId: this.currentConversation.groupProfile.groupID, userId })
          .catch(() => {
            this.$store.commit('showMessage', {
              type: 'warning',
              message: '该成员尚未导入人物卡'
            })
          })
    }
  }
}
</script>

<style lang="stylus" scoped>
.group-member-list-wrapper
  .header
    height 50px
    padding 10px 16px 10px 20px
    border-bottom 1px solid $border-base
    .member-count
      display inline-block
      max-width 130px
      line-height 30px
      font-size 14px
      vertical-align bottom
    .btn-add-member
      width 30px
      height 30px
      font-size 28px
      text-align center
      line-height 32px
      cursor pointer
      float right
      &:hover
        color $light-primary
  .scroll-content
    /*max-height: 250px;*/
    /*overflow-y: scroll;*/
    padding 10px 15px 10px 15px
    width 100%
    .group-member-list
      /*display flex*/
      /*justify-content flex-start*/
      /*flex-wrap wrap*/
      width 100%
    .group-member
      height 70px
      display: flex;
      align-items center
      justify-content space-between
      color: $base;
      margin: 0 10px;
      .avatar
        width 40px
        height 40px
        border-radius 50%
        margin-right 20px
      .info
        display flex
      .names
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      .member-name
        font-size 14px
        width: 100px
        /*text-align center*/
      .member-id
        font-size 12px
        color $secondary
      .actions
        display flex
        align-items center
      .action-btn
        margin-left 10px
      .coc-card
        margin-left 20px
        &.isBot
          visibility hidden
  .more
    padding 0 20px
    border-bottom 1px solid $border-base

// .add-group-member {
//   cursor: pointer;
// }
// .add-button {
//   border: 1px solid gray;
//   text-align: center;
//   line-height: 30px;
// }

.el-icon-link, .el-icon-refresh
  width 30px
  height 30px
  font-size 24px
  text-align center
  line-height 32px
  cursor pointer
  float right
  &:hover
    color $light-primary

// 一些视觉效果调整
.el-icon-refresh
  margin-right 10px
  font-size 22px
  margin-top -1px

.tim-icon-friend-add
  font-size 24px
  margin-right 20px

</style>
