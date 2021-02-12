<template>
  <el-dialog title="全局设置" width="40%" :visible="visible" @close="$emit('update:visible', false)">
    <div class="settings-content">
      <div>【重要笔记】/【Log】/【人物卡】的内容，会缓存在本地，这样在下次打开时也不会丢失。</div>
      <div>如果你已经不需要这些缓存了，可以将其清除，以释放存储空间、提升初始化速度。</div>
      <div class="btn" style="margin-top: 20px">
        <el-button type="text" @click="clearLocalStorage('paotuannote-')">清除所有【重要笔记】缓存</el-button>
      </div>
      <div class="btn">
        <el-button type="text" @click="clearLocalStorage('paotuanlog-')">清除所有【Log 录制】缓存</el-button>
      </div>
      <div class="btn">
        <el-button type="text" @click="clearLocalStorage('paotuancard-')">清除所有【人物卡】缓存</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: ['visible'],
  methods: {
    clearLocalStorage(prefix) {
      const allKeys = []
      const length = localStorage.length
      for (let i = 0; i < length; i++) {
        const key = localStorage.key(i)
        if (key.startsWith(prefix)) {
          allKeys.push(key)
        }
      }
      allKeys.forEach(key => localStorage.removeItem(key))
      this.$store.commit('showMessage', {
        type: 'success',
        message: '清除缓存成功'
      })
    }
  }
}
</script>
<style scoped>
.settings-content div {
  line-height: 1.5;
  margin: 10px;
}
</style>