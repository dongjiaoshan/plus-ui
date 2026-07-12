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
  /**
   * 白条产品（DENGBO-R12）对应原材料单位（KG → 按重量展示，保留 3 位）；仅白条产品行有值，其余回落 productUnit。
   */
  materialUnit?: string;
  /** 产品品类页签（DENGBO-R10）：pork=猪肉 / veg=果蔬 / other=其他 */
  belongTab?: StoreLedgerBelongTab;
  ledgerDate: string;
  openingQty: number | string;
  inboundQty: number | string;
  saleQty: number | string;
  giftQty: number | string;
  returnQty: number | string;
  /** 退回量（门店退回仓库，原型只读） */
  whReturnQty: number | string;
  lossQty: number | string;
  closingQty: number | string;
  operatorId?: string;
  operatorName?: string;
  remark?: string;
  createTime?: string;
}

/** 候选类别（来源）：pork=猪肉成品 / white_bar=白条产品(DENGBO-R12) / inbound=新到货 / stock=昨日库存。 */
export type StoreLedgerCategory = 'pork' | 'white_bar' | 'inbound' | 'stock';

/** 产品品类页签（DENGBO-R10）：pork=猪肉产品 / veg=果蔬产品 / other=其他产品。 */
export type StoreLedgerBelongTab = 'pork' | 'veg' | 'other';

/** 当日盘点候选行（新增当日盘点 GET：三类产品并集 + 预填量）。 */
export interface StoreLedgerCandidateVO {
  productId: string;
  productName?: string;
  productUnit?: string;
  /**
   * 产品对应原材料单位（KG → 数据量按 kg 展示；其他 → 按产品单位换算成 g）。
   * TODO(后端轨)：StoreDailyLedgerCandidateVo 目前未返回该字段，需后端补 materialUnit
   *（取产品关联原材料的计量单位）；缺省时前端回落到 productUnit 口径。
   */
  materialUnit?: string;
  productSpec?: string;
  /** 候选类别（来源）：pork=猪肉成品 / white_bar=白条产品 / inbound=新到货 / stock=昨日库存 */
  category: StoreLedgerCategory;
  /** 产品品类页签（DENGBO-R10）：pork=猪肉 / veg=果蔬 / other=其他 */
  belongTab?: StoreLedgerBelongTab;
  /** 期初库存（库存表当前结存，只读） */
  openingQty: number | string;
  /** 预填入库量（新到货=发货量；猪肉可手动编辑） */
  inboundQty: number | string;
  /** 入库量是否只读（新到货=true 不可编辑；猪肉=false 可手动且有上限） */
  inboundReadonly?: boolean;
  /** 预填销售量（销售流水当日聚合） */
  saleQty: number | string;
  /** 预填退货量（顾客退货 customer_to_store 当日聚合，手动可改） */
  returnSaleQty: number | string;
  /** 预填退回量（门店退回仓库 store_to_warehouse 当日聚合，只读） */
  returnWhQty: number | string;
}

/** 当日盘点整表批量提交单行（期末手动入参；损耗由后端计算不传）。 */
export interface StoreLedgerBatchItem {
  productId: string;
  /** 期初库存（只读回传） */
  openingQty?: number | string;
  /** 当日入库量（新到货只读 / 猪肉手动） */
  inboundQty?: number | string;
  /** 销售量（手动） */
  saleQty?: number | string;
  /** 赠送量（手动） */
  giftQty?: number | string;
  /** 退货量（顾客退货，手动） */
  returnSaleQty?: number | string;
  /** 退回量（门店退回仓库，只读回传） */
  returnWhQty?: number | string;
  /** 期末库存（手动实盘录入） */
  closingQty?: number | string;
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
