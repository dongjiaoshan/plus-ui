/**
 * 发货产品生产记录 admin 端类型（WMS-PACK-001）。
 *
 * 与后端 ProductProductionVo / ProductProductionQuery 对齐。
 */

export interface ProductProductionVO {
  id: number;
  produceNo: string;
  produceDate: string;
  productId: number;
  productName: string;
  productType: number;
  productUnit: string;
  productSpec?: string;
  plotId?: number;
  plotName?: string;
  earNo?: string;
  productSort?: number;
  productWeight: number;
  storeId?: number;
  storeName?: string;
  produceTime: string;
  isDeliveryCheck: number;
  deliveryCheckTime?: string;
  isArrivalConfirm: number;
  arrivalConfirmTime?: string;
  whiteBarId?: number;
  materialId?: number;
  materialConsume?: number;
  /** 原材料名称（materialId → product_name，后端 fillJoinNames 回填；row168 明细列）。 */
  materialName?: string;
  /** 原材料单位（契约 a：随 materialConsume 返回，损坏明细「原材料量」列单位展示）。 */
  materialUnit?: string;
  /** 关联需求 id（契约 a：按需求下钻 production 明细用）。 */
  demandId?: number | string;
  /** 是否损坏（0=否 / 1=是，字典 djs_yes_no；契约 a/b）。 */
  isDamaged?: number;
  /** 损坏凭证 ossId CSV（契约 b：标损时写入）。 */
  damageEvidenceOssIds?: string;
  /** 损坏备注（契约 b）。 */
  damageRemark?: string;
  /** 标损时间（契约 b）。 */
  damageTime?: string;
  supplierId?: number;
  produceLocation: number;
  deliverType?: number;
  /** 去向：platform=发货月台 / gift=礼盒（礼盒组件） */
  deliverDest?: 'platform' | 'gift' | string;
  packStatus: 'pending' | 'packed' | 'shipped_out';
  proofOssIds?: string;
  traceCode?: string;
  remark?: string;
  createBy?: number;
  createByName?: string;
  createTime?: string;
}

/**
 * 产品维度聚合行（主列表「产品生产」概览）。
 * 后端 ProductProductionGroupVo：按 (product_id, DATE(produce_date)) 分组。
 * productId 走 string 契约避雪花精度截断；「查看」下钻携 produceDate + productId。
 */
export interface ProductProductionGroupVO {
  produceDate: string;
  productId: number | string;
  productName: string;
  productUnit?: string;
  productSpec?: string;
  belongType?: string;
  productType?: number;
  produceQty: number;
  itemCount: number;
  /** 原材料名称：material_id → product_info.product_name（后端聚合回填；row167 列表列） */
  materialName?: string;
  /** 原材料消耗量：该组 SUM(material_consume)（同产品当日累计消耗的来源原材料重量） */
  materialConsume?: number;
  /** 原材料单位：material_id → product_info.product_unit（后端聚合回填，无配料则空） */
  materialUnit?: string;
  /** 需求门店数：该产品当前有未发货需求的门店家数（后端聚合返回，row114-3 待后端补 SQL） */
  storeDemandCount?: number;
  /** 损坏量：该组（同产品同生产日）已标损坏件数 SUM(is_damaged)（row50，>0 红色） */
  damageCount?: number;
}

export interface ProductProductionQuery {
  produceNo?: string;
  /** 产品名称模糊搜索（row114-2 待后端 selectProductionGroupList 加 LIKE） */
  productName?: string;
  productId?: number | string;
  productType?: number;
  belongType?: string;
  /** 产品品类多选（R70；非空时后端按 IN 过滤 product_info.belong_type，优先于单值 belongType）。 */
  belongTypes?: string[];
  /** 产品序号：row115-1 改文本模糊搜索后透传字符串关键字（后端 product_sort LIKE） */
  productSort?: number | string;
  packStatus?: string;
  earNo?: string;
  plotId?: number | string;
  storeId?: number | string;
  /** 按需求下钻 production 明细（契约 a：损坏弹框列表用）。 */
  demandId?: number | string;
  /** 是否损坏过滤（0=否 / 1=是；契约 a：损坏弹框「是否损坏」搜索条用，空=全部）。 */
  isDamaged?: number;
  /** 是否存在损坏（作用于聚合 row50：0=组内无损坏 / 1=有；空=全部）。 */
  hasDamage?: number;
  /** 门店需求「产品明细」下钻置 true：排除礼盒组件产出（deliver_dest='gift'，不履约门店直接需求）。生产记录概览不传。 */
  excludeGiftDeliver?: boolean;
  produceDate?: string;
  produceDateFrom?: string;
  produceDateTo?: string;
  produceTimeFrom?: string;
  produceTimeTo?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 白条发货记录行（WS12 row133）。
 * 后端 WhiteBarShipmentVo：product_production 中 belong_type='white_bar' 的出库记录。
 * outMethod（djs_bar_out_method 派生：1=发货月台 / 3=仓库出库）/ outDest（djs_stock_out_dest）。
 */
export interface WhiteBarShipmentVO {
  id: number | string;
  /** 发货日期（时分秒 = produce_time） */
  produceTime: string;
  /** 产品编码（product_info.product_id 业务码） */
  productCode?: string;
  productName?: string;
  /** 猪只耳号 */
  earNo?: string;
  /** 出库方式（djs_bar_out_method 派生值 '1'/'3'） */
  outMethod?: string;
  /** 出库去向（djs_stock_out_dest 值） */
  outDest?: string;
  /** 发货门店名（store_id→store_name，发货月台到门店有值；非到门店为空） */
  storeName?: string;
  /** 出库量 */
  productWeight?: number;
  productUnit?: string;
  createBy?: number;
  /** 操作人昵称 */
  operatorName?: string;
}

/**
 * 白条发货记录查询参数（WS12 row133）。
 * 与后端 WhiteBarShipmentQuery 对齐。
 */
export interface WhiteBarShipmentQuery {
  /** 发货日期起 yyyy-MM-dd */
  beginDate?: string;
  /** 发货日期止 yyyy-MM-dd */
  endDate?: string;
  /** 猪只耳号模糊 */
  earNo?: string;
  /** 出库方式多选（djs_bar_out_method 派生值） */
  outMethods?: string[];
  /** 出库去向多选（djs_stock_out_dest） */
  outDests?: string[];
  pageNum?: number;
  pageSize?: number;
}

/**
 * 标记/修改产品损坏表单（契约 b：POST /djs/warehouse/production/mark-damage）。
 *
 * id 是雪花（19 位 > 2^53），全链路 string 避免精度丢失（见 OssUpload 数据契约）。
 */
export interface MarkDamageForm {
  /** 产品生产记录 id（ProductProductionVO.id，雪花 string）。 */
  id: string;
  /** 损坏凭证 ossId CSV（OssUpload 上传后的 ossId 数组 join(',')）。 */
  evidenceOssIds: string;
  /** 损坏备注（非必填）。 */
  remark?: string;
}
