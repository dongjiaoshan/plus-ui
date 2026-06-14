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
}

export interface ProductProductionQuery {
  produceNo?: string;
  productId?: number | string;
  productType?: number;
  belongType?: string;
  productSort?: number;
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
