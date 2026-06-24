/**
 * 采购入库简化版类型定义（D9 hotfix）。
 *
 * 后端：org.dromara.djs.warehouse.purchase.*  /djs/warehouse/purchaseIn
 */

export interface PurchaseInBo {
  productId: number | string;
  locationId: number | string;
  /** 后端 BigDecimal，> 0 */
  quantity: number | string;
  remark?: string;
}

export interface PurchaseInRecordVO {
  id: number | string;
  flowNo: string;
  flowDate: string;
  productId?: number | string;
  productName?: string;
  productUnit?: string;
  locationId?: number | string;
  locationName?: string;
  /** 入库数量（恒为正） */
  changeQuantity: number;
  operatorId?: number | string;
  operatorName?: string;
  remark?: string;
  createTime?: string;
}

export interface PurchaseInQuery {
  productId?: number | string;
  locationId?: number | string;
  dateFrom?: string;
  dateTo?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 采购入库「商品维度」查询条件（WMS-OUTSOURCE：以外购商品 product_type=2 为骨架的聚合列表）。
 * ID 字段全 string（snowflake 防截断），不准 number。
 */
export interface PurchaseInProductQuery {
  productName?: string;
  /** djs_buy_class 字典 value */
  buyClass?: string;
  supplierId?: string;
  storeLocationId?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 采购入库「商品维度」行（聚合 VO）。
 * - ID 字段全 string（snowflake 防截断）。
 * - currentStock / monthInTotal 后端 BigDecimal → JSON 字符串，累加/比较前必 Number()。
 */
export interface PurchaseInProductVO {
  productId: string;
  productCode: string;
  productName: string;
  productUnit: string;
  productSpec?: string;
  /** 缩略图 ossId */
  productThumb?: string;
  imageOssId?: string;
  /** 主图 public URL（后端 resolver 已回填，直接用） */
  imageUrl?: string;
  /** djs_buy_class 字典 value */
  buyClass?: string;
  /** 存储库位 CSV 原始串（多库位逗号分隔） */
  storeLocationId?: string;
  /** 存储库位中文名（多库位「、」拼接，后端已回填） */
  storeLocationName?: string;
  supplierId?: string;
  /** 供应商名称（row23：列表「供应商」列 + 入库弹框只读展示，后端 JOIN 回填，无则空） */
  supplierName?: string;
  /** 当前库存（BigDecimal→string） */
  currentStock?: string;
  /** 最后一次入库时间（yyyy-MM-dd HH:mm:ss） */
  lastInTime?: string;
  lastPurchaserId?: string;
  /** 采购人中文姓名（后端 @Translation 回填） */
  lastPurchaserName?: string;
  /** 当月累计采购入库总量（BigDecimal→string） */
  monthInTotal?: string;
}
