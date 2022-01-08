<template>
  <div>
    <el-dialog v-if="member" title="导入人物卡(beta)" :visible="visible" width="40%" @close="onClose" @update:visible="$emit('update:visible', $event)">
      <input ref="chooser" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
             value="选择文件" @change="handleFile" />
      <div>当前支持的人物卡模版：COC七版人物卡v1.6.0   <el-link type="primary" :underline="false" href="/static/cocv7.xlsx">点击下载</el-link></div>
      <h3>{{ `为玩家 ${member.nameCard || member.nick || member.userID} 导入人物卡` }}</h3>
      <el-alert v-if="existedCard" title="该玩家已有人物卡，再次导入将覆盖之前的人物卡" type="warning" show-icon :closable="false"/>
      <div v-if="user" class="card-data">
        <h3>基本信息</h3>
        <div>{{ `${user.basic.name} ${user.basic.gender} ${user.basic.age}岁 ${user.basic.job}` }}</div>
        <div>{{ `体力 ${user.basic.hp} | 理智 ${user.basic.san} | 幸运 ${user.basic.luck} | 魔法 ${user.basic.mp}` }}</div>
        <h3>属性</h3>
        <div class="user-prop">
          <div v-for="(val, name) in user.props" :key="name">
            {{ `${name}: ${val}` }}
          </div>
        </div>
        <h3>技能</h3>
        <div class="user-skill">
          <div v-for="(val, name) in user.skills" :key="name">
            {{ `${name}: ${val}` }}
          </div>
        </div>
      </div>
      <span slot="footer" v-if="user">
        <el-button type="primary" @click="onConfirm">确定导入</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import XLSX from 'xlsx'
import { parseCoCXlsx } from '@/sdk/card'
import { mapState } from 'vuex'

export default {
  props: ['groupId', 'memberId', 'visible'],
  data() {
    return {
      user: null,
    }
  },
  computed: {
    ...mapState({
      existedCard: function(state) {
        return state.game.list[this.groupId] ? state.game.list[this.groupId].cards['o' + this.memberId] : null
      },
      currentMemberList: state => state.group.currentMemberList
    }),
    member() {
      return this.memberId ? this.currentMemberList.find(member => member.userID === this.memberId) : null
    }
  },
  methods: {
    handleFile(e) {
      const files = e.target.files, f = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          this.user = parseCoCXlsx(sheet)
          // console.log(user)
        } catch (e) {
          console.log(e)
          this.$store.commit('showMessage', {
            type: 'error',
            message: '导入失败，可能是格式不正确或字段缺失'
          })
        }
        // this.$refs.chooser.value = ''
      }
      reader.readAsArrayBuffer(f)
    },
    onConfirm() {
      this.$store.commit('setUserCard', { groupId: this.groupId, userId: this.member.userID, card: this.user })
      const message = this.tim.createCustomMessage({
        to: this.groupId,
        conversationType: this.TIM.TYPES.CONV_GROUP,
        priority: this.TIM.TYPES.MSG_PRIORITY_HIGH,
        payload: {
          data: JSON.stringify({ mtype: 'card', mdata: { userId: this.member.userID, card: this.user } }),
          description: `主持人为玩家“${this.member.nameCard || this.member.nick || this.member.userID}”导入了一张人物卡`,
        }
      })
      this.$store.commit('pushCurrentMessageList', message)
      this.tim.sendMessage(message).then(() => {
        this.$store.commit('showMessage', {
          type: 'success',
          message: '导入成功'
        })
      }).catch(() => {
        this.$store.commit('showMessage', {
          type: 'error',
          message: '导入成功，但同步给其他群成员失败，可以重试'
        })
      })
      this.$emit('update:visible', false)
    },
    onClose() {
      this.$refs.chooser.value = ''
      this.user = null
    }
  }
}
</script>
<style scoped>
.user-skill, .user-prop {
  display: grid;
  grid-template-columns: repeat(auto-fill, 120px);
}

::v-deep .el-link {
  vertical-align: unset;
}

.card-data {
  height: 30vh;
  overflow: auto;
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #e7e7e7;
  border-radius: 10px;
}
</style>
