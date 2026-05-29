/**
 * 退货管理类型（WMS-SHIP-001）。
 *
 * 对齐后端 t_warehouse_return_product 17 字段 + return_direction（决策 a 加列）。
 */

export interface ReturnProductVO {
  id?: string;
  returnNo: string;
  storeId?: string;
  applyTime: string;
  productId: string;
  productName: string;
  returnWeight: number;
  confirmWeight?: number;
  confirmUser?: string;
  confirmUserName?: string;
  confirmTime?: string;
  isConfirm: number;
  returnReason?: string;
  /** 字典 djs_return_direction：customer_to_store / store_to_warehouse / warehouse_to_supplier */
  returnDirection: string;
  /** 字典 djs_return_status：pending / confirmed / rejected */
  returnStatus: string;
  proofOssIds?: string;
  remark?: string;
  createTime?: string;
}

export interface ReturnProductForm {
  id?: string;
  storeId?: string;
  applyTime?: string;
  productId: string;
  productName?: string;
  returnWeight: number;
  returnReason?: string;
  returnDirection?: string;
  proofOssIds?: string;
  remark?: string;
}

export interface ReturnProductQuery {
  pageNum?: number;
  pageSize?: number;
  returnNo?: string;
  storeId?: string;
  productId?: string;
  isConfirm?: number;
  returnDirection?: string;
  returnStatus?: string;
  applyDateFrom?: string;
  applyDateTo?: string;
}

export interface ReturnConfirmBody {
  confirmWeight: number;
  remark?: string;
}
