<template>
  <div style="display: flex">
    <el-input :value="value" placeholder="请输入图片 URL，或点击右侧按钮上传本地图片" @input="$emit('input', $event)" />
    <el-button style="margin-left: 10px" :loading="loading" icon="el-icon-upload" @click="$refs.imgPicker.click()" />
    <input
        type="file"
        ref="imgPicker"
        accept=".jpg, .jpeg, .png, .gif, .bmp"
        @change="uploadImage"
        style="display:none"
    />
  </div>
</template>
<script>
export default {
  name: 'ImageUpload',
  props: {
    // 头像 url
    value: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    async uploadImage() {
      const file = this.$refs.imgPicker
      if (!file.value) return
      this.loading = true
      const message = this.tim.createImageMessage({
        to: this.$store.state.user.userID,
        conversationType: this.TIM.TYPES.CONV_C2C,
        priority: this.TIM.TYPES.MSG_PRIORITY_HIGH,
        payload: { file },
      })
      try {
        await this.tim.sendMessage(message)
        const url = message.payload.imageInfoArray[0].imageUrl
        this.$emit('input', url)
      } catch (e) {
        this.$store.commit('showMessage', {
          type: 'error',
          message: e.message
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
