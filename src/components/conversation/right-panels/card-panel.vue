<template>
  <div style="padding: 20px">
    <div class="simple-info">
      <div>{{ currentCard.basic.name }}</div>
      <div>{{ currentCard.basic.gender }}</div>
      <div>{{ `${currentCard.basic.age}岁` }}</div>
      <div>{{ currentCard.basic.job }}</div>
    </div>
    <div class="tips">点击下方对应的数值格子可以快速投骰；<br>点击属性名称可以复制；<br>点击表头可以将属性和技能按成功率排序。</div>
    <el-table :data="[currentCard.basic]" row-class-name="row" header-row-class-name="row" @cell-click="onBasicClick">
      <el-table-column prop="hp" label="体力"/>
      <el-table-column prop="san" label="理智"/>
      <el-table-column prop="luck" label="幸运"/>
      <el-table-column prop="mp" label="魔法"/>
    </el-table>
    <div class="section">
      <h4 class="section-title">基础属性</h4>
      <el-input v-model="searchProp" clearable prefix-icon="el-icon-search" size="mini" style="width: 150px" />
    </div>
    <el-table :data="filterProps()" stripe
              row-class-name="row" header-row-class-name="row" @cell-click="onCellClick">
      <el-table-column prop="name" label="属性"/>
      <el-table-column prop="value" sortable label="%"/>
      <el-table-column label="半值">
        <template slot-scope="scope">{{ Math.floor(scope.row.value / 2) }}</template>
      </el-table-column>
      <el-table-column label="1/5值">
        <template slot-scope="scope">{{ Math.floor(scope.row.value / 5) }}</template>
      </el-table-column>
    </el-table>
    <div class="section">
      <h4 class="section-title">技能表</h4>
      <el-input v-model="searchSkill" clearable prefix-icon="el-icon-search" size="mini" style="width: 150px" />
    </div>
    <el-table :data="filterSkills()" stripe
              row-class-name="row" header-row-class-name="row" @cell-click="onCellClick">
      <el-table-column type="selection" width="30" class-name="select-col"/>
      <el-table-column prop="name" label="属性" width="105"/>
      <el-table-column prop="value" sortable label="%"/>
      <el-table-column label="半值">
        <template slot-scope="scope">{{ Math.floor(scope.row.value / 2) }}</template>
      </el-table-column>
      <el-table-column label="1/5值">
        <template slot-scope="scope">{{ Math.floor(scope.row.value / 5) }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  props: ['member'],
  data() {
    return {
      searchProp: '',
      searchSkill: ''
    }
  },
  computed: {
    ...mapState({
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID],
      currentCard: function () { return this.currentGame.cards['o' + this.member] }
    }),
    props: function () {
      return Object.keys(this.currentCard.props).map(name => ({ name, value: this.currentCard.props[name] }))
    },
    skills: function () {
      return Object.keys(this.currentCard.skills).map(name => ({ name, value: this.currentCard.skills[name] }))
    },
  },
  methods: {
    filterProps() {
      return this.searchProp === '' ? this.props : this.props.filter(skill => skill.name.includes(this.searchProp))
    },
    filterSkills() {
      return this.searchSkill === '' ? this.skills : this.skills.filter(skill => skill.name.includes(this.searchSkill))
    },
    onCellClick(row, col) {
      // 1. 如果点属性名称，则复制
      if (col.label === '属性') {
        this.$copyText(row.name)
            .then(() => {
              this.$store.commit('showMessage', {
                type: 'success',
                message: '复制成功'
              })
            })
        return
      }
      // 2. 如果点数值，则投骰
      let hard = col.label === '半值' ? '困难' : (col.label === '1/5值' ? '极难' : '')
      // 复用发消息方式
      let ghost = document.getElementById('ghost-message-send-box')
      ghost.innerText = '.d% ' + hard + row.name
      ghost.click()
    },
    onBasicClick(_, col) {
      if (col.label === '理智' || col.label === '幸运') {
        let ghost = document.getElementById('ghost-message-send-box')
        ghost.innerText = '.d% ' + col.label
        ghost.click()
      }
    },
  }
}
</script>
<style lang="stylus" scoped>
.simple-info
  display flex
  //justify-content space-between
  margin-left 10px

  & > div
    font-size 14px
    color $base
    margin-right 20px

.tips {
  margin 5px 0 10px 10px
  font-size 14px
  color $secondary
}

::v-deep .row {
  td, th {
    padding: 6px 0;
  }
}

.section
  display flex
  justify-content space-between
  align-items flex-end

.section-title
  margin-bottom 0

::v-deep .select-col .cell
  text-overflow unset
</style>