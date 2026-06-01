/**
 * 门店经营（产品关联 + 销售流水）类型定义（STR-OP-001）。
 *
 * 与后端 org.dromara.djs.store.operation.domain.* 对齐。id / storeId / productId / operatorId
 * 均 string（snowflake JS 精度问题，参 .claude/skills/coder-djs-cross-layer-contract.md §契约 1）。
 */

/** el-transfer 左侧候选 SKU。 */
export interface StoreProductCandidateVO {
  id: string;
  productCode: string;
  productName: string;
  productUnit?: string;
  productSpec?: string;
}

/** 某门店已关联产品（el-transfer 右侧）。 */
export interface StoreProductRelationVO {
  id: string;
  storeId: string;
  productId: string;
  productName?: string;
  productUnit?: string;
  productSpec?: string;
  /** djs_active_status：1=启用 / 2=停用 */
  isActive: number;
}

/** 产品关联全量同步入参。 */
export interface StoreProductRelationSyncForm {
  storeId: string;
  productIds: string[];
}

/** 销售流水数据来源（与字典 djs_sale_source 对齐）。 */
export type StoreSaleSource = 'manual' | 'excel_import';

/** 销售流水列表 / 详情 VO。 */
export interface StoreSaleRecordVO extends BaseEntity {
  id: string;
  storeId: string;
  storeName?: string;
  productId: string;
  productName: string;
  saleDate: string;
  saleQty: number | string;
  saleUnit: string;
  saleAmount: number | string;
  operatorId: string;
  operatorName?: string;
  source: StoreSaleSource;
  remark?: string;
}

/** 销售流水手录表单。 */
export interface StoreSaleRecordForm {
  storeId: string;
  productId: string;
  saleDate: string;
  saleQty: number | string;
  saleAmount: number | string;
  remark?: string;
}

/** 销售流水列表查询。 */
export interface StoreSaleRecordQuery extends PageQuery {
  storeId?: string;
  productId?: string;
  source?: StoreSaleSource;
  saleDateFrom?: string;
  saleDateTo?: string;
}
