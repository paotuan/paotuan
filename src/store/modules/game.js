import Vue from 'vue'
import { enableBot, disableBot } from '@/tim'

const gamePrototype = {
  botEnabled: false
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
    }
  }
}

export default game