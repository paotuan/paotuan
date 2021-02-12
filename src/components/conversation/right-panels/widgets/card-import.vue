<template>
  <div>
    <el-button type="text" size="mini" @click="visible = true">导入人物卡</el-button>
    <el-dialog title="导入人物卡(beta)" :visible.sync="visible" width="40%" @close="$refs.chooser.value = ''">
      <input ref="chooser" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
             value="选择文件" @change="handleFile" />
      <div>{{ `为玩家 ${member.nameCard || member.nick || member.userID} 导入人物卡` }}</div>
      <div v-if="user">
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

export default {
  props: ['groupId', 'member'],
  data() {
    return {
      visible: false,
      user: null,
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
          console.log('xlsx 不合法', e)
        }
        // this.$refs.chooser.value = ''
      }
      reader.readAsArrayBuffer(f)
    },
    onConfirm() {
      this.$store.commit('setUserCard', { groupId: this.groupId, userId: this.member.userID, card: this.user })
      this.$store.commit('showMessage', {
        type: 'success',
        message: '导入成功'
      })
      this.visible = false
    }
  }
}
</script>
<style scoped>
.user-skill, .user-prop {
  display: grid;
  grid-template-columns: repeat(auto-fill, 120px);
}
</style>