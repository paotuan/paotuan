import TIM from './index'
import { DiceRoll } from 'rpg-dice-roller'

export function handleMessage(bot, msg) {
  const msgstr = msg.payload.text.trim()
  if (msgstr.startsWith('.') || msgstr.startsWith('。')) {
    const roll = new DiceRoll(msgstr.substr(1))
    sendGroupMessage(bot, msg.to, roll.output)
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
  // msg.nick = 'bot'
  bot.sendMessage(msg)
}
