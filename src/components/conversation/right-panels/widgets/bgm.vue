<template>
  <iframe v-if="bgm.platform === 1" class="player"
          frameborder="no" border="0" marginwidth="0" marginheight="0"
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
  height: auto;
}
</style>