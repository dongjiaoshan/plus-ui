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
  /** 业态多选（R70 产品类型下拉多选）。 */
  productTypes?: string[];
  storeId?: string;
  shipmentStatus?: string;
  /** 发货状态多选（R70 发货状态下拉多选）。 */
  shipmentStatuses?: string[];
  shipDateFrom?: string;
  shipDateTo?: string;
  checkerId?: string;
}
