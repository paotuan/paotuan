import TIM from './index'
import { DiceRoll } from 'rpg-dice-roller'
import Vue from 'vue'

export function handleMessage(bot, msg) {
  if (msg.conversationType === TIM.TYPES.CONV_GROUP) {
    // 只处理群消息
    const msgstr = msg.payload.text.trim()
    if (msgstr.startsWith('.') || msgstr.startsWith('。')) {
      try {
        const [exp, desc] = msgstr.substr(1).split(' ')
        const roll = new DiceRoll(exp)
        // 判断成功等级
        const resultstr = decideResult(msg.to, msg.from, exp, desc, roll.total)
        sendGroupMessage(bot, msg.to, `${msg.nameCard || msg.nick || msg.from} 🎲 ${desc || ''} ${roll.output} ${resultstr}`)
      } catch (e) {
        // 表达式不合法，无视之
      }
    }
  }
}

function sendGroupMessage(bot, groupId, string) {
  let msg = bot.createTextMessage({
    to: groupId,
    conversationType: TIM.TYPES.CONV_GROUP,
    payload: {
      text: string
    }
  })
  bot.sendMessage(msg)
}

function decideResult(group, sender, exp, skill, roll) {
  console.log('debug')
  // 0. 判断有没有描述
  if (!skill) return ''
  // 0. 判断是不是标准 d100 // 不判断了，因为还有奖励骰等特殊情况
  // if (exp !== 'd100' && exp !== 'd%') return ''
  // 1. 判断有没有人物卡
  const game = Vue.prototype.$store.state.game.list[group]
  if (!game) return ''
  const card = game.cards['o' + sender]
  if (!card) return ''
  // 2. 判断有没有对应的技能
  //   2.1 先判断几个特殊的
  if (skill === '理智' || skill === 'sc' || skill === 'SC') {
    return roll <= card.basic.san ? `≤ ${card.basic.san} 成功` : `> ${card.basic.san} 失败`
  } else if (skill === '幸运') {
    return roll <= card.basic.luck ? `≤ ${card.basic.luck} 成功` : `> ${card.basic.luck} 失败`
  }
  //   2.2 判断难度等级
  const isHard = skill.indexOf('困难') >= 0
  const isEx = skill.indexOf('极难') >= 0 || skill.indexOf('极限') >= 0
  skill = skill.replace(/(困难|极难|极限)/g, '')
  let target = card.props[skill] || card.skills[skill]
  if (!target) return '' // 没有技能。技能值为 0 应该也不可能
  // 3. 判断大成功大失败
  if (roll === 1) return '大成功'
  if (roll > 95) return '大失败'
  // 4. 真实比较
  target = isEx ? Math.floor(target / 5) : (isHard ? Math.floor(target / 2) : target)
  return roll <= target ? `≤ ${target} 成功` : `> ${target} 失败`
}