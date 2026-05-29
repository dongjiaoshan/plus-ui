/**
 * 发货流水类型（WMS-SHIP-001）。admin 端只读 + 导出。
 */

export interface ShipmentVO {
  id: string;
  shipmentNo: string;
  demandId: string;
  productType: 'white_bar' | 'vegetable' | 'gift_box' | 'other';
  storeId: string;
  storeName?: string;
  shipDate: string;
  shipQuantity: number;
  shipUnit: string;
  deliverType: number;
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  shipmentStatus: 'pending' | 'checking' | 'shipped' | 'delivered';
  checkerId?: string;
  checkerName?: string;
  checkTime?: string;
  proofOssIds?: string;
  remark?: string;
  createTime?: string;
}

export interface ShipmentQuery {
  pageNum?: number;
  pageSize?: number;
  shipmentNo?: string;
  demandId?: string;
  productType?: string;
  storeId?: string;
  shipmentStatus?: string;
  shipDateFrom?: string;
  shipDateTo?: string;
  checkerId?: string;
}
