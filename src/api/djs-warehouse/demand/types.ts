/**
 * 需求管理类型定义（WMS-DEMAND-001）。
 *
 * 4 业态共用一组 VO/Form/Query；id / storeId / productId 均 string（snowflake JS 精度问题，
 * 参 .claude/skills/coder-djs-cross-layer-contract.md §契约 1）。
 */

/** 需求业态枚举（与字典 djs_demand_product_type 对齐）。 */
export type DemandProductType = 'white_bar' | 'vegetable' | 'gift_box' | 'other';

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
  demandStatus?: DemandStatusCode;
  storeId?: string;
  beginDate?: string;
  endDate?: string;
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

export interface AuditHistoryEntryVO {
  from: DemandStatusCode | string;
  to: DemandStatusCode | string;
  event: string;
  operator?: string;
  operatorName?: string;
  ts?: string;
  remark?: string;
}
