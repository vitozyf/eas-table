import EasTableColumn from '../table/src/table-column';

/* istanbul ignore next */
EasTableColumn.install = function(Vue) {
  Vue.component(EasTableColumn.name, EasTableColumn);
};

export default EasTableColumn;
