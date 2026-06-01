/**
 * 门店端需求类型定义（STR-DEMAND-001）。
 *
 * 复用 WMS demand 表结构（与后端 org.dromara.djs.warehouse.demand.domain.* 对齐）；门店端通过
 * /djs/store/demand 入口读写。id / storeId / productId 均 string（snowflake JS 精度问题，
 * 参 .claude/skills/coder-djs-cross-layer-contract.md §契约 1）。
 */

/** 需求业态枚举（业务字段，非字典；white_bar/vegetable/gift_box/other）。 */
export type StoreDemandProductType = 'white_bar' | 'vegetable' | 'gift_box' | 'other';

/** 需求状态 7 态（与字典 djs_demand_status 对齐）。 */
export type StoreDemandStatusCode = 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'IN_PRODUCTION' | 'PARTIAL_SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface StoreDemandVO extends BaseEntity {
  id: string;
  demandNo: string;
  demandDate: string;
  storeId: string;
  productId: string;
  productName: string;
  productSpec?: string;
  productType: StoreDemandProductType;
  demandQuantity: number | string;
  productUnit: string;
  rawMaterial?: string;
  materialQty?: number | string;
  demandRemark?: string;
  demandExplain?: string;
  demandStatus: StoreDemandStatusCode;
  demandConfirmer?: string;
  demandConfirmerName?: string;
  confirmerTime?: string;
  expectedArriveDate?: string;
  shippedCount: number | string;
  confirmedCount: number | string;
  auditHistory?: string;
  createByName?: string;
  remark?: string;
}

export interface StoreDemandForm {
  id?: string;
  demandDate: string;
  storeId: string;
  productId: string;
  productName: string;
  productType: StoreDemandProductType;
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

export interface StoreDemandQuery extends PageQuery {
  demandNo?: string;
  productType?: StoreDemandProductType;
  demandStatus?: StoreDemandStatusCode;
  storeId?: string;
  beginDate?: string;
  endDate?: string;
}

export interface StoreDemandPigVO {
  id: string;
  demandId: string;
  earNo: string;
  assignedAt: string;
  assignedBy: string;
  assignedByName?: string;
}

export interface StoreAssignPigForm {
  earNos: string[];
}

/** 「可出栏」育肥猪 VO（指定猪只对话框用）。 */
export interface StorePigAvailableVO {
  earNo: string;
  pigSex?: string;
  pigBreedLabel?: string;
  ageDays?: number;
  lastBackfat?: number | string;
}
