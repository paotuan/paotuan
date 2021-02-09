<template>
  <iframe v-if="bgm.platform === 1" :key="bgm.id" class="player"
          frameborder="no" border="0" marginwidth="0" marginheight="0" :height="bgm.type === 2 ? 110 : 235"
          :src="`//music.163.com/outchain/player?type=${bgm.type}&id=${bgm.id}`" />
</template>
<script>
// bgm platform: 1 - 网易云
// bgm type: 0 - playlist, 1 - album，2 - song
export default {
  props: ['bgm'],
}
</script>
<style scoped>
.player {
  width: 100%;
  /* 看下高度在不同电脑上表现 */
  /*height: auto;*/
}
</style>