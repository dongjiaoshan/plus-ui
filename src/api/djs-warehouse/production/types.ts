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
  /** 需求门店数：该产品当前有未发货需求的门店家数（后端聚合返回，row114-3 待后端补 SQL） */
  storeDemandCount?: number;
}

export interface ProductProductionQuery {
  produceNo?: string;
  /** 产品名称模糊搜索（row114-2 待后端 selectProductionGroupList 加 LIKE） */
  productName?: string;
  productId?: number | string;
  productType?: number;
  belongType?: string;
  /** 产品序号：row115-1 改文本模糊搜索后透传字符串关键字（后端 product_sort LIKE） */
  productSort?: number | string;
  packStatus?: string;
  earNo?: string;
  plotId?: number | string;
  storeId?: number | string;
  produceDate?: string;
  produceDateFrom?: string;
  produceDateTo?: string;
  produceTimeFrom?: string;
  produceTimeTo?: string;
  pageNum?: number;
  pageSize?: number;
}
