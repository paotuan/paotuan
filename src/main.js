import Vue from 'vue'
import ElementUI from 'element-ui'
import Avatar from './components/avatar.vue'
import Index from './index.vue'
import store from './store/index'
import tim from 'tim'
import TIM from '@/sdk'
import VueClipboard from 'vue-clipboard2'
import './assets/icon/iconfont.css'
import './assets/icon/tim.css'

// window.store = store
Vue.prototype.$bus = new Vue() // event Bus 用于无关系组件间的通信。
Vue.prototype.tim = tim
Vue.prototype.TIM = TIM
Vue.prototype.$store = store
Vue.use(ElementUI)
Vue.use(VueClipboard)
Vue.component('avatar', Avatar)
new Vue({
  render: h => h(Index)
}).$mount('#app')
