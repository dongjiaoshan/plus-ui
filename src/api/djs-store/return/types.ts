/**
 * 门店退回管理类型（STR-RETURN-001，门店域薄实现，admin only）。
 *
 * 对齐后端 t_store_return（doc/11 §3.9）。
 * ⚠️ 契约 1：snowflake ID 字段一律 string（id / storeId / productId / memberId / operatorId），不准 number。
 */

export interface StoreReturnVO {
  id?: string;
  returnNo: string;
  /** 字典 djs_return_direction：customer_to_store / store_to_warehouse / warehouse_to_supplier */
  returnDirection: string;
  storeId?: string;
  /** 门店名称（后端内存聚合填） */
  storeName?: string;
  productId: string;
  /** 产品名称（后端内存聚合填） */
  productName?: string;
  returnQuantity: number;
  returnReason?: string;
  /** 已贴追溯码字符串，V1 仅存值无 FK */
  traceCode?: string;
  returnDate: string;
  /** 会员退回的会员 ID，V1 仅存值无 FK */
  memberId?: string;
  operatorId?: string;
  /** 经手人姓名（USER_ID_TO_NAME 翻译） */
  operatorName?: string;
  remark?: string;
  createTime?: string;
}

export interface StoreReturnForm {
  id?: string;
  returnDirection: string;
  storeId?: string;
  productId?: string;
  returnQuantity?: number;
  returnReason?: string;
  traceCode?: string;
  returnDate?: string;
  memberId?: string;
  remark?: string;
}

export interface StoreReturnQuery {
  pageNum?: number;
  pageSize?: number;
  returnNo?: string;
  storeId?: string;
  productId?: string;
  returnDirection?: string;
  returnDateFrom?: string;
  returnDateTo?: string;
}
