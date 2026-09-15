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
  /**
   * 产品**原材料单位**（后端内存聚合填；无原材料 / 原材料无单位时后端已回落产品自身单位）。
   * 「仓库实收量」的计量口径由它决定：= KG → received_weight 是重量(kg,3 位小数)；≠ KG → 是件数(整数 + 产品单位)。
   */
  materialUnit?: string;
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
  /** 当日到店量：仅「当日到店的生产产品」行有值；清单产品不封顶，后端恒下发 null */
  arrivedQuantity?: number;
  /** 今日已退量：到店行的剩余可退 = arrivedQuantity − returnedQuantity，即输入框 :max */
  returnedQuantity?: number;
  /** 是不是「退回产品清单」里的产品（row221：候选=清单 ∪ 当日到店生产产品，规则按来源分流） */
  inReturnList?: boolean;
}

/** 退回操作「果蔬产品」tab 候选行（= 该门店当天已确认到店的果蔬需求产品，按 product_id 去重） */
export interface StoreReturnVegCandidateVO {
  /** 产品雪花 ID（提交退回时作 productId） */
  productId: string;
  productName: string;
  productUnit?: string;
  /** 归属类型 djs_belong_type；gift_box 礼盒不可退回仓库（后端已剔除，前端二次过滤） */
  belongType?: string;
  /** 当日到店量：仅「当日到店的生产产品」行有值；清单产品不封顶，后端恒下发 null */
  arrivedQuantity?: number;
  /** 今日已退量：到店行的剩余可退 = arrivedQuantity − returnedQuantity，即输入框 :max */
  returnedQuantity?: number;
  /** 是不是「退回产品清单」里的产品（row221：候选=清单 ∪ 当日到店生产产品，规则按来源分流） */
  inReturnList?: boolean;
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

/** 仓库确认实收 form（对齐原型「退回记录」仓库确认入库，也是「门店退回操作 → 退回处理」的入参） */
export interface StoreReturnConfirmForm {
  id?: string;
  locationId?: string;
  /**
   * 仓库实收量 / 实收重量 —— 都是**原材料量**。
   * admin 抽屉界面按退回单位录，提交前乘 materialNum 换算（与 mp metric.ts#toConfirmWeight 同源）。
   */
  receivedQty?: number;
  receivedWeight?: number;
  /** 处置方式：0/null=退回入库（默认，写库存） / 1=产品丢弃（不入库） */
  isDiscard?: number;
  /** 猪肉退货入库库位类型：fresh=猪肉鲜品库 / frozen=冻品库（仅 pork 生效） */
  targetLocationType?: string;
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
  /**
   * 产品业态 tab（三值，后端下推过滤）：
   * pork=猪肉类(含白条) / vegetable=果蔬(只认 vegetable) / other=其余全部(干货/蛋类/礼盒/其他/空归属)
   */
  belongCategory?: 'pork' | 'vegetable' | 'other';
  /** 退回类型 djs_store_return_type：store=门店退回 / unit=单位退回（空 = 两类都查）。 */
  returnType?: string;
  /** 退回单位（仅 returnType=unit 有意义）。 */
  returnUnit?: string;
}

// ---------------------------------------------------------------------------
// STR-RETURN-OPS-001 admin「门店退回操作」
// ---------------------------------------------------------------------------

/** 库位下拉项（对齐后端 LocationPickerVo，与 mp LocationPicker 同构）。 */
export interface LocationPickerVO {
  /** 库位 ID（snowflake string） */
  id: string;
  locationCode?: string;
  locationName?: string;
  locationType?: string;
  locationSort?: number;
}

/**
 * 门店退回操作抽屉行（{@code GET /djs/store/return/operation/items}）。
 *
 * 「退回处理」与「查看详情」共用同一份数据：待处理行按可编辑渲染（默认值 = 后端给的判据），
 * 已处理行（returnStatus='received'）渲染为只读文本。
 */
export interface StoreReturnOpsItemVO {
  id: string;
  returnNo?: string;
  returnType?: string;
  returnUnit?: string;
  storeId?: string;
  storeName?: string;
  productId?: string;
  productName?: string;
  productSpec?: string;
  /** 产品单位 = 退回单位：决定第三列标题 / 后缀 / 精度 */
  productUnit?: string;
  /** 原材料单位（缺省已由后端回落产品单位） */
  materialUnit?: string;
  /** 计量规则（一件折算多少原材料，缺配回落 1）；提交前乘它换算回原材料量 */
  materialNum?: number;
  /** 是否配在「退回产品清单」里 → 非 kg 行两位小数的判据 */
  inReturnList?: boolean;
  /** 能否退回入库（false → 只能产品丢弃） */
  canInbound?: boolean;
  /** 能否做单位换算（false → 锁行，后端也拒） */
  canConvert?: boolean;
  returnQuantity?: number;
  returnWeight?: number;
  receivedQty?: number;
  receivedWeight?: number;
  locationId?: string;
  locationName?: string;
  /** 入库库位下拉默认值 */
  defaultLocationId?: string;
  /** 入库库位下拉可选项（猪肉固定鲜品库/冻品库） */
  locationOptions?: LocationPickerVO[];
  isDiscard?: number;
  returnStatus?: string;
  returnDate?: string;
  operatorId?: string;
  operatorName?: string;
  confirmUserId?: string;
  confirmUserName?: string;
  confirmTime?: string;
}

/** 「新增单位退回」弹框候选行（{@code GET /djs/store/return/operation/unit-candidates}）。 */
export interface StoreReturnUnitCandidateVO {
  productId: string;
  /** 产品业务编码（字典里配的就是它） */
  productCode?: string;
  productName?: string;
  productSpec?: string;
  belongType?: string;
  productUnit?: string;
  materialUnit?: string;
  materialNum?: number;
  inReturnList?: boolean;
  canInbound?: boolean;
  canConvert?: boolean;
  defaultLocationId?: string;
  locationOptions?: LocationPickerVO[];
}

/** 单位退回提交单行。 */
export interface StoreReturnUnitItemForm {
  productId: string;
  /** 退回量（按产品单位；kg 三位小数、非 kg 清单内两位，前端限制） */
  returnQuantity: number;
  /** 入库库位（未丢弃行必填） */
  locationId?: string;
  /** 0=产品入库（默认） / 1=产品丢弃 */
  isDiscard?: number;
}

/** 「新增单位退回」提交体（{@code POST /djs/store/return/unit}）。 */
export interface StoreReturnUnitForm {
  /** 退回日期（yyyy-MM-dd） */
  returnDate: string;
  /** 退回单位（字典 djs_return_unit） */
  returnUnit: string;
  items: StoreReturnUnitItemForm[];
}

/**
 * 门店退回操作页「退回门店」筛选项（{@code GET /djs/store/return/operation/owner-options}，V6 row222）。
 *
 * 取值是现有退回记录里出现过的门店 / 退回单位去重，不是全量门店档案。
 */
export interface StoreReturnOwnerOptionVO {
  /** store=门店退回 / unit=单位退回 */
  returnType: string;
  /** 门店 id（returnType=store 时有值） */
  storeId?: string;
  /** 退回单位字典 value（returnType=unit 时有值） */
  returnUnit?: string;
  /** 列表「退回门店」列上显示的那个名字 */
  label: string;
}
