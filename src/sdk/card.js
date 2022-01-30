import { _loadScript } from '../utils'

// 名字 -> 拼音首字母（为了方便搜索）
export const ALL_PROPS = {
  '力量': 'll',
  '体质': 'tz',
  '体型': 'tx',
  '敏捷': 'mj',
  '外貌': 'wm',
  '智力': 'zl',
  '灵感': 'lg',
  '意志': 'yz',
  '教育': 'jy',
  '理智': 'lz',
  '幸运': 'xy'
}

// 其实只是常见技能
export const ALL_SKILLS = {
  '会计': 'hj',
  '人类学': 'rlx',
  '估价': 'gj',
  '考古学': 'kgx',
  '魅惑': 'mh',
  '攀爬': 'pp',
  '计算机': 'jsj',
  '信用': 'xy',
  '克苏鲁神话': 'kslsh',
  '乔装': 'qz',
  '闪避': 'sb',
  '驾驶': 'js',
  '电气维修': 'dqwx',
  '电子学': 'dzx',
  '话术': 'hs',
  '格斗': 'gd',
  '射击': 'sj',
  '急救': 'jj',
  '历史': 'ls',
  '恐吓': 'kx',
  '跳跃': 'ty',
  '母语': 'my',
  '法律': 'fl',
  '图书馆': 'tsg',
  '聆听': 'lt',
  '锁匠': 'sj',
  '机械维修': 'jxwx',
  '医学': 'yx',
  '博物学': 'bwx',
  '领航': 'lh',
  '神秘学': 'sbx',
  '重型机械': 'zxjx',
  '说服': 'sf',
  '精神分析': 'jsfx',
  '心理学': 'xlx',
  '骑术': 'qs',
  '妙手': 'ms',
  '侦查': 'zc',
  '侦察': 'zc',
  '潜行': 'qx',
  '游泳': 'yy',
  '投掷': 'tz',
  '追踪': 'zz',
  sc: 'sc',
  SC: 'SC'
}

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
    case '母语:':
      return '母语'
    default:
      return name
  }
}

// 加载 xlsx
export const loadXlsx = new Promise(resolve => {
  if (window.XLSX) {
    resolve()
    return
  }

  _loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.9/xlsx.mini.min.js', resolve)
})
