<template>
  <div id="app">
    <eas-table
      :data="tableData"
      :stripe="true"
      :border="true"
      :highlight-current-row="true">
      <eas-table-column
        type="selection"
        fixed="left">
      </eas-table-column>
      <eas-table-column
        type="index">
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
        align="center"
        class-name="aaa">
      </eas-table-column>
      <eas-table-column
        prop="address"
        label="地址"
        :show-overflow-tooltip="true">
      </eas-table-column>
    </eas-table>
  </div>
</template>

<script>

export default {
  name: 'app',
  components: {

  },
  data () {
    return {
      tableData: [
        {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        }, {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
#app {

}
</style>
