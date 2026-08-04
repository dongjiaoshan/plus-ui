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
  /** 产品归属类型 djs_belong_type（后端内存聚合填）：pork/white_bar=猪肉 tab，其余=果蔬 tab */
  belongType?: string;
  /** 产品业务编码 product_info.product_id（后端内存聚合填，「产品代码」列） */
  productCode?: string;
  /** 产品规格（后端内存聚合填） */
  productSpec?: string;
  /** 产品单位（后端内存聚合填，「单位」列） */
  productUnit?: string;
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
  /**
   * 仓库确认处置（row204）：0=退回入库 / 1=产品丢弃。
   * 仅 returnStatus='received' 的行有意义；pending 行是建表默认 0，不能当「否」展示。
   */
  isDiscard?: number;
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

/** 退回操作「猪肉产品」tab 子类（DENGBO-R11）：pork=猪肉产品(到店成品,按份) / white_bar=白条产品(字典,按重量) */
export type StoreReturnPorkSubCategory = 'pork' | 'white_bar';

/** 退回操作「猪肉产品」tab 候选行（猪肉产品=到店成品原材料 / 白条产品=djs_white_bar_return_product 字典） */
export interface StoreReturnPorkCandidateVO {
  /** 产品雪花 ID（提交退回时作 productId） */
  productId: string;
  productName: string;
  /** 单位：猪肉产品=产品自身单位(份)；白条产品=对应产品原材料单位 */
  productUnit?: string;
  /** 子类（DENGBO-R11）：pork=猪肉产品(按份,退回量+单位+重量) / white_bar=白条产品(按重量) */
  subCategory?: StoreReturnPorkSubCategory;
  /** 归属类型 djs_belong_type；gift_box 礼盒不可退回仓库（后端已剔除，前端二次过滤） */
  belongType?: string;
  /** 到店量（退回量上限 row40）：猪肉产品=当日到店需求订购份数 / 材料外售=对应成品到店重 / 白条=max(当日盘点 期初+入库, 材料外售到店重) */
  arrivedQuantity?: number;
  /** 今日已退量（row119）：剩余可退 = arrivedQuantity − returnedQuantity，即输入框 :max */
  returnedQuantity?: number;
}

/** 退回操作「果蔬产品」tab 候选行（= 该门店当天已确认到店的果蔬需求产品，按 product_id 去重） */
export interface StoreReturnVegCandidateVO {
  /** 产品雪花 ID（提交退回时作 productId） */
  productId: string;
  productName: string;
  productUnit?: string;
  /** 归属类型 djs_belong_type；gift_box 礼盒不可退回仓库（后端已剔除，前端二次过滤） */
  belongType?: string;
  /** 到店量（退回量上限 row41）= 当日（今天+昨天）该产品需求订购份数合计 */
  arrivedQuantity?: number;
  /** 今日已退量（row119）：剩余可退 = arrivedQuantity − returnedQuantity，即输入框 :max */
  returnedQuantity?: number;
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
  /** 产品名称模糊（后端下推产品 id 集过滤，跨页正确） */
  productName?: string;
  /** 产品业态 tab：pork=猪肉类(含白条) / vegetable=其他(含 belong_type 空)，后端下推过滤 */
  belongCategory?: 'pork' | 'vegetable';
}
