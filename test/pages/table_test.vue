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
    :row-class-name="rowClassNameHandler"
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
      :is-read-only="true"
      :sortable="true">
    </eas-table-column>
    <eas-table-column
      prop="name"
      label="姓名"
      width="180"
      align="center">
    </eas-table-column>
    <eas-table-column
      prop="date"
      label="日期"
      width="180"
      >
    </eas-table-column>
    <eas-table-column
      prop="address"
      label="地址"
      :show-overflow-tooltip="true"
      >
    </eas-table-column>
    <eas-table-column
      prop="money"
      label="账户余额"
      :is-read-only="true"
      class-name="money"
      >
    </eas-table-column>
    <eas-table-column
      prop="email"
      label="email">
    </eas-table-column>
    <eas-table-column
      type="index"
      label="index"
      width="50">
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
          date: `2016-05-${index % 2}1`,
          name: `${index % 2 === 0 ? 'Jack' : 'Rose'}`,
          address: '广东省深圳市罗湖区',
          email: 'vito.zhang@gmail.com',
          money: index * 1000000
        })
      }
      this.tableData = tableData
    },
    rowClassNameHandler (obj) {
      if (obj.row.money > 5000000) {
        return 'big-row'
      }
      return ''
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
<style lang="scss">
.big-row{
  .money{
    color: red;
  }
}
</style>
