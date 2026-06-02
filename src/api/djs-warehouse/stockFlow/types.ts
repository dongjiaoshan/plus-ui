/**
 * 出入库流水 admin 端类型（WMS-MAT-001）。
 *
 * 与后端 StockFlowVo / StockFlowQuery 对齐。
 */

export interface StockFlowVO {
  id: number;
  flowNo: string;
  flowDate: string;
  productId?: number;
  productName?: string;
  productCode?: string;
  belongType?: string;
  productUnit?: string;
  warehouseId?: number;
  locationName?: string;
  inoutType: string;
  flowType: string;
  stockInType?: string;
  stockOutType?: string;
  stockOutDest?: string;
  changeNum: number;
  changeQuantity: number;
  supplierId?: number;
  earNo?: string;
  plotId?: number;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  proofOssIds?: string;
  createTime?: string;
}

export interface StockFlowQuery {
  flowNo?: string;
  flowType?: string;
  inoutType?: string;
  matType?: string;
  /** 雪花 ID 全链路 string —— Number() 会丢精度（coder-djs-cross-layer-contract） */
  productId?: string;
  productCode?: string;
  earNo?: string;
  plotId?: number;
  warehouseId?: number;
  stockOutDest?: string;
  operatorId?: number;
  dateFrom?: string;
  dateTo?: string;
  pageNum?: number;
  pageSize?: number;
}
