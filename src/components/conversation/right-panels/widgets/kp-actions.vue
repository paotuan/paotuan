<template>
  <div>
    <div>
      <el-button type="text" @click="sendBgmVisible = true">设置游戏 BGM</el-button>
    </div>
    <div>
      <el-button type="text" @click="sendTextVisible = true">发布文字笔记</el-button>
    </div>
    <div>
      <el-button type="text" @click="$refs.noteImgPicker.click()">发布图片笔记</el-button>
    </div>
    <input
        type="file"
        id="noteImgPicker"
        ref="noteImgPicker"
        accept=".jpg, .jpeg, .png, .gif, .bmp"
        @change="sendNoteImage"
        style="display:none"
    />
    <el-dialog title="设置 bgm" :visible.sync="sendBgmVisible" width="40%">
      <div>设置 bgm，bgm 将对全部群员可见。如多次设置，则会覆盖之前设置的 bgm。</div>
      <div>bgm 链接需符合指定的格式</div>
      <ul>
        <li>网易云音乐
          <ul>
            <li>歌单：https://music.163.com/#/playlist?id=xxxxxxx</li>
            <li>单曲：https://music.163.com/#/song?id=xxxxxxx</li>
            <li>专辑：https://music.163.com/#/album?id=xxxxxxx</li>
          </ul>
        </li>
      </ul>
      <el-input placeholder="请输入音乐链接" v-model="bgmLink" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="sendBgmVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="bgmLink.trim().length === 0" @click="setBgm">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="发布文字笔记" :visible.sync="sendTextVisible" width="40%">
      <el-input
          type="textarea"
          :rows="5"
          placeholder="请输入内容"
          v-model="textContent"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="sendTextVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="textContent.trim().length === 0" @click="sendNoteText">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      sendBgmVisible: false, // 发送 bgm 弹窗
      bgmLink: '', // 用户输入的 bgm 链接
      sendTextVisible: false, // 发送文字笔记弹窗
      textContent: '',
    }
  },
  computed: {
    ...mapState({
      groupProfile: state => state.conversation.currentConversation.groupProfile,
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID],
    })
  },
  methods: {
    setBgm() {
      const result = this.bgmLink.match(/https:\/\/music\.163\.com\/#\/(playlist|song|album)\?id=(\d+)/)
      if (!result) {
        this.$store.commit('showMessage', {
          type: 'error',
          message: '链接格式不正确',
        })
        return
      }
      const bgmData = {
        platform: 1,
        type: ['playlist', 'album', 'song'].indexOf(result[1]),
        id: Number(result[2])
      }
      const message = this.tim.createCustomMessage({
        to: this.groupProfile.groupID,
        conversationType: this.TIM.TYPES.CONV_GROUP,
        priority: this.TIM.TYPES.MSG_PRIORITY_HIGH, // 标注为高优先级
        payload: {
          data: JSON.stringify({ mtype: 'bgm', mdata: bgmData }),
          description: '主持人设置了新的 bgm，快点击右侧【重要信息】面板查看吧',
        }
      })
      this._sendNoteMessage(message)
      this.bgmLink = ''
      this.sendBgmVisible = false
    },
    sendNoteText() {
      let msg = this.tim.createTextMessage({
        to: this.groupProfile.groupID,
        conversationType: this.TIM.TYPES.CONV_GROUP,
        priority: this.TIM.TYPES.MSG_PRIORITY_HIGH, // 标注为高优先级
        payload: {
          text: this.textContent
        }
      })
      this._sendNoteMessage(msg)
      this.textContent = ''
      this.sendTextVisible = false
    },
    sendNoteImage() {
      const message = this.tim.createImageMessage({
        to: this.groupProfile.groupID,
        conversationType: this.TIM.TYPES.CONV_GROUP,
        priority: this.TIM.TYPES.MSG_PRIORITY_HIGH, // 标注为高优先级
        payload: {
          file: document.getElementById('noteImgPicker')
        },
      })
      this._sendNoteMessage(message)
      this.$refs.noteImgPicker.value = null
    },
    _sendNoteMessage(message) {
      this.$store.commit('pushCurrentMessageList', message)
      this.tim.sendMessage(message)
        .then(() => {
          this.$store.dispatch('handleKPNote', [message])
        })
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