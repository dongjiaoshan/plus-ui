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
  /** 出栏重量 kg（领用称重校验上界） */
  marketingWeight?: number;
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
  /** 领用称重 kg（分割白条领用时现场过磅，白条重量展示用此值，非 in_weight） */
  pickupWeight?: number;
  /** 剩余可分割重量 kg（= pickupWeight − 已入库分割产品重量合计；后端计算回填） */
  remainingWeight?: number;
  isHalf: number;
  cutStatus: 'pending_pickup' | 'picked' | 'cutting' | 'done';
  locationName?: string;
}

/** 发送位置字典 djs_pack_send_dest：platform 发货月台 / mail 邮寄 / gift 礼盒 */
export type DeliverDest = 'platform' | 'mail' | 'gift';

/** 肉品/其他产品打包 BO（dry 口：选目标 SKU；locationId 收银台不采集，可空 → service 默认库位兜底） */
export interface DryPackBo {
  sourceInhouseId: number | string;
  productId: number | string;
  productWeight: number;
  productUnit: string;
  locationId?: number | string;
  storeId?: number | string;
  deliverDest?: DeliverDest;
  productSpec?: string;
  proofOssIds?: string;
  remark?: string;
}

/** 礼盒打包 BO（service 按 box_product_id 自动查组件清单；locationId 收银台不采集，可空 → service 默认库位兜底） */
export interface GiftPackBo {
  giftBoxProductId: number | string;
  packBoxCount: number;
  locationId?: number | string;
  storeId?: number | string;
  deliverDest?: DeliverDest;
  proofOssIds?: string;
  remark?: string;
}

/** 果蔬打包 BO（地块来源蔬菜；locationId 收银台不采集，可空 → service 默认库位兜底） */
export interface VegPackBo {
  sourceInhouseId: number | string;
  productId: number | string;
  productWeight: number;
  locationId?: number | string;
  materialConsume?: number;
  materialId?: number | string;
  storeId?: number | string;
  deliverDest?: DeliverDest;
  productSpec?: string;
  proofOssIds?: string;
  remark?: string;
}

/** 打包提交结果（确认并打印追溯码用） */
export interface PackSubmitResultVO {
  id: number | string;
  traceCode?: string;
}

/** 某产品各门店未发货需求份数（底部「门店(N份)」标签条） */
export interface StoreDemandCopiesVO {
  storeId: number | string;
  storeName: string;
  copies: number;
}

/**
 * 分割部位明细。
 *
 * 按具体产品对齐原型（Kevin 定）：分割成品按 productId 录入（冻五花肉/排骨/肘子/大排 等，belong_type=pork）；
 * cutPart 5 部位枚举为向后兼容回落项，productId 非空时优先。两者至少传一个。
 */
export interface CutPartItem {
  productId?: number | string;
  cutPart?: 'lean' | 'part' | 'bone' | 'skin' | 'scrap';
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

/** 白条领用到分割车间 BO（locationId 领用阶段可空，实际入冻品库位在 cutOut 阶段采集） */
export interface PigCutPickupBo {
  barInfoId: number | string;
  /** 领用称重 kg（现场过磅，校验 ≤ 白条出栏重量；可空则回落 in_weight 快照） */
  pickupWeight?: number;
  locationId?: number | string;
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

/** 肉品/其他产品打包（dry 口） → 返 {id, traceCode} */
export const submitDryPack = (data: DryPackBo): AxiosPromise<PackSubmitResultVO> => {
  return request({ url: '/djs/warehouse/packEntry/dry', method: 'post', data });
};

/** 礼盒打包 → 返 {id, traceCode} */
export const submitGiftPack = (data: GiftPackBo): AxiosPromise<PackSubmitResultVO> => {
  return request({ url: '/djs/warehouse/packEntry/gift', method: 'post', data });
};

/** 果蔬打包 → 返 {id, traceCode} */
export const submitVegPack = (data: VegPackBo): AxiosPromise<PackSubmitResultVO> => {
  return request({ url: '/djs/warehouse/packEntry/veg', method: 'post', data });
};

/** 某产品各门店未发货需求份数（底部「门店(N份)」标签条） */
export const listStoreDemand = (productId: number | string): AxiosPromise<StoreDemandCopiesVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/storeDemand', method: 'get', params: { productId } });
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
