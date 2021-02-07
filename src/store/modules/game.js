import Vue from 'vue'
import { enableBot, disableBot } from '@/tim'
import TIM from '@/sdk'

const gamePrototype = {
  botEnabled: false,
  logEnabled: false,
  logs: [], // id\from\nick\time\content 不记录全部的 tim msg 属性
  bgm: {}, // platform\type\id 平台、类型（单曲、专辑）、歌曲 id
}

const game = {
  state: {
    list: {} // groupId => game
  },
  mutations: {
    initGame(state, groupId) {
      Vue.set(state.list, groupId, JSON.parse(JSON.stringify(gamePrototype)))
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
    setGameBgm(state, { groupId, bgm }) {
      state.list[groupId].bgm = bgm
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
    },
    handleKPInfo(context, msglist) {
      msglist.filter(msg =>
        msg.conversationType === TIM.TYPES.CONV_GROUP
        && msg.type === TIM.TYPES.MSG_CUSTOM // TODO
      ).forEach(msg => {
        const data = JSON.parse(msg.payload.data)
        if (data.mtype === 'bgm') {
          context.commit('setGameBgm', { groupId: msg.to, bgm: data.mdata })
        }
      })
    },
  }
}

export default game