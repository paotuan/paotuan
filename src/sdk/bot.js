import TIM from './index'
import { DiceRoll } from 'rpg-dice-roller'

export function handleMessage(bot, msg) {
  if (msg.conversationType === TIM.TYPES.CONV_GROUP) {
    // 只处理群消息
    const msgstr = msg.payload.text.trim()
    if (msgstr.startsWith('.') || msgstr.startsWith('。')) {
      try {
        const roll = new DiceRoll(msgstr.substr(1))
        sendGroupMessage(bot, msg.to, roll.output)
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
