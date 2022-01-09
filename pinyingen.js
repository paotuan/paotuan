const cnchar = require('cnchar')

console.log(`
  力量 体质 体型 敏捷 外貌 智力 灵感 意志 教育 理智 幸运 
`
  .trim().split(/\s+/).reduce((obj, name) => {
    return Object.assign(obj, { [name]: cnchar.spell(name, 'first', 'low') })
  }, {})
)

console.log(`
  会计 人类学 估价 考古学 魅惑 攀爬 计算机 信用 克苏鲁神话 乔装 闪避 驾驶 电气维修 电子学 话术 格斗 射击
  急救 历史 恐吓 跳跃 母语 法律 图书馆 聆听 锁匠 机械维修 医学 博物学 领航 神秘学 重型机械 说服 精神分析
  心理学 骑术 妙手 侦查 侦察 潜行 游泳 投掷 追踪 sc SC
`
  .trim().split(/\s+/).reduce((obj, name) => {
    return Object.assign(obj, { [name]: cnchar.spell(name, 'first', 'low') })
  }, {})
)
