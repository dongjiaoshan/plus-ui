export default {
  button: 'Print demand sheets',
  title: 'Print demand sheets',
  confirmedOnlyHint: 'Submitted demands are listed. Only confirmed items are printed.',
  field: {
    demandDate: 'Demand date',
    store: 'Store'
  },
  placeholder: {
    begin: 'Start date',
    end: 'End date',
    store: 'Select store'
  },
  column: {
    demandDate: 'Demand date',
    categoryCount: 'Categories',
    storeName: 'Store',
    actions: 'Actions'
  },
  action: {
    search: 'Search',
    reset: 'Reset',
    print: 'Print',
    summaryPrint: 'Print summary demand sheet'
  },
  empty: 'No submitted demand for the selected date and stores',
  emptySheet: 'No confirmed demand for this store on this date',
  summaryFailed: 'Summary printing failed. Check the error message and try again.',
  emptySummary: 'No confirmed demand to summarize for the selected date and stores',
  summary: { titleSuffix: 'Summary demand report', productSpec: 'Spec', rawMaterialName: 'Raw material' },
  sheet: {
    titleSuffix: 'Order sheet',
    demandDate: 'Order date',
    storeName: 'Store',
    categoryCount: 'Total categories',
    seq: 'No.',
    productName: 'Product',
    productSpec: 'Spec',
    demandQuantity: 'Quantity',
    unit: 'Unit',
    remark: 'Remark',
    prepared: 'Prepared',
    unitHead: 'head',
    preparedBy: 'Prepared by',
    printDate: 'Prepared on',
    footerStore: 'Store'
  }
};
