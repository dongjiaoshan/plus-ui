/**
 * 门店端需求类型定义（STR-DEMAND-001）。
 *
 * 复用 WMS demand 表结构（与后端 org.dromara.djs.warehouse.demand.domain.* 对齐）；门店端通过
 * /djs/store/demand 入口读写。id / storeId / productId 均 string（snowflake JS 精度问题，
 * 参 .claude/skills/coder-djs-cross-layer-contract.md §契约 1）。
 */

/** 需求业态枚举（落库值，仓库域 4 业态；white_bar/vegetable/gift_box/other）。 */
export type StoreDemandProductType = 'white_bar' | 'vegetable' | 'gift_box' | 'other';

/** 创建页 7 业态 tab（前端按产品 belongType 分组的展示维度，提交时映射回 4 业态落库）。 */
export type StoreDemandTabType = 'white_bar' | 'pork' | 'vegetable' | 'dry_good' | 'egg' | 'gift_box' | 'other';

/** 需求类型（字典 djs_demand_mailing_type：store 门店 / mailing 个人邮寄）。 */
export type StoreDemandMailingType = 'store' | 'mailing';

/** 需求状态 7 态（仓库落库值，与字典 djs_demand_status 对齐）。 */
export type StoreDemandStatusCode = 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'IN_PRODUCTION' | 'PARTIAL_SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'DELETED';

/** 门店视角派生状态 5 态（字典 djs_store_demand_status，0613-04）。 */
export type StoreDemandViewStatusCode = 'SUBMITTED' | 'CONFIRMED' | 'SHIPPED' | 'ARRIVED' | 'DELETED';

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
  /** 门店视角派生状态（后端按 demand_status/received_time 算，列表 dict-tag 用 djs_store_demand_status）。 */
  storeDemandStatus?: StoreDemandViewStatusCode;
  demandConfirmer?: string;
  demandConfirmerName?: string;
  confirmerTime?: string;
  /** 需求类型（字典 djs_demand_mailing_type）。 */
  demandType?: StoreDemandMailingType;
  /** 预计到店重量(kg)。 */
  expectedWeight?: number | string;
  /** 门店收货确认时间。 */
  receivedTime?: string;
  /** 门店收货确认人 user_id。 */
  receivedBy?: string;
  /** 门店收货确认人姓名。 */
  receivedByName?: string;
  /** 损坏数量（row48）：后端对「已发货」行回填 is_damaged=1 的产品件数；非已发货行 null（前端 '—'）。 */
  damagedCount?: number;
  expectedArriveDate?: string;
  shippedCount: number | string;
  confirmedCount: number | string;
  auditHistory?: string;
  createByName?: string;
  remark?: string;
}

/** 购物车整单提交表单（原型「新增需求」多产品整页）。 */
export interface StoreDemandBatchForm {
  storeId: string;
  demandDate?: string;
  expectedArriveDate?: string;
  demandRemark?: string;
  items: StoreDemandBatchItem[];
}

/** 购物车单行（产品 + 落库业态 + 需求量 + 是否个人邮寄）。 */
export interface StoreDemandBatchItem {
  productId: string;
  /** 仓库域落库业态（white_bar/vegetable/gift_box/other）。 */
  productType: StoreDemandProductType;
  demandQuantity: number;
  mailing: boolean;
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
  productName?: string;
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
