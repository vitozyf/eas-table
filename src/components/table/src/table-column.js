import EasCheckbox from '~components/checkbox';
import EasTag from '~components/tag';
import objectAssign from '~utils/merge';
import { getPropByPath } from '~utils/util';
import { getCell } from './util';

let columnIdSeed = 1;

const defaults = {
  default: {
    order: ''
  },
  selection: {
    width: 48,
    minWidth: 48,
    realWidth: 48,
    order: '',
    className: 'eas-table-column--selection'
  },
  expand: {
    width: 48,
    minWidth: 48,
    realWidth: 48,
    order: ''
  },
  index: {
    width: 48,
    minWidth: 48,
    realWidth: 48,
    order: ''
  }
};

const forced = {
  selection: {
    renderHeader: function(h, { store }) {
      return <eas-checkbox
        disabled={ store.states.data && store.states.data.length === 0 }
        indeterminate={ store.states.selection.length > 0 && !this.isAllSelected }
        nativeOn-click={ this.toggleAllSelection }
        value={ this.isAllSelected } />;
    },
    renderCell: function(h, { row, column, store, $index }) {
      return <eas-checkbox
        nativeOn-click={ (event) => event.stopPropagation() }
        value={ store.isSelected(row) }
        disabled={ column.selectable ? !column.selectable.call(null, row, $index) : false }
        on-input={ () => { store.commit('rowSelectedChanged', row); } } />;
    },
    sortable: false,
    resizable: false
  },
  index: {
    renderHeader: function(h, { column }) {
      return column.label || '#';
    },
    renderCell: function(h, { $index, column }) {
      let i = $index + 1;
      const index = column.index;

      if (typeof index === 'number') {
        i = $index + index;
      } else if (typeof index === 'function') {
        i = index($index);
      }

      return <div>{ i }</div>;
    },
    sortable: false
  },
  expand: {
    renderHeader: function(h, { column }) {
      return column.label || '';
    },
    renderCell: function(h, { row, store }, proxy) {
      const expanded = store.states.expandRows.indexOf(row) > -1;
      return <div class={ 'eas-table__expand-icon ' + (expanded ? 'eas-table__expand-icon--expanded' : '') }
        on-click={ e => proxy.handleExpandClick(row, e) }>
        <i class='eas-icon eas-icon-arrow-right'></i>
      </div>;
    },
    sortable: false,
    resizable: false,
    className: 'eas-table__expand-column'
  }
};

const getDefaultColumn = function(type, options) {
  const column = {};

  objectAssign(column, defaults[type || 'default']);

  for (let name in options) {
    if (options.hasOwnProperty(name)) {
      const value = options[name];
      if (typeof value !== 'undefined') {
        column[name] = value;
      }
    }
  }

  if (!column.minWidth) {
    column.minWidth = 80;
  }

  column.realWidth = column.width === undefined ? column.minWidth : column.width;

  return column;
};

const DEFAULT_RENDER_CELL = function(h, { row, column, $index }, self, IsEditCell) {
  const property = column.property;
  const value = property && getPropByPath(row, property).v;
  if (column && column.formatter) {
    return column.formatter(row, column, value, $index);
  }
  if (IsEditCell && !self.isReadOnly) {
    return (
      <input
        class="eas-edit_cell"
        value = { value }
        on-keydown = {event =>
          {
            event.stopPropagation();
          }
        }
        on-input = {event => { row[column.property] = event.target.value }}
        on-focus = {event => {
          self.table.$emit('edit:begin',Object.assign({}, row), Object.assign({}, column), getCell(event))
        }}
        on-blur = {event => {
          self.table.$emit('edit:end', row, column, getCell(event))
        }}
      />
    )
  }
  return value;
};

const parseWidth = (width) => {
  if (width !== undefined) {
    width = parseInt(width, 10);
    if (isNaN(width)) {
      width = null;
    }
  }
  return width;
};

const parseMinWidth = (minWidth) => {
  if (minWidth !== undefined) {
    minWidth = parseInt(minWidth, 10);
    if (isNaN(minWidth)) {
      minWidth = 80;
    }
  }
  return minWidth;
};

export default {
  name: 'EasTableColumn',

  props: {
    type: {
      type: String,
      default: 'default'
    },
    isReadOnly: Boolean,
    label: String,
    className: String,
    labelClassName: String,
    property: String,
    prop: String,
    width: {},
    minWidth: {},
    renderHeader: Function,
    sortable: {
      type: [String, Boolean],
      default: false
    },
    sortMethod: Function,
    sortBy: [String, Function, Array],
    resizable: {
      type: Boolean,
      default: true
    },
    context: {},
    columnKey: String,
    align: String,
    headerAlign: String,
    showTooltipWhenOverflow: Boolean,
    showOverflowTooltip: Boolean,
    fixed: [Boolean, String],
    formatter: Function,
    selectable: Function,
    reserveSelection: Boolean,
    filterMethod: Function,
    filteredValue: Array,
    filters: Array,
    filterPlacement: String,
    filterMultiple: {
      type: Boolean,
      default: true
    },
    index: [Number, Function],
    sortOrders: {
      type: Array,
      default() {
        return ['ascending', 'descending', null];
      },
      validator(val) {
        return val.every(order => ['ascending', 'descending', null].indexOf(order) > -1);
      }
    }
  },

  data() {
    return {
      isSubColumn: false,
      columns: []
    };
  },

  beforeCreate() {
    this.row = {};
    this.column = {};
    this.$index = 0;
  },

  components: {
    EasCheckbox,
    EasTag
  },

  computed: {
    owner() {
      let parent = this.$parent;
      while (parent && !parent.tableId) {
        parent = parent.$parent;
      }
      return parent;
    },
    columnOrTableParent() {
      let parent = this.$parent;
      while (parent && !parent.tableId && !parent.columnId) {
        parent = parent.$parent;
      }
      return parent;
    },
    table() {
      return this.$parent;
    }
  },

  created() {
    this.customRender = this.$options.render;
    this.$options.render = h => h('div', this.$slots.default);

    let parent = this.columnOrTableParent;
    let owner = this.owner;
    this.isSubColumn = owner !== parent;
    this.columnId = (parent.tableId || parent.columnId) + '_column_' + columnIdSeed++;

    let type = this.type;

    const width = parseWidth(this.width);
    const minWidth = parseMinWidth(this.minWidth);

    let isColumnGroup = false;

    let column = getDefaultColumn(type, {
      id: this.columnId,
      columnKey: this.columnKey,
      label: this.label,
      isReadOnly: this.isReadOnly,
      className: this.className,
      labelClassName: this.labelClassName,
      property: this.prop || this.property,
      type,
      renderCell: null,
      renderHeader: this.renderHeader,
      minWidth,
      width,
      isColumnGroup,
      context: this.context,
      align: this.align ? 'is-' + this.align : null,
      headerAlign: this.headerAlign ? 'is-' + this.headerAlign : (this.align ? 'is-' + this.align : null),
      sortable: this.sortable === '' ? true : this.sortable,
      sortMethod: this.sortMethod,
      sortBy: this.sortBy,
      resizable: this.resizable,
      showOverflowTooltip: this.showOverflowTooltip || this.showTooltipWhenOverflow,
      formatter: this.formatter,
      selectable: this.selectable,
      reserveSelection: this.reserveSelection,
      fixed: this.fixed === '' ? true : this.fixed,
      filterMethod: this.filterMethod,
      filters: this.filters,
      filterable: (this.filters && this.filters.length) || this.filterMethod,
      filterMultiple: this.filterMultiple,
      filterOpened: false,
      filteredValue: this.filteredValue || [],
      filterPlacement: this.filterPlacement || '',
      index: this.index,
      sortOrders: this.sortOrders
    });

    let source = forced[type] || {};
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop];
        if (value !== undefined) {
          column[prop] = prop === 'className'
            ? `${column[prop]} ${value}`
            : value;
        }
      }
    }

    this.columnConfig = column;
    let renderCell = column.renderCell;
    let _self = this;

    if (type === 'expand') {
      owner.renderExpanded = function(h, data) {
        return _self.$scopedSlots.default
          ? _self.$scopedSlots.default(data)
          : _self.$slots.default;
      };

      column.renderCell = function(h, data) {
        return <div class="cell">{ renderCell(h, data, this._renderProxy) }</div>;
      };

      return;
    }

    column.renderCell = function(h, data, columnsHidden, cellClass) {
      if (_self.$scopedSlots.default) {
        renderCell = () => _self.$scopedSlots.default(data);
      }

      if (!renderCell) {
        renderCell = DEFAULT_RENDER_CELL;
      }

      const IsEditCell = cellClass.indexOf('eas-edit-cell') > -1

      return _self.showOverflowTooltip || _self.showTooltipWhenOverflow
        ? <div
            class={`cell eas-tooltip`}
            style={ {width: (data.column.realWidth || data.column.width) - 1 + 'px'} }>
              { renderCell(h, data, _self, IsEditCell) }
          </div>
        : <div
            class={`cell`}>
              { renderCell(h, data, _self, IsEditCell) }
          </div>;
    };
  },

  destroyed() {
    if (!this.$parent) return;
    const parent = this.$parent;
    this.owner.store.commit('removeColumn', this.columnConfig, this.isSubColumn ? parent.columnConfig : null);
  },

  watch: {
    label(newVal) {
      if (this.columnConfig) {
        this.columnConfig.label = newVal;
      }
    },

    prop(newVal) {
      if (this.columnConfig) {
        this.columnConfig.property = newVal;
      }
    },

    property(newVal) {
      if (this.columnConfig) {
        this.columnConfig.property = newVal;
      }
    },

    filters(newVal) {
      if (this.columnConfig) {
        this.columnConfig.filters = newVal;
      }
    },

    filterMultiple(newVal) {
      if (this.columnConfig) {
        this.columnConfig.filterMultiple = newVal;
      }
    },

    align(newVal) {
      if (this.columnConfig) {
        this.columnConfig.align = newVal ? 'is-' + newVal : null;

        if (!this.headerAlign) {
          this.columnConfig.headerAlign = newVal ? 'is-' + newVal : null;
        }
      }
    },

    headerAlign(newVal) {
      if (this.columnConfig) {
        this.columnConfig.headerAlign = 'is-' + (newVal ? newVal : this.align);
      }
    },

    width(newVal) {
      if (this.columnConfig) {
        this.columnConfig.width = parseWidth(newVal);
        this.owner.store.scheduleLayout();
      }
    },

    minWidth(newVal) {
      if (this.columnConfig) {
        this.columnConfig.minWidth = parseMinWidth(newVal);
        this.owner.store.scheduleLayout();
      }
    },

    fixed(newVal) {
      if (this.columnConfig) {
        this.columnConfig.fixed = newVal;
        this.owner.store.scheduleLayout(true);
      }
    },

    sortable(newVal) {
      if (this.columnConfig) {
        this.columnConfig.sortable = newVal;
      }
    },

    index(newVal) {
      if (this.columnConfig) {
        this.columnConfig.index = newVal;
      }
    },

    formatter(newVal) {
      if (this.columnConfig) {
        this.columnConfig.formatter = newVal;
      }
    },

    className(newVal) {
      if (this.columnConfig) {
        this.columnConfig.className = newVal;
      }
    },

    labelClassName(newVal) {
      if (this.columnConfig) {
        this.columnConfig.labelClassName = newVal;
      }
    }
  },

  mounted() {
    const owner = this.owner;
    const parent = this.columnOrTableParent;
    let columnIndex;

    if (!this.isSubColumn) {
      columnIndex = [].indexOf.call(parent.$refs.hiddenColumns.children, this.$el);
    } else {
      columnIndex = [].indexOf.call(parent.$el.children, this.$el);
    }

    owner.store.commit('insertColumn', this.columnConfig, columnIndex, this.isSubColumn ? parent.columnConfig : null);
  }
};
