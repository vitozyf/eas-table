import { getCell, getColumnByCell, getRowIdentity } from './util';
import { getStyle, hasClass, addClass, removeClass } from '~utils/dom';
import EasCheckbox from '~components/checkbox';
import EasTooltip from '~components/tooltip';
import debounce from 'throttle-debounce/debounce';
import LayoutObserver from './layout-observer';
import keycodes from './keycode';
export default {
  name: 'ElTableBody',

  mixins: [LayoutObserver],

  components: {
    EasCheckbox,
    EasTooltip
  },

  props: {
    store: {
      required: true
    },
    stripe: Boolean,
    context: {},
    rowClassName: [String, Function],
    rowStyle: [Object, Function],
    fixed: String,
    highlight: Boolean
  },

  render(h) {
    const columnsHidden = this.columns.map((column, index) => this.isColumnHidden(index));
    return (
      <table
        class="eas-table__body"
        cellspacing="0"
        cellpadding="0"
        border="0"
        tabindex="0"
        on-keydown={ ($event) => { this.handlerKeydown($event) } }
        // on-mousedown={ ($event) => this.handleMousedown($event) }
        // on-mousemove={ ($event) => this.handleMousemove($event) }
        >
        <colgroup>
          {
            this._l(this.columns, column => <col name={ column.id } />)
          }
        </colgroup>
        <tbody>
          {
            this._l(this.data, (row, $index) =>
              [<tr
                style={ this.rowStyle ? this.getRowStyle(row, $index) : null }
                key={ this.table.rowKey ? this.getKeyOfRow(row, $index) : $index }
                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                on-click={ ($event) => this.handleClick($event, row) }
                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                on-mouseenter={ _ => this.handleMouseEnter($index) }
                on-mouseleave={ _ => this.handleMouseLeave() }
                class={ [this.getRowClass(row, $index)] }>
                {
                  this._l(this.columns, (column, cellIndex) => {
                    const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex);
                    if (!rowspan || !colspan) {
                      return '';
                    } else {
                      return (
                        <td
                          style={ this.getCellStyle($index, cellIndex, row, column) }
                          class={ this.getCellClass($index, cellIndex, row, column) }
                          rowspan={ rowspan }
                          colspan={ colspan }
                          on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                          on-mouseleave={ this.handleCellMouseLeave }>
                          {
                            column.renderCell.call(
                              this._renderProxy,
                              h,
                              {
                                row,
                                column,
                                $index,
                                store: this.store,
                                _self: this.context || this.table.$vnode.context
                              },
                              columnsHidden[cellIndex],
                              this.getCellClass($index, cellIndex, row, column)
                            )
                          }
                        </td>
                      );
                    }
                  })
                }
              </tr>,
              this.store.isRowExpanded(row)
                ? (<tr>
                  <td colspan={ this.columns.length } class="eas-table__expanded-cell">
                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                  </td>
                </tr>)
                : ''
              ]
            ).concat(
              <eas-tooltip effect={ this.table.tooltipEffect } placement="top" ref="tooltip" content={ this.tooltipContent }></eas-tooltip>
            )
          }
        </tbody>
      </table>
    );
  },

  watch: {
    'store.states.hoverRow'(newVal, oldVal) {
      if (!this.store.states.isComplex) return;
      const el = this.$el;
      if (!el) return;
      const tr = el.querySelector('tbody').children;
      const rows = [].filter.call(tr, row => hasClass(row, 'eas-table__row'));
      const oldRow = rows[oldVal];
      const newRow = rows[newVal];
      if (oldRow) {
        removeClass(oldRow, 'hover-row');
      }
      if (newRow) {
        addClass(newRow, 'hover-row');
      }
    },
    'store.states.currentRow'(newVal, oldVal) {
      if (!this.highlight) return;
      const el = this.$el;
      if (!el) return;
      const data = this.store.states.data;
      const tr = el.querySelector('tbody').children;
      const rows = [].filter.call(tr, row => hasClass(row, 'eas-table__row'));
      const oldRow = rows[data.indexOf(oldVal)];
      const newRow = rows[data.indexOf(newVal)];
      if (oldRow) {
        removeClass(oldRow, 'current-row');
      } else {
        [].forEach.call(rows, row => removeClass(row, 'current-row'));
      }
      if (newRow) {
        addClass(newRow, 'current-row');
      }
      this.store.commit('setEditRow', null);
    },
    'store.states.currentColumn'(newVal, oldVal) {
      this.store.commit('setEditColumn', null);
    }
  },

  computed: {
    table() {
      return this.$parent;
    },

    data() {
      return this.store.states.data;
    },

    columnsCount() {
      return this.store.states.columns.length;
    },

    leftFixedLeafCount() {
      return this.store.states.fixedLeafColumnsLength;
    },

    rightFixedLeafCount() {
      return this.store.states.rightFixedLeafColumnsLength;
    },

    leftFixedCount() {
      return this.store.states.fixedColumns.length;
    },

    rightFixedCount() {
      return this.store.states.rightFixedColumns.length;
    },

    columns() {
      return this.store.states.columns;
    }
  },

  data() {
    return {
      tooltipContent: ''
    };
  },

  created() {
    this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper());
  },

  methods: {
    getKeyOfRow(row, index) {
      const rowKey = this.table.rowKey;
      if (rowKey) {
        return getRowIdentity(row, rowKey);
      }
      return index;
    },

    isColumnHidden(index) {
      if (this.fixed === true || this.fixed === 'left') {
        return index >= this.leftFixedLeafCount;
      } else if (this.fixed === 'right') {
        return index < this.columnsCount - this.rightFixedLeafCount;
      } else {
        return (index < this.leftFixedLeafCount) || (index >= this.columnsCount - this.rightFixedLeafCount);
      }
    },

    getSpan(row, column, rowIndex, columnIndex) {
      let rowspan = 1;
      let colspan = 1;

      const fn = this.table.spanMethod;
      if (typeof fn === 'function') {
        const result = fn({
          row,
          column,
          rowIndex,
          columnIndex
        });

        if (Array.isArray(result)) {
          rowspan = result[0];
          colspan = result[1];
        } else if (typeof result === 'object') {
          rowspan = result.rowspan;
          colspan = result.colspan;
        }
      }

      return {
        rowspan,
        colspan
      };
    },

    getRowStyle(row, rowIndex) {
      const rowStyle = this.table.rowStyle;
      if (typeof rowStyle === 'function') {
        return rowStyle.call(null, {
          row,
          rowIndex
        });
      }
      return rowStyle;
    },

    getRowClass(row, rowIndex) {
      const classes = ['eas-table__row'];
      if (this.table.highlightCurrentRow && row === this.store.states.currentRow) {
        classes.push('current-row');
      }

      if (this.stripe && rowIndex % 2 === 1) {
        classes.push('eas-table__row--striped');
      }
      const rowClassName = this.table.rowClassName;
      if (typeof rowClassName === 'string') {
        classes.push(rowClassName);
      } else if (typeof rowClassName === 'function') {
        classes.push(rowClassName.call(null, {
          row,
          rowIndex
        }));
      }

      if (this.store.states.expandRows.indexOf(row) > -1) {
        classes.push('expanded');
      }

      return classes.join(' ');
    },

    getCellStyle(rowIndex, columnIndex, row, column) {
      const cellStyle = this.table.cellStyle;
      if (typeof cellStyle === 'function') {
        return cellStyle.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        });
      }
      return cellStyle;
    },

    getCellClass(rowIndex, columnIndex, row, column) {
      const classes = [column.id, column.align, column.className];
      const currentRow = this.store.states.currentRow
      const currentColumn = this.store.states.currentColumn
      const editRow = this.store.states.editRow
      const editColumn = this.store.states.editColumn

      if (this.isColumnHidden(columnIndex)) {
        classes.push('is-hidden');
      }

      if (currentRow === row && currentColumn.id === column.id) {
        classes.push('current-cell');
      }
      if (
        editRow === row
        && editColumn
        && editColumn.id === column.id
        && !column.isReadOnly
        && column.type === 'default'
      ) {
        classes.push('eas-edit-cell');
      }

      const cellClassName = this.table.cellClassName;
      if (typeof cellClassName === 'string') {
        classes.push(cellClassName);
      } else if (typeof cellClassName === 'function') {
        classes.push(cellClassName.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        }));
      }

      return classes.join(' ');
    },

    handleCellMouseEnter(event, row) {
      const table = this.table;
      const cell = getCell(event);

      if (cell) {
        const column = getColumnByCell(table, cell);
        const hoverState = table.hoverState = {cell, column, row};
        table.$emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event);
      }

      // 判断是否text-overflow, 如果是就显示tooltip
      const cellChild = event.target.querySelector('.cell');
      if (!hasClass(cellChild, 'eas-tooltip')) {
        return;
      }
      // use range width instead of scrollWidth to determine whether the text is overflowing
      // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
      const range = document.createRange();
      range.setStart(cellChild, 0);
      range.setEnd(cellChild, cellChild.childNodes.length);
      const rangeWidth = range.getBoundingClientRect().width;
      const padding = (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) +
        (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0);
      if ((rangeWidth + padding > cellChild.offsetWidth || cellChild.scrollWidth > cellChild.offsetWidth) && this.$refs.tooltip) {
        const tooltip = this.$refs.tooltip;
        // TODO 会引起整个 Table 的重新渲染，需要优化
        this.tooltipContent = cell.textContent || cell.innerText;
        tooltip.referenceElm = cell;
        tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none');
        tooltip.doDestroy();
        tooltip.setExpectedState(true);
        this.activateTooltip(tooltip);
      }
    },

    handleCellMouseLeave(event) {
      const tooltip = this.$refs.tooltip;
      if (tooltip) {
        tooltip.setExpectedState(false);
        tooltip.handleClosePopper();
      }
      const cell = getCell(event);
      if (!cell) return;

      const oldHoverState = this.table.hoverState || {};
      this.table.$emit('cell-mouse-leave', oldHoverState.row, oldHoverState.column, oldHoverState.cell, event);
    },

    handleMouseEnter(index) {
      this.store.commit('setHoverRow', index);
    },

    handleMouseLeave() {
      this.store.commit('setHoverRow', null);
    },

    handleContextMenu(event, row) {
      this.handleEvent(event, row, 'contextmenu');
    },

    handleDoubleClick(event, row) {
      this.handleEvent(event, row, 'dblclick');
    },

    handleClick(event, row) {
      this.store.commit('setCurrentRow', row);
      this.handleEvent(event, row, 'click');
    },

    // handleMousedown (event) {
    //   console.log(event.target)
    // },

    // handleMousemove (event) {
    //   // console.log(event.target)
    // },

    handlerKeydown(event) {
      // 有道词典有毒，开启屏幕取词时双击鼠标会触发ctrl+c
      event.stopPropagation()
      event.returnvalue = false
      // 改变当前单元格
      this.updateCurrentCell(event);
      // 进入编辑
      this.keydowToEdit(event)
    },

    keydowToEdit (event) {
      if (keycodes[event.keyCode]) {
        const currentColumn = this.store.states.currentColumn
        const currentRow = this.store.states.currentRow
        if (currentColumn && currentRow) {
          this.store.commit('setEditRow', currentRow);
          this.store.commit('setEditColumn', currentColumn);
          this.editCell(this.$el.querySelector('.current-cell'), keycodes[event.keyCode])
          this.editHandler(currentRow, currentColumn, this.$el.querySelector('.current-cell'), keycodes[event.keyCode])
        }
      }
    },

    editHandler (row, column, cell, value) {
      this.store.commit('setEditRow', row);
      this.store.commit('setEditColumn', column);
      this.editCell(cell, value)
    },

    updateCurrentCell (event) {
      const keyAllow = [9, 13, 37, 38, 39, 40]
      const data = this.store.states.data || []
      const columns = this.store.states.columns || []
      const currentRow = this.store.states.currentRow
      const currentColumn = this.store.states.currentColumn
      const currentRowIndex = data.indexOf(currentRow)
      const currentColumnIndex = columns.indexOf(currentColumn)

      if (keyAllow.indexOf(event.keyCode) > -1) {
        if (event.keyCode === 38 && currentRowIndex > 0) {

          this.store.commit('setCurrentRow', data[currentRowIndex - 1]);

        } else if ((event.keyCode === 40 || event.keyCode === 13) && currentRowIndex < data.length - 1) {

          this.store.commit('setCurrentRow', data[currentRowIndex + 1]);

        } else if (event.keyCode === 37 && currentColumnIndex > 0) {

          this.store.commit('setCurrentColumn', columns[currentColumnIndex - 1]);

        } else if ((event.keyCode === 39 || event.keyCode === 9) && currentColumnIndex < columns.length - 1) {

          this.store.commit('setCurrentColumn', columns[currentColumnIndex + 1]);

        }
      }
    },

    handleEvent(event, row, name) {
      const table = this.table;
      const cell = getCell(event);
      let column;
      if (cell) {
        column = getColumnByCell(table, cell);
        if (column) {
          this.store.commit('setCurrentColumn', column);
          table.$emit(`cell-${name}`, row, column, cell, event);
          // 单元格编辑
          if (name === 'dblclick') {
            this.editHandler(row, column, cell)
          }
        }
      }
      table.$emit(`row-${name}`, row, event, column);
    },

    editCell (cell, value) {
      this.$nextTick(() => {
        const EditInput = cell.querySelector('input')
        if (value) {
          this.store.states.currentRow[this.store.states.currentColumn.property] = value
        }
        EditInput && EditInput.select()
      })
    },

    handleExpandClick(row, e) {
      e.stopPropagation();
      this.store.toggleRowExpansion(row);
    }
  }
};
