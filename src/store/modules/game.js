import Vue from 'vue'
import { enableBot, disableBot } from '@/tim'
import TIM from '@/sdk'

const gamePrototype = {
  botEnabled: false,
  logEnabled: false,
  logs: [], // id\from\nick\time\content 不记录全部的 tim msg 属性
}

const game = {
  state: {
    list: {} // groupId => game
  },
  mutations: {
    initGame(state, groupId) {
      Vue.set(state.list, groupId, { ...gamePrototype })
    },
    toggleBotEnabled(state, { groupId, enabled }) {
      state.list[groupId].botEnabled = enabled
    },
    toggleLogEnabled(state, { groupId, enabled }) {
      state.list[groupId].logEnabled = enabled
    },
    insertLog(state, { groupId, log }) {
      state.list[groupId].logs.push(log)
    },
    updateLogs(state, { groupId, logs }) {
      // TODO action 里可以存 localstorage
      state.list[groupId].logs = logs
    },
  },
  actions: {
    initGame(context, groupId) {
      if (!context.state.list[groupId]) {
        context.commit('initGame', groupId)
      }
    },
    toggleBotEnabled(context, { groupId, enabled }) {
      return (enabled ? enableBot : disableBot)(groupId)
          .then(resp => {
            context.commit('toggleBotEnabled', { groupId, enabled })
            return resp
          })
    },
    insertGameLogs(context, msglist) {
      msglist.filter(msg =>
          msg.conversationType === TIM.TYPES.CONV_GROUP
          && msg.type === TIM.TYPES.MSG_TEXT
          && context.state.list[msg.to].logEnabled
      ).forEach(msg => {
        const log = {
          id: msg.ID,
          from: msg.from,
          nick: msg.nick,
          time: msg.time,
          content: msg.payload.text,
        }
        context.commit('insertLog', { groupId: msg.to, log })
      })
    }
  }
}

export default game