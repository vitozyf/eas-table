<template>
<div>
  <button @click.stop = "getSelectionRows">获取选中数据</button>
  <eas-table
    :data="tableData"
    :stripe="true"
    :border="true"
    :highlight-current-row="true"
    effect="light"
    ref="eastable"
    @row-click="rowClick"
    @edit:begin="editBegin"
    @edit:end="editEnd">
    <eas-table-column
      type="selection"
      >
    </eas-table-column>
    <eas-table-column
      prop="id"
      label="id"
      width="50"
      :is-read-only="true">
    </eas-table-column>
    <eas-table-column
      prop="date"
      label="日期"
      width="180"
      :sortable="true">
    </eas-table-column>
    <eas-table-column
      prop="name"
      label="姓名"
      width="180"
      align="center">
    </eas-table-column>
    <eas-table-column
      prop="address"
      label="地址"
      :show-overflow-tooltip="true"
      >
    </eas-table-column>
    <eas-table-column
      prop="email"
      label="email">
    </eas-table-column>
    <eas-table-column
      type="index"
      label="index"
      width="50"
      :is-read-only="true">
    </eas-table-column>
    <eas-table-column :is-read-only="true">
      <template slot-scope="scope">
        <button>编辑</button>
        <button>删除</button>
      </template>
    </eas-table-column>
    <div>
      测试
    </div>
  </eas-table>
</div>
</template>

<script>
export default{
  data () {
    return {
      tableData: [
      ]
    }
  },

  created () {
    this.initData()
  },

  methods: {
    initData () {
      let tableData = []
      for (let index = 0; index < 50; index++) {
        tableData.push({
          id: index,
          date: '2016-05-02',
          name: `王小虎${index}`,
          address: '上海市普陀区金沙江路 1518 弄',
          email: 'vito.zhang@gmail.com'
        })
      }
      this.tableData = tableData
    },
    editBegin (row, column, cell) {
      // console.log(row, column, cell)
    },
    editEnd (row, column, cell) {
      // console.log(row, column, cell)
    },
    getSelectionRows () {
      console.log(this.$refs.eastable.getSelectionRows())
    },
    rowClick (row) {
      // console.log(this.$refs.eastable.store.cleanSelection())
    }
  }
}
</script>
