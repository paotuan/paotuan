import Vue from 'vue'
import {
  MessageBox,
  Row,
  Col,
  Button,
  Input,
  Loading,
  Dialog,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Checkbox,
  CheckboxGroup,
  Tabs,
  TabPane,
  Badge,
  Alert,
  Card,
  ButtonGroup,
  Switch,
  Popover,
  Popconfirm,
} from 'element-ui'
import Avatar from './components/avatar.vue'
import Index from './index.vue'
import store from './store/index'
import tim from 'tim'
import TIM from '@/sdk'
import VueClipboard from 'vue-clipboard2'
import './assets/icon/iconfont.css'
import './assets/icon/tim.css'

window.store = store
Vue.prototype.$bus = new Vue() // event Bus 用于无关系组件间的通信。
Vue.prototype.tim = tim
Vue.prototype.TIM = TIM
Vue.prototype.$store = store
Vue.prototype.$confirm = MessageBox.confirm
Vue.use(Button)
Vue.use(Row)
Vue.use(Col)
Vue.use(Input)
Vue.use(Loading)
Vue.use(Dialog)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(VueClipboard)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Badge)
Vue.use(Alert)
Vue.use(Card)
Vue.use(ButtonGroup)
Vue.use(Switch)
Vue.use(Popover)
Vue.use(Popconfirm)
Vue.component('avatar', Avatar)
new Vue({
  render: h => h(Index)
}).$mount('#app')
