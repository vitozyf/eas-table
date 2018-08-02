import Vue from 'vue'
import App from './App.vue'
// dev test
import EasTable from '~/components/table'
import '~assets/style/table.scss'
// prod test
// import EasTable from 'eas-table'
// import 'eas-table/dist/index.css'

Vue.config.productionTip = false
Vue.use(EasTable)

new Vue({
  render: h => h(App)
}).$mount('#app')
