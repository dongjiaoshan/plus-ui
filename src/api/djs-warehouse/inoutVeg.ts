import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { RecentDestination } from './inout';

/**
 * 出入库管理 · 果蔬入库 / 果蔬出库工作台（V6 row282 / row283）。
 * 后端：org.dromara.djs.warehouse.inout.controller.VegInoutWorkbenchController  /djs/warehouse/inout/veg
 * 雪花 ID 一律按 string 传递。
 */

/** 作物卡（与小程序毛菜处理作物列表同源）。 */
export interface VegCrop {
  cropId: string;
  cropName: string;
  thumbUrl?: string;
  /** 预计产量 kg */
  expectedYield?: string | number;
  /** 已采产量（采摘称重累计）kg */
  harvestWeight?: string | number;
  pendingPlotCount?: number;
}

/** 地块下作物配置的产品及其毛菜间剩余。 */
export interface VegPlotProduct {
  productId: string;
  productName: string;
  remainWeight?: string | number;
  /** false = 已移出作物产品配置，只展示不可选 */
  selectable?: boolean;
}

/** 采摘地块卡（与小程序毛菜处理作物详情同源）。 */
export interface VegPlot {
  plantingRecordId: string;
  plotId: string;
  plotCode?: string;
  expectYield?: string | number;
  harvestWeight?: string | number;
  remainWeight?: string | number;
  products?: VegPlotProduct[];
  weighStatus: 'pending' | 'done';
  processStatus: 'pending' | 'done';
  handleId?: string;
}

export interface VegTeamOption {
  teamId: string;
  teamName: string;
}

export interface VegInOptions {
  /** 去向库位名（毛菜保鲜库） */
  destinationName?: string;
  teams: VegTeamOption[];
}

export interface VegInSubmission {
  plantingRecordId: string;
  productId?: string;
  weight: string;
  teamIds: string[];
  perfPercent: number;
}

export interface VegInFinish {
  plantingRecordId: string;
  teamIds: string[];
  perfPercent: number;
}

/** 果蔬出库产品卡：跨库位合计。 */
export interface VegOutProduct {
  productId: string;
  productName: string;
  productUnit?: string;
  plotCount: number;
  totalStock: string | number;
}

/** 果蔬出库地块卡：同产品 + 库位 + 地块的一组库存篮；plotId 为空 = 无地块库存。 */
export interface VegOutStock {
  productId: string;
  plotId?: string;
  plotCode?: string;
  plotName?: string;
  earNo?: string;
  thirdPhase?: number;
  locationId: string;
  locationName?: string;
  stockWeight: string | number;
  stockIds: string[];
}

export type VegOutDestination = 'warehouse' | 'feed';

export interface VegOutSubmission {
  productId: string;
  stockIds: string[];
  weight: string;
  destination: VegOutDestination;
  outDest?: string;
}

const base = '/djs/warehouse/inout/veg';
export const getVegCrops = (): AxiosPromise<VegCrop[]> => request({ url: `${base}/in/crops` });
export const getVegPlots = (cropId: string): AxiosPromise<VegPlot[]> => request({ url: `${base}/in/plots`, params: { cropId } });
export const getVegInOptions = (): AxiosPromise<VegInOptions> => request({ url: `${base}/in/options` });
export const submitVegIn = (data: VegInSubmission): AxiosPromise<string> => request({ url: `${base}/in/submit`, method: 'post', data });
export const finishVegIn = (data: VegInFinish): AxiosPromise<string> => request({ url: `${base}/in/finish`, method: 'post', data });
export const getVegOutProducts = (): AxiosPromise<VegOutProduct[]> => request({ url: `${base}/out/products` });
export const getVegOutStocks = (productId: string): AxiosPromise<VegOutStock[]> => request({ url: `${base}/out/stocks`, params: { productId } });
export const getVegRecentOutDests = (): AxiosPromise<RecentDestination[]> => request({ url: `${base}/out/recentOutDests` });
export const submitVegOut = (data: VegOutSubmission): AxiosPromise<void> => request({ url: `${base}/out/submit`, method: 'post', data });
