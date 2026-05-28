/**
 * 采购入库简化版类型定义（D9 hotfix）。
 *
 * 后端：org.dromara.djs.warehouse.purchase.*  /djs/warehouse/purchaseIn
 */

export interface PurchaseInBo {
  productId: number | string;
  locationId: number | string;
  /** 后端 BigDecimal，> 0 */
  quantity: number | string;
  remark?: string;
}

export interface PurchaseInRecordVO {
  id: number | string;
  flowNo: string;
  flowDate: string;
  productId?: number | string;
  productName?: string;
  productUnit?: string;
  locationId?: number | string;
  locationName?: string;
  /** 入库数量（恒为正） */
  changeQuantity: number;
  operatorId?: number | string;
  operatorName?: string;
  remark?: string;
  createTime?: string;
}

export interface PurchaseInQuery {
  productId?: number | string;
  locationId?: number | string;
  dateFrom?: string;
  dateTo?: string;
  pageNum?: number;
  pageSize?: number;
}
