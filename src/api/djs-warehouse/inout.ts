import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

export interface BurnPig {
  id: string;
  barId: string;
  earNo?: string;
  marketingTime?: string;
  marketingWeight?: string | number;
  receiveTime?: string;
  arriveWeight?: string | number;
  status: string;
}

export interface CutBar {
  barInfoId: string;
  inhouseId?: string;
  cutRecordId?: string;
  whiteBarNo: string;
  earNo?: string;
  inTime?: string;
  inWeight: string | number;
  operateTime?: string;
  remainingWeight: string | number;
  cutStatus?: string;
}

export interface InoutProduct {
  productId: string;
  productCode: string;
  productName: string;
  imageUrl?: string;
  productType?: string;
  defaultLocationId?: string;
  defaultLocationName?: string;
  maxCount?: number;
  recordedCount?: number;
  recordedWeight?: string | number;
  isWhiteBar?: boolean;
  canRecord?: boolean;
}

export interface ShipStore {
  storeId: string;
  storeName: string;
  copies: number;
}
export interface RecentDestination {
  value: string;
  label: string;
  count: number;
}
export interface InoutReceipt {
  requestId: string;
  receiptId: string;
  cutRecordId?: string;
}
export interface CompletionCheck {
  confirmationRequired: boolean;
  message: string;
}
export type BurnDestination = 'warehouse' | 'store' | 'outbound';
export type CutDestination = 'fresh' | 'frozen' | 'outbound' | 'store';
export interface CutStoreDemand {
  storeId: string;
  storeName: string;
  productId: string;
  productName: string;
  productUnit: string;
  demandQuantity: string | number;
  minimumWeight: string | number;
  measureWeight?: string | number;
}
export interface BurnSubmission {
  requestId: string;
  barInfoId: string;
  productId: string;
  weight: string;
  destination: BurnDestination;
  storeId?: string;
  outDest?: string;
}
export interface CutSubmission {
  requestId: string;
  inhouseId?: string;
  cutRecordId?: string;
  productId: string;
  weight: string;
  destination: CutDestination;
  outDest?: string;
  storeId?: string;
  productionProductId?: string;
  allowOverMeasure?: boolean;
}

const base = '/djs/warehouse/inout';
export const getBurnPigs = (): AxiosPromise<BurnPig[]> => request({ url: `${base}/burn/pigs` });
export const getBurnProducts = (barInfoId: string): AxiosPromise<InoutProduct[]> => request({ url: `${base}/burn/products`, params: { barInfoId } });
export const getCutBars = (): AxiosPromise<CutBar[]> => request({ url: `${base}/cut/bars` });
export const getCutProducts = (): AxiosPromise<InoutProduct[]> => request({ url: `${base}/cut/products` });
export const getCutStoreDemands = (materialProductId: string): AxiosPromise<CutStoreDemand[]> =>
  request({ url: `${base}/cut/store-demands`, params: { materialProductId } });
export const getShipStores = (productId: string): AxiosPromise<ShipStore[]> => request({ url: `${base}/shipStores`, params: { productId } });
export const getRecentOutDests = (): AxiosPromise<RecentDestination[]> => request({ url: `${base}/recentOutDests` });
export const submitBurn = (data: BurnSubmission): AxiosPromise<InoutReceipt> => request({ url: `${base}/burn/submit`, method: 'post', data });
export const submitCut = (data: CutSubmission): AxiosPromise<InoutReceipt> => request({ url: `${base}/cut/submit`, method: 'post', data });
export const checkBurnFinish = (barInfoId: string): AxiosPromise<CompletionCheck> =>
  request({ url: `${base}/burn/finish-check`, params: { barInfoId } });
export const checkCutFinish = (cutRecordId: string): AxiosPromise<CompletionCheck> =>
  request({ url: `${base}/cut/finish-check`, params: { cutRecordId } });
export const finishBurn = (barInfoId: string, confirmAbnormalWeight = false) =>
  request({ url: `${base}/burn/finish`, method: 'post', data: { barInfoId, confirmAbnormalWeight } });
export const finishCut = (cutRecordId: string, confirmAbnormalWeight = false) =>
  request({ url: `${base}/cut/finish`, method: 'post', data: { cutRecordId, confirmAbnormalWeight } });
