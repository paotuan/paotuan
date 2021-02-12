export const ALL_PROPS = `
  力量 体质 体型 敏捷 外貌 灵感 意志 教育 理智 幸运 
`.trim().split(/\s+/)

export const ALL_SKILLS = `
  会计 人类学 估价 考古学 魅惑 攀爬 计算机 信用 克苏鲁神话 乔装 闪避 驾驶 电气维修 电子学 话术 格斗 射击
  急救 历史 恐吓 跳跃 母语 法律 图书馆 聆听 锁匠 机械维修 医学 博物学 领航 神秘学 重型机械 说服 精神分析
  心理学 骑术 妙手 侦查 潜行 游泳 投掷 追踪
`.trim().split(/\s+/)

const USER_PROTO = {
  basic: {},
  props: {},
  skills: {}
}

export function parseCoCXlsx(sheet) {
  const user = JSON.parse(JSON.stringify(USER_PROTO))
  // read basic info
  user.basic = {
    name: sheet['D3'].v,
    job: sheet['D5'].v,
    age: sheet['D6'].v,
    gender: sheet['L6'].v,
    hp: sheet['F10'].v,
    san: sheet['N10'].v,
    luck: sheet['V10'].v,
    mp: (sheet['AD10'] || sheet['AF10']).v
  }
  // read props
  user.props = {
    '力量': sheet['S3'].v,
    '体质': sheet['S5'].v,
    '体型': sheet['S7'].v,
    '敏捷': sheet['Y3'].v,
    '外貌': sheet['Y5'].v,
    '智力': sheet['Y7'].v,
    '意志': sheet['AE3'].v,
    '教育': sheet['AE5'].v,
  }
  console.log(user)
  // read first column
  const E_LINES = [19, 20, 21, 33, 34, 35, 36, 37, 38, 43, 44, 45]
  for (let i = 15; i <= 46; i++) {
    let name = sheet[(E_LINES.includes(i) ? 'E' : 'C') + i]
    if (!name) continue // 自选技能，玩家没选的情况
    user.skills[modifyName(name.v)] = sheet['P' + i].v
  }
  // read second column
  const Y_LINES = [26, 30, 31, 32, 36, 40]
  for (let i = 15; i <= 40; i++) {
    let name = sheet[(Y_LINES.includes(i) ? 'Y' : 'W') + i]
    if (!name) continue // 自选技能，玩家没选的情况
    user.skills[modifyName(name.v)] = sheet['AJ' + i].v
  }

  return user
}

// 处理特殊情况
function modifyName(name) {
  switch (name) {
    case '计算机使用 Ω':
      return '计算机'
    case '图书馆使用':
      return '图书馆'
    case '电子学 Ω':
      return '电子学'
    default:
      return name
  }
}