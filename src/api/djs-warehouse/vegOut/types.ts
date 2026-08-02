/** 毛菜间出库-可选产品行（row187 新增抽屉左侧） */
export interface VegOutCandidateVO {
  stockId: string;
  productId: string;
  productName: string;
  productSpec?: string;
  /** 库存重量（BigDecimal 后端可能序列化为 string） */
  stockWeight: number | string;
  productUnit?: string;
  plotId?: string;
  plotCode?: string;
}

/** 毛菜间出库单（row187 列表行，一次提交聚合成一行） */
export interface VegOutBatchVO {
  batchNo: string;
  outDate: string;
  outDest: string;
  productKinds: number;
  totalWeight: number | string;
  operatorId?: string;
  operatorName?: string;
}

/** 毛菜间出库单明细（row187 详情弹框） */
export interface VegOutDetailVO {
  productName: string;
  productSpec?: string;
  outWeight: number | string;
  plotCode?: string;
}

export interface VegOutQuery {
  pageNum?: number;
  pageSize?: number;
  beginDate?: string;
  endDate?: string;
  outDest?: string;
  operatorId?: number | string;
}
