/**
 * 退货管理类型（WMS-SHIP-001）。
 *
 * 对齐后端 t_warehouse_return_product 17 字段 + return_direction（决策 a 加列）。
 */

export interface ReturnProductVO {
  id?: string;
  returnNo: string;
  storeId?: string;
  /** 退货门店名称（后端 service 回填） */
  storeName?: string;
  applyTime: string;
  productId: string;
  /** 退货品类 belongType（djs_belong_type，后端回填） */
  returnCategory?: string;
  /** 退货产品编号 = 产品业务码（后端回填） */
  returnProductCode?: string;
  productName: string;
  /** 退货单位（产品 productUnit，后端回填） */
  productUnit?: string;
  /** 产品原材料名（后端回填） */
  productMaterialName?: string;
  returnWeight: number;
  confirmWeight?: number;
  /** 重量差异 = returnWeight - confirmWeight（后端衍生，未确认为空） */
  weightDiff?: number;
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

/**
 * 退货管理「门店 + 当日」汇总行（图 153，外层主从视图外层）。
 * 一行 = 某门店某天全部退货行的聚合，点「查看详情」下钻该门店当天逐条明细。
 */
export interface ReturnStoreDailyVO {
  /** 退货日期（apply_time 截到天，yyyy-MM-dd） */
  returnDate: string;
  /** 退回类型 djs_store_return_type：store=门店退回 / unit=单位退回（STR-RETURN-OPS-001） */
  returnType?: string;
  /** 退回单位名（仅 returnType=unit） */
  returnUnit?: string;
  storeId?: string;
  /** 「退回门店」展示值：门店退回 → 门店名；单位退回 → 退回单位名（后端已统一回填） */
  storeName?: string;
  /** 退回状态 djs_store_return_status：pending=待处理 / received=已处理（组内还有 pending 就是 pending） */
  returnStatus?: string;
  /** 退货品种数 = 该组 distinct product_id 计数 */
  productKindCount: number;
  /** 猪肉产品品类数 = 该组 distinct product_id 里 belong_type ∈ (pork, white_bar) 的个数（后端算，前端不得 filter） */
  porkKindCount?: number;
  /** 果蔬产品品类数 = belong_type='vegetable' 的个数 */
  vegKindCount?: number;
  /** 其他产品品类数 = 其余全部（含 belong_type 为空）的个数 */
  otherKindCount?: number;
  /** 退回操作人 ID／姓名 */
  operatorId?: string;
  operatorName?: string;
  /** 退回时间（提交那一刻，后端取 create_time） */
  returnTime?: string;
  /** 退货重量合计 */
  returnWeightTotal?: number;
  /** 确认重量合计 */
  confirmWeightTotal?: number;
  /** 重量差异合计 = 退货重量合计 - 确认重量合计（均只算按重量计 kg 行） */
  weightDiffTotal?: number;
  /** 非重量产品退回重量合计 = Σ 份数产品（非 kg 单位）行的确认重量（仓库称重） */
  nonWeightReturnWeightTotal?: number;
  /** 已确认行数（该组 returnStatus=received 计数），与 totalCount 组成「确认进度」 */
  confirmedCount?: number;
  /** 总行数（该组全部退回行，含未确认） */
  totalCount?: number;
  /** 已确认且**退回入库**的行数（row203「确认进度」左侧数） */
  inboundCount?: number;
  /** 已确认且**产品丢弃**的行数（row203「确认进度」右侧数） */
  discardCount?: number;
  /** 确认时间（该组最近一条已确认行；只要有 1 条确认过就有值 → 判断是否全部确认要看 confirmedCount/totalCount） */
  confirmTime?: string;
  confirmUser?: string;
  /** 确认人姓名（该组最近一条已确认行，后端翻译） */
  confirmUserName?: string;
  /** 前端合成行键（returnDate + storeId），表格 row-key 用，非后端字段 */
  _rowKey?: string;
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
  /** 退回门店多选（R70 退回门店下拉多选）。 */
  storeIds?: string[];
  productId?: string;
  /** 退回产品多选（R70 退回产品下拉多选）。 */
  productIds?: string[];
  /** 退货品类 belongType（djs_belong_type） */
  returnCategory?: string;
  isConfirm?: number;
  returnDirection?: string;
  returnStatus?: string;
  applyDateFrom?: string;
  applyDateTo?: string;
  /** STORE-RETURN-UNIFY-001：改读 t_store_return 后按 return_date 过滤（store 端点参数）。 */
  returnDateFrom?: string;
  returnDateTo?: string;
  /**
   * 退回类型 djs_store_return_type（STR-RETURN-OPS-001）：
   * store=门店退回 / unit=单位退回；空 = 两类都查。
   */
  returnType?: string;
  /**
   * 退回单位（仅 returnType=unit 有意义）。单位退回没有门店，查明细时必须带上它才能定位到唯一一张单。
   */
  returnUnit?: string;
}

export interface ReturnConfirmBody {
  confirmWeight: number;
  remark?: string;
}
