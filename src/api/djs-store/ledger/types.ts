/**
 * 门店经营流水盘点台账类型（STORE-LEDGER-001，原型「门店管理>门店盘点」重建）。
 *
 * 对齐后端 org.dromara.djs.store.ledger.domain.*。
 * ⚠️ 契约 1：snowflake ID 字段一律 string（id / storeId / productId / operatorId），不准 number。
 */

/** 盘点单表头（盘点列表一行 = 某门店某盘点日的一次盘点）。 */
export interface StoreLedgerHeaderVO {
  storeId: string;
  storeName?: string;
  /** ISO yyyy-MM-dd */
  ledgerDate: string;
  /** 盘点产品行数 */
  lineCount: number;
  operatorId?: string;
  /** 盘点人姓名（USER_ID_TO_NICKNAME 翻译） */
  operatorName?: string;
  /** 盘点时间 ISO yyyy-MM-dd HH:mm:ss */
  checkTime?: string;
}

/** 盘点台账行（详情 / 产品盘点历史共用）。 */
export interface StoreLedgerLineVO {
  id?: string;
  storeId: string;
  storeName?: string;
  productId: string;
  productName?: string;
  productUnit?: string;
  ledgerDate: string;
  openingQty: number | string;
  inboundQty: number | string;
  saleQty: number | string;
  giftQty: number | string;
  returnQty: number | string;
  lossQty: number | string;
  closingQty: number | string;
  operatorId?: string;
  operatorName?: string;
  remark?: string;
  createTime?: string;
}

/** 当日盘点候选行（新增当日盘点 GET：门店关联产品全 SKU + 预填量）。 */
export interface StoreLedgerCandidateVO {
  productId: string;
  productName?: string;
  productUnit?: string;
  productSpec?: string;
  /** 预填销售量（销售流水当日聚合） */
  saleQty: number | string;
  /** 预填入库量（V1 默认 0 手填） */
  inboundQty: number | string;
  /** 预填退货量（顾客退货当日聚合） */
  returnQty: number | string;
}

/** 当日盘点整表批量提交单行。 */
export interface StoreLedgerBatchItem {
  productId: string;
  openingQty?: number | string;
  inboundQty?: number | string;
  saleQty?: number | string;
  giftQty?: number | string;
  returnQty?: number | string;
  lossQty?: number | string;
}

/** 当日盘点整表批量提交 form。 */
export interface StoreLedgerBatchForm {
  storeId: string;
  /** 盘点日期 yyyy-MM-dd（缺省后端今天） */
  ledgerDate?: string;
  remark?: string;
  items: StoreLedgerBatchItem[];
}

/** 盘点列表 / 历史查询。 */
export interface StoreLedgerQuery {
  pageNum?: number;
  pageSize?: number;
  storeId?: string;
  productId?: string;
  ledgerDate?: string;
  ledgerDateFrom?: string;
  ledgerDateTo?: string;
}
