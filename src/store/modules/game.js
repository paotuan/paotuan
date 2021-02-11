import Vue from 'vue'
import { enableBot, disableBot } from '@/tim'
import TIM from '@/sdk'

const gamePrototype = {
  currentTab: 'group', // 当前打开的 tab，默认是群信息 tab
  botEnabled: false, // 是否打开骰子开关
  logEnabled: false, // 是否打开日志记录开关
  logs: [], // id\from\nick\time\content 不记录全部的 tim msg 属性
  bgm: {}, // platform\type\id 平台、类型（单曲、专辑）、歌曲 id
  notes: [], // id\type\payload 主持人笔记
  noteUnread: false, // 是否有未读的笔记
}

const _ = (groupId) => {
  if (!game.state.list[groupId]) {
    Vue.set(game.state.list, groupId, JSON.parse(JSON.stringify(gamePrototype)))
  }
  return game.state.list[groupId]
}

const save = (key, groupId, content) => {
  localStorage.setItem(`paotuan${key}-${groupId}`, JSON.stringify(content))
}

const getInitialSavedContent = (key, groupId) => {
  const saved = localStorage.getItem(`paotuan${key}-${groupId}`)
  return saved ? JSON.parse(saved) : []
}

const game = {
  state: {
    list: {} // groupId => game
  },
  mutations: {
    initGame(state, groupId) {
      Vue.set(state.list, groupId, JSON.parse(JSON.stringify(gamePrototype)))
      state.list[groupId].notes = getInitialSavedContent('note', groupId)
      state.list[groupId].logs = getInitialSavedContent('log', groupId)
    },
    toggleBotEnabled(state, { groupId, enabled }) {
      _(groupId).botEnabled = enabled
    },
    toggleLogEnabled(state, { groupId, enabled }) {
      _(groupId).logEnabled = enabled
    },
    insertLog(state, { groupId, log }) {
      _(groupId).logs.push(log)
      save('log', groupId, _(groupId).logs)
    },
    updateLogs(state, { groupId, logs }) {
      _(groupId).logs = logs
      save('log', groupId, logs)
    },
    setGameBgm(state, { groupId, bgm }) {
      _(groupId).bgm = bgm
    },
    addNote(state, { groupId, note }) {
      _(groupId).notes.push(note)
      save('note', groupId, _(groupId).notes)
    },
    updateNotes(state, { groupId, notes }) {
      _(groupId).notes = notes
      save('note', groupId, notes)
    },
    setNoteUnread(state, { groupId, unread }) {
      _(groupId).noteUnread = unread
    },
    setCurrentTab(state, { groupId, tab }) {
      _(groupId).currentTab = tab
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
          && context.state.list[msg.to]
          && context.state.list[msg.to].logEnabled
      ).forEach(msg => {
        const log = {
          id: msg.ID,
          from: msg.from,
          nick: msg.nameCard || msg.nick,
          time: msg.time,
          content: msg.payload.text,
        }
        if (log.content.startsWith('.') || log.content.startsWith('。')) {
          return // 这里默认过滤了骰子指令，后续可以考虑做成配置项
        }
        context.commit('insertLog', { groupId: msg.to, log })
      })
    },
    handleKPNote(context, msglist) {
      msglist.filter(msg =>
          msg.conversationType === TIM.TYPES.CONV_GROUP
          && msg.priority === TIM.TYPES.MSG_PRIORITY_HIGH
      ).forEach(msg => {
        if (msg.type === TIM.TYPES.MSG_CUSTOM) {
          const data = JSON.parse(msg.payload.data)
          if (data.mtype === 'bgm') {
            context.commit('setGameBgm', { groupId: msg.to, bgm: data.mdata })
            context.dispatch('handleNoteUnread', msg.to)
          }
        } else if (msg.type === TIM.TYPES.MSG_TEXT) {
          context.commit('addNote', {
            groupId: msg.to,
            note: { id: msg.ID, type: msg.type, payload: msg.payload.text }
          })
          context.dispatch('handleNoteUnread', msg.to)
        } else if (msg.type === TIM.TYPES.MSG_IMAGE) {
          context.commit('addNote', {
            groupId: msg.to,
            note: { id: msg.ID, type: msg.type, payload: msg.payload.imageInfoArray[0].imageUrl }
          })
          context.dispatch('handleNoteUnread', msg.to)
        }
      })
    },
    handleNoteUnread(context, groupId) {
      // 为 note 增加红点，如果用户当前停留在 note tab 则不增加
      if (_(groupId).currentTab !== 'note') {
        context.commit('setNoteUnread', { groupId, unread: true })
      }
    }
  }
}

export default game