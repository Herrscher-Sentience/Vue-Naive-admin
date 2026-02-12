import { computed, nextTick, reactive, ref } from 'vue'

export function useListPage(options = {}) {
  const {
    designScope = '',
    tableProps = {}
  } = options

  // 表格配置
  const config = reactive({
    title: tableProps.title || '',
    dataSource: tableProps.dataSource || [],
    columns: tableProps.columns || [],
    size: tableProps.size || 'medium',
    actionColumn: tableProps.actionColumn || null,
    pagination: tableProps.pagination || {
      page: 1,
      pageSize: 10,
      showSizePicker: true,
      pageSizes: [10, 20, 30, 50],
      prefix({ itemCount }) {
        return `共 ${itemCount} 条数据`
      }
    },
    ...tableProps
  })

  // 表格数据
  const loading = ref(false)
  const tableData = ref(config.dataSource || [])
  const selectedRowKeys = ref([])

  // 分页信息
  const pagination = reactive({
    ...config.pagination,
    itemCount: (config.dataSource || []).length,
    onChange: (page) => {
      pagination.page = page
      handlePageChange()
    },
    onUpdatePageSize: (pageSize) => {
      pagination.pageSize = pageSize
      pagination.page = 1
      handlePageChange()
    }
  })

  // 注册表格
  const registerTable = (instance) => {
    if (instance) {
      // 可以在这里保存表格实例引用
      console.log('Table registered:', designScope)
    }
  }

  // 页码变化
  const handlePageChange = () => {
    // 可以在这里触发数据加载
    console.log('Page changed:', pagination.page, pagination.pageSize)
  }

  // 获取表格列
  const getColumns = computed(() => {
    return config.columns
  })

  // 获取操作列
  const getActionColumn = computed(() => {
    return config.actionColumn
  })

  // 刷新表格
  const reload = async () => {
    loading.value = true
    try {
      // 这里可以调用 API 获取数据
      await nextTick()
    }
    finally {
      loading.value = false
    }
  }

  // 获取选中的行
  const getSelectedRows = () => {
    return selectedRowKeys.value
  }

  // 设置选中的行
  const setSelectedRows = (keys) => {
    selectedRowKeys.value = keys
  }

  // 清空选中
  const clearSelection = () => {
    selectedRowKeys.value = []
  }

  return {
    tableContext: [
      registerTable,
      {
        loading,
        tableData,
        columns: getColumns,
        actionColumn: getActionColumn,
        pagination,
        reload,
        getSelectedRows,
        setSelectedRows,
        clearSelection,
        config
      }
    ],
    registerTable,
    loading,
    tableData,
    columns: getColumns,
    actionColumn: getActionColumn,
    pagination,
    reload,
    getSelectedRows,
    setSelectedRows,
    clearSelection,
    config
  }
}
