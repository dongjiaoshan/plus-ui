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
  /** 退回入库库位（K4 联动外购入库目标库位） */
  locationId?: string;
  /** 库位名称（后端内存聚合填） */
  locationName?: string;
  returnQuantity: number;
  /** 报退货物重量(kg)（原型「货物重量」） */
  goodsWeight?: number;
  /** 退货状态 djs_store_return_status：pending=待仓库确认 / received=已入库 */
  returnStatus?: string;
  /** 仓库实收量（仓库确认时填） */
  receivedQty?: number;
  /** 仓库实收重量(kg)（仓库确认时填） */
  receivedWeight?: number;
  /** 仓库确认时间 */
  confirmTime?: string;
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

/** 退回操作「猪肉产品」tab 固定候选行（belong_type IN pork/white_bar，与门店关联无关） */
export interface StoreReturnPorkCandidateVO {
  /** 产品雪花 ID（提交退回时作 productId） */
  productId: string;
  productName: string;
  productUnit?: string;
}

/** 退回操作「果蔬产品」tab 候选行（= 该门店当天已确认到店的果蔬需求产品，按 product_id 去重） */
export interface StoreReturnVegCandidateVO {
  /** 产品雪花 ID（提交退回时作 productId） */
  productId: string;
  productName: string;
  productUnit?: string;
}

/** 退回操作批量录入单行 */
export interface StoreReturnBatchItem {
  productId: string;
  /** 退回量（果蔬按份/把/盒录入；猪肉可空，仅按重量） */
  returnQuantity?: number;
  /** 退回重量(kg) */
  returnWeight?: number;
  traceCode?: string;
}

/** 退回操作批量录入 form（对齐原型「退回操作」矩阵提交） */
export interface StoreReturnBatchForm {
  storeId?: string;
  items: StoreReturnBatchItem[];
}

/** 仓库确认实收 form（对齐原型「退回记录」仓库确认入库） */
export interface StoreReturnConfirmForm {
  id?: string;
  locationId?: string;
  receivedQty?: number;
  receivedWeight?: number;
}

export interface StoreReturnForm {
  id?: string;
  returnDirection: string;
  storeId?: string;
  productId?: string;
  /** 退回入库库位（K4 联动外购入库必填） */
  locationId?: string;
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
  /** 退货状态 pending/received */
  returnStatus?: string;
  returnDateFrom?: string;
  returnDateTo?: string;
}
