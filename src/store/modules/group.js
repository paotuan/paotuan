import tim from 'tim'

const groupModules = {
  state: {
    groupList: [],
    currentMemberList: [],
    createGroupModelVisible: false
  },
  getters: {
    hasGroupList: state => state.groupList.length > 0
  },
  mutations: {
    updateGroupList(state, groupList) {
      state.groupList = groupList
    },
    updateCreateGroupModelVisible(state, visible) {
      state.createGroupModelVisible = visible
    },
    updateCurrentMemberList(state, memberList) {
      // 按照文档说法，免费版最多20个人，所以不用考虑分页的问题
      // 这里就直接覆盖了。因为有时候偶现能出现人数重复的问题
      state.currentMemberList = memberList //[...state.currentMemberList, ...memberList]
    },
    deleteGroupMemeber(state, userID) {
      state.currentMemberList = state.currentMemberList.filter((member) => member.userID !== userID)
    },
    deleteGroupMemberList(state, userIDList) {
      state.currentMemberList = state.currentMemberList.filter((member) => !userIDList.includes(member.userID))
    },
    resetCurrentMemberList(state) {
      state.currentMemberList = []
    },
    reset(state) {
      Object.assign(state, {
        groupList: [],
        currentMemberList: [],
        createGroupModelVisible: false
      })
    }
  },
  actions: {
    updateGroupList(context, groupList) {
      context.commit('updateGroupList', groupList)
    },
    getGroupMemberList(context, groupID) {
      return tim.getGroupMemberList({
        groupID: groupID,
        offset: 0, //context.state.currentMemberList.length,
        count: 30 // 按照文档说法，免费版最多20个人，所以不用考虑分页的问题
      }).then((imResponse) => {
        context.commit('updateCurrentMemberList', imResponse.data.memberList)
        return imResponse
      })
    }
  }
}

export default groupModules
