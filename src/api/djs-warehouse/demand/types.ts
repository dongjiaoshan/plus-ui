/**
 * 需求管理类型定义（WMS-DEMAND-001）。
 *
 * 4 业态共用一组 VO/Form/Query；id / storeId / productId 均 string（snowflake JS 精度问题，
 * 参 .claude/skills/coder-djs-cross-layer-contract.md §契约 1）。
 */

/** 需求业态枚举（与字典 djs_demand_product_type 对齐，7 业态）。 */
export type DemandProductType = 'white_bar' | 'pig' | 'vegetable' | 'dry' | 'egg' | 'gift_box' | 'other';

/** 需求状态 7 态（与字典 djs_demand_status 对齐）。 */
export type DemandStatusCode = 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'IN_PRODUCTION' | 'PARTIAL_SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface DemandManageVO extends BaseEntity {
  id: string;
  demandNo: string;
  demandDate: string;
  storeId: string;
  productId: string;
  productName: string;
  productSpec?: string;
  productType: DemandProductType;
  demandQuantity: number | string;
  productUnit: string;
  rawMaterial?: string;
  materialQty?: number | string;
  demandRemark?: string;
  demandExplain?: string;
  demandStatus: DemandStatusCode;
  demandConfirmer?: string;
  /** @Translation 后端 enrich */
  demandConfirmerName?: string;
  confirmerTime?: string;
  expectedArriveDate?: string;
  shippedCount: number | string;
  confirmedCount: number | string;
  /** 该产品被去重门店需求数（后端按 productId 分组统计）。 */
  storeCount?: number;
  /** 是否已指定猪只（确认页带 productId 时后端回填；白条/猪业态有意义）。 */
  pigAssigned?: boolean;
  /** JSON 字符串；前端解析后渲染 timeline。 */
  auditHistory?: string;
  /** @Translation 后端 enrich */
  createByName?: string;
  remark?: string;
}

export interface DemandManageForm {
  id?: string;
  demandDate: string;
  storeId: string;
  productId: string;
  productName: string;
  productType: DemandProductType;
  productSpec?: string;
  demandQuantity: number;
  productUnit: string;
  rawMaterial?: string;
  materialQty?: number;
  demandRemark?: string;
  demandExplain?: string;
  expectedArriveDate?: string;
  remark?: string;
}

export interface DemandManageQuery extends PageQuery {
  demandNo?: string;
  productType?: DemandProductType;
  /** 业态多选（R70 产品类型下拉多选）。 */
  productTypes?: DemandProductType[];
  /**
   * 状态过滤。明细列表传 7 态 DemandStatusCode；
   * 汇总分组列表（group-list）传聚合三态 DemandGroupStatusCode（后端 queryGroupList 内存过滤）。
   */
  demandStatus?: DemandStatusCode | DemandGroupStatusCode;
  /** 状态多选（R70 需求状态下拉多选）。明细列表传 7 态；汇总分组列表传聚合三态。 */
  demandStatuses?: (DemandStatusCode | DemandGroupStatusCode)[];
  productName?: string;
  storeId?: string;
  /** 需求门店多选（R70 需求门店下拉多选）。 */
  storeIds?: string[];
  /** 产品 ID 精确过滤（确认页：某产品某日的所有门店需求单）。 */
  productId?: string;
  /** 需求日期精确过滤（确认页：配合 productId）。 */
  demandDate?: string;
  beginDate?: string;
  endDate?: string;
}

/** 分组三态（0613-10 点4，前端文案 map djs_demand_group_status）。 */
export type DemandGroupStatusCode = 'PENDING' | 'ALL_CONFIRMED' | 'PARTIAL';

/**
 * 需求汇总分组 VO（0613-10）：按「需求日期 + 需求产品」聚合。
 *
 * productId string 避雪花精度；「查看需求」携 demandDate+productId 下钻确认页。
 */
export interface DemandGroupVO {
  demandDate: string;
  productId: string;
  productName: string;
  productSpec?: string;
  /** 内部业态（驱动状态机分支）；列表「需求产品类型」列已改用 belongType 展示。 */
  productType: DemandProductType;
  /** 产品类别（djs_belong_type，取自产品主数据 belong_type；列表统一按产品配置产品类别展示/筛选）。 */
  belongType?: string;
  rawMaterial?: string;
  demandQuantity: number | string;
  materialQty?: number | string;
  productUnit?: string;
  /** 原材料单位（原材料产品 product_unit；未配原材料时为空）。row54。 */
  materialUnit?: string;
  storeCount: number;
  confirmedStoreCount: number;
  /** 三态：PENDING 待确认 / ALL_CONFIRMED 已全部确认 / PARTIAL 部分确认。 */
  demandStatus: DemandGroupStatusCode;
  /** 确认率（0~1 小数；前端 *100 toFixed 转 %）。 */
  confirmRate: number | string;
  lastConfirmTime?: string;
  /** 前端注入的复合 row-key（demandDate + productId），后端不返回。 */
  rowKey?: string;
}

export interface DemandPigVO {
  id: string;
  demandId: string;
  earNo: string;
  assignedAt: string;
  assignedBy: string;
  assignedByName?: string;
}

export interface AssignPigForm {
  earNos: string[];
}

/** 「可出栏」育肥猪 VO（DJS-FIX-ADMIN-W22-001）。 */
export interface PigAvailableVO {
  earNo: string;
  pigSex?: string;
  pigBreedLabel?: string;
  ageDays?: number;
  lastBackfat?: number | string;
}

/**
 * 需求确认页 SummaryBar union DTO（DJS-FIX-ADMIN-W22-003）。
 *
 * 4 业态共用一个 VO，按 productType 填不同字段，其余字段保持 null/undefined。
 */
export interface DemandSummaryVO {
  productType: DemandProductType;

  // white_bar
  availablePigs?: number;

  // vegetable
  plotCount?: number;
  expectedYieldKg?: number | string;
  earliestPickDate?: string;
  currentStockKg?: number | string;

  // gift_box
  giftBoxStock?: number | string;

  // other
  rawMaterialStockKg?: number | string;
}

/**
 * 产品需求详情：某产品下单个门店的需求聚合（72-1 详情弹窗用）。
 *
 * 后端 GET /djs/warehouse/demand/product-store-detail?productId= 返回数组。
 */
export interface DemandProductStoreDetailVO {
  /** 门店名称。 */
  storeName: string;
  /** 该门店对本产品的需求总量。 */
  demandQuantity: number | string;
  /** 该门店对本产品的需求单数。 */
  demandCount: number;
}

export interface AuditHistoryEntryVO {
  from: DemandStatusCode | string;
  to: DemandStatusCode | string;
  event: string;
  operator?: string;
  operatorName?: string;
  ts?: string;
  remark?: string;
}

/**
 * 需求管理页顶部「今日全局」KPI 横条（DJS-FIX-ADMIN-W22-007）。
 *
 * 6 个跨业态聚合数字（非 ID，用 number 安全）。当日无 demand → 6 数全 0。
 */
export interface DemandTodayKpiVO {
  /** 今日白条猪需求头数。 */
  todayPigDemand: number;
  /** 今日白条猪已调配头数（去重耳号数）。 */
  todayPigAssigned: number;
  /** 今日果蔬需求品种数。 */
  todayVegSpeciesDemand: number;
  /** 今日果蔬已调配品种数。 */
  todayVegSpeciesAssigned: number;
  /** 今日其他需求条数（other + gift_box）。 */
  todayOtherDemand: number;
  /** 今日其他已调配条数。 */
  todayOtherAssigned: number;
}
