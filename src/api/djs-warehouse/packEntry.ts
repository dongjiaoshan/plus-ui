import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 仓库生产管理 - 打包/分割录入 admin 端 API（A5）。
 *
 * 后端：org.dromara.djs.warehouse.pack.controller.WarehousePackEntryController  /djs/warehouse/packEntry
 *
 * 全部复用 mp 端已落的 ServiceImpl 业务方法（submitDryPack / submitGiftPack / submitVegPack /
 * submitCutOut / submitCutDone / submitPickup / submitWhiteBarOut），admin 仅多一层 @SaCheckPermission 委托。
 *
 * 跨层契约：snowflake ID 全链路 number | string（前端不截断；本层透传，提交时用 number | string）。
 */

/** 可打包/可领用来源过程产品（来自 t_warehouse_product_inhouse） */
export interface PackSourceVO {
  id: number;
  productName: string;
  productId: number;
  productUnit: string;
  productSpec?: string;
  productWeight: number;
  plotId?: number;
  earNo?: string;
  cutPart?: string;
  locationId?: number;
  produceDate?: string;
  produceTime?: string;
}

/** 待领用白条（status='in_stock'） */
export interface BarInfoVO {
  id: number;
  barId: string;
  earNo?: string;
  inWeight?: number;
  inTime?: string;
  status: string;
}

/** 待称重/称重中分割记录（picked/cutting） */
export interface PigCutRecordVO {
  id: number;
  cutId: string;
  barId: string;
  earNo?: string;
  pickupWeight?: number;
  isHalf: number;
  cutStatus: 'pending_pickup' | 'picked' | 'cutting' | 'done';
  locationName?: string;
}

/** 肉品/其他产品打包 BO（dry 口：选目标 SKU） */
export interface DryPackBo {
  sourceInhouseId: number | string;
  productId: number | string;
  productWeight: number;
  productUnit: string;
  locationId: number | string;
  storeId?: number | string;
  productSpec?: string;
  proofOssIds?: string;
  remark?: string;
}

/** 礼盒打包 BO（service 按 box_product_id 自动查组件清单） */
export interface GiftPackBo {
  giftBoxProductId: number | string;
  packBoxCount: number;
  locationId: number | string;
  storeId?: number | string;
  proofOssIds?: string;
  remark?: string;
}

/** 果蔬打包 BO（地块来源蔬菜） */
export interface VegPackBo {
  sourceInhouseId: number | string;
  productId: number | string;
  productWeight: number;
  locationId: number | string;
  materialConsume?: number;
  materialId?: number | string;
  storeId?: number | string;
  productSpec?: string;
  proofOssIds?: string;
  remark?: string;
}

/** 分割部位明细 */
export interface CutPartItem {
  cutPart: 'lean' | 'part' | 'bone' | 'skin' | 'scrap';
  productWeight: number;
  productSpec?: string;
}

/** 分割出库称重 BO（多部位） */
export interface PigCutOutBo {
  cutRecordId: number | string;
  locationId: number | string;
  partItems: CutPartItem[];
  proofOssIds?: string;
}

/** 白条完成分割 BO */
export interface PigCutDoneBo {
  cutRecordId: number | string;
  dripLoss: number;
  proofOssIds?: string;
  remark?: string;
}

/** 白条领用到分割车间 BO */
export interface PigCutPickupBo {
  barInfoId: number | string;
  locationId: number | string;
  targetStoreId?: number | string;
  targetDemandId?: number | string;
  isHalf?: number;
  remark?: string;
}

/** 白条/猪肉发货领用 BO（出库到发货月台） */
export interface WhiteBarOutBo {
  sourceInhouseId: number | string;
  productWeight: number;
  storeId?: number | string;
  proofOssIds?: string;
  remark?: string;
}

// ==================== 打包提交 ====================

/** 肉品/其他产品打包（dry 口） → 返新 production.id */
export const submitDryPack = (data: DryPackBo): AxiosPromise<number> => {
  return request({ url: '/djs/warehouse/packEntry/dry', method: 'post', data });
};

/** 礼盒打包 → 返新 production.id */
export const submitGiftPack = (data: GiftPackBo): AxiosPromise<number> => {
  return request({ url: '/djs/warehouse/packEntry/gift', method: 'post', data });
};

/** 果蔬打包 → 返新 production.id */
export const submitVegPack = (data: VegPackBo): AxiosPromise<number> => {
  return request({ url: '/djs/warehouse/packEntry/veg', method: 'post', data });
};

// ==================== 白条分割 ====================

/** 分割出库称重（多部位） */
export const submitCutOut = (data: PigCutOutBo): AxiosPromise<void> => {
  return request({ url: '/djs/warehouse/packEntry/cutOut', method: 'post', data });
};

/** 白条完成分割 */
export const submitCutDone = (data: PigCutDoneBo): AxiosPromise<void> => {
  return request({ url: '/djs/warehouse/packEntry/cutDone', method: 'post', data });
};

// ==================== 白条领用 ====================

/** 白条领用到分割车间 → 返新 cut_record.id */
export const submitPickup = (data: PigCutPickupBo): AxiosPromise<number> => {
  return request({ url: '/djs/warehouse/packEntry/pickup', method: 'post', data });
};

/** 白条/猪肉发货领用（出库到发货月台） → 返新 production.id */
export const submitWhiteBarOut = (data: WhiteBarOutBo): AxiosPromise<number> => {
  return request({ url: '/djs/warehouse/packEntry/whiteBarOut', method: 'post', data });
};

// ==================== 来源/白条列表 ====================

/** 打包来源过程产品列表（肉品/其他打包用） */
export const listSourceDry = (): AxiosPromise<PackSourceVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/sourceDry', method: 'get' });
};

/** 蔬菜可打包来源列表（plot_id 非空，果蔬打包用） */
export const listSourceVeg = (): AxiosPromise<PackSourceVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/sourceVeg', method: 'get' });
};

/** 白条/猪肉发货可选来源列表（belong_type ∈ white_bar/pork） */
export const listSourceWhiteBar = (): AxiosPromise<PackSourceVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/sourceWhiteBar', method: 'get' });
};

/** 待领用白条列表（status='in_stock'） */
export const listAvailableBars = (): AxiosPromise<BarInfoVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/availableBars', method: 'get' });
};

/** 待称重/称重中分割记录列表（cut_status ∈ picked/cutting） */
export const listCuttable = (): AxiosPromise<PigCutRecordVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/cuttableList', method: 'get' });
};
