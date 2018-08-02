import Vue from 'vue'
import App from './App.vue'
// import EasTable from '../src/components/table'
// import '~assets/style/table.scss'

import EasTable from 'eas-table'
import 'eas-table/dist/index.css'
// const EasTable = require('../dist/eas-table.common.js')
// window.Vue = Vue
console.log(111, EasTable, window.Vue)
Vue.config.productionTip = false
Vue.use(EasTable)

new Vue({
  render: h => h(App)
}).$mount('#app')
