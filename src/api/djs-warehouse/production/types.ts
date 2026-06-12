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

export interface ProductProductionQuery {
  produceNo?: string;
  productId?: number | string;
  productType?: number;
  productSort?: number;
  packStatus?: string;
  earNo?: string;
  plotId?: number | string;
  storeId?: number | string;
  produceDate?: string;
  produceTimeFrom?: string;
  produceTimeTo?: string;
  pageNum?: number;
  pageSize?: number;
}
