import EasTable from './src/table';
import EasTableColumn from '~components/table-column'
import '~assets/style/table.scss'

/* istanbul ignore next */
EasTable.install = function(Vue) {
  if (Vue) {
    Vue.component(EasTable.name, EasTable);
    Vue.component(EasTableColumn.name, EasTableColumn);
  }
};

/* istanbul ignore if */
// if (typeof window !== 'undefined' && window.Vue) {
//   console.log(window.Vue)
//   window.Vue.use(EasTable);
// }

export default EasTable;
