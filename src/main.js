import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

//导入全局样式表
import './assets/css/global.css'

//导入字体图标
import './assets/fonts/iconfont.css'

// 导入表格树
import TreeTable from 'vue-table-with-tree-grid'

//导入vue富文本组件
import VueQuillEditor from 'vue-quill-editor'

//导入axios
import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 组件全局注册 表格树
Vue.component('tree-table', TreeTable)

//导入副本本样式列表
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//全局注册富文本组件
Vue.use(VueQuillEditor)

//挂载时间戳
Vue.filter('dateFormat', function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth()+1+'').padStart(2, '0')
  const d = (dt.getDate()+1+'').padStart(2, '0')
  const hh = (dt.getHours()+1+'').padStart(2, '0')
  const mm = (dt.getMinutes()+1+'').padStart(2, '0')
  const ss = (dt.getSeconds()+1+'').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
