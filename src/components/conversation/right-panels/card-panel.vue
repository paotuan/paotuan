<template>
  <div style="padding: 20px">
    <div class="simple-info">
      <div>{{ currentCard.basic.name }}</div>
      <div>{{ currentCard.basic.gender }}</div>
      <div>{{ `${currentCard.basic.age}岁` }}</div>
      <div>{{ currentCard.basic.job }}</div>
    </div>
    <div class="tips">点击下方对应的格子可以快速投骰，点击表头可以将属性和技能按成功率排序。</div>
    <el-table :data="[currentCard.basic]" row-class-name="row" header-row-class-name="row" @cell-click="onBasicClick">
      <el-table-column prop="hp" label="体力"/>
      <el-table-column prop="san" label="理智"/>
      <el-table-column prop="luck" label="幸运"/>
      <el-table-column prop="mp" label="魔法"/>
    </el-table>
    <div>
      <h4 class="section-title">基础属性</h4>
    </div>
    <el-table :data="mapData(currentCard.props)" stripe
              row-class-name="row" header-row-class-name="row" @cell-click="onCellClick">
      <el-table-column prop="name" label="属性"/>
      <el-table-column prop="value" sortable label="成功率"/>
      <el-table-column label="半值">
        <template slot-scope="scope">{{ Math.floor(scope.row.value / 2) }}</template>
      </el-table-column>
      <el-table-column label="1/5值">
        <template slot-scope="scope">{{ Math.floor(scope.row.value / 5) }}</template>
      </el-table-column>
    </el-table>
    <div>
      <h4 class="section-title">技能表</h4>
    </div>
    <el-table :data="mapData(currentCard.skills)" stripe
              row-class-name="row" header-row-class-name="row" @cell-click="onCellClick">
      <el-table-column prop="name" label="属性"/>
      <el-table-column prop="value" sortable label="成功率"/>
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
  computed: {
    ...mapState({
      currentGame: state => state.game.list[state.conversation.currentConversation.groupProfile.groupID],
      currentCard: function () { return this.currentGame.cards[this.member] }
    }),
  },
  methods: {
    mapData(props) {
      return Object.keys(props).map(name => ({ name, value: props[name] }))
    },
    onCellClick(row, col) {
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
    }
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

.section-title
  margin-bottom 0
</style>