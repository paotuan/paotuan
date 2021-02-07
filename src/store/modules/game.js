import Vue from 'vue'
import { enableBot, disableBot } from '@/tim'
import TIM from '@/sdk'

const gamePrototype = {
  botEnabled: false,
  logEnabled: false,
  logs: [], // id\from\nick\time\content 不记录全部的 tim msg 属性
  bgm: {}, // platform\type\id 平台、类型（单曲、专辑）、歌曲 id
  notes: [], // id\type\payload 主持人笔记
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
    addNote(state, { groupId, note }) {
      state.list[groupId].notes.push(note)
    }
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
    handleKPNote(context, msglist) {
      console.log(msglist)
      // TODO 要考虑没打开群，但是收到了群的消息，没 initGame 的情况
      msglist.filter(msg =>
          msg.conversationType === TIM.TYPES.CONV_GROUP
          && msg.priority === TIM.TYPES.MSG_PRIORITY_HIGH
      ).forEach(msg => {
        if (msg.type === TIM.TYPES.MSG_CUSTOM) {
          const data = JSON.parse(msg.payload.data)
          if (data.mtype === 'bgm') {
            context.commit('setGameBgm', { groupId: msg.to, bgm: data.mdata })
          }
        } else if (msg.type === TIM.TYPES.MSG_TEXT) {
          context.commit('addNote', {
            groupId: msg.to,
            note: { id: msg.ID, type: msg.type, payload: msg.payload.text }
          })
        } else if (msg.type === TIM.TYPES.MSG_IMAGE) {
          context.commit('addNote', {
            groupId: msg.to,
            note: { id: msg.ID, type: msg.type, payload: msg.payload.imageInfoArray[0].url }
          })
        }
      })
    },
  }
}

export default game