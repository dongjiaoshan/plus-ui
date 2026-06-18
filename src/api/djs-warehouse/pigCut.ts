import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  PigCutRecordVO,
  PigCutRecordQuery,
  PigCutPickupForm,
  PigCutOutForm,
  PigCutDoneForm,
  AvailableBarVO
} from './pigCut/types';

/**
 * 分割工序记录 API（WMS-PIG-002）。
 *
 * 后端：org.dromara.djs.warehouse.cut.controller.PigCutRecordController  /djs/warehouse/pigCut
 *
 * list / 详情 / 导出走 admin 读权限；3 个写动作复用 applet 写权限码
 * （djs:applet:warehouse:pigCut:in/out/done），与 mp 端调同一组 service 方法。
 */

/** 分页查询 */
export const listPigCut = (query: PigCutRecordQuery): AxiosPromise<PigCutRecordVO[]> => {
  return request({
    url: '/djs/warehouse/pigCut/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getPigCut = (id: number | string): AxiosPromise<PigCutRecordVO> => {
  return request({
    url: '/djs/warehouse/pigCut/' + id,
    method: 'get'
  });
};

/** 导出 */
export const exportPigCut = (query: PigCutRecordQuery) => {
  return request({
    url: '/djs/warehouse/pigCut/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 待领用白条列表（status='in_stock'，最近 50 条）。
 *
 * 复用 applet 端点（@SaCheckLogin，admin 登录可直接调）。
 */
export const listAvailableBars = (): AxiosPromise<AvailableBarVO[]> => {
  return request({
    url: '/applet/warehouse/pigCut/availableBars',
    method: 'get'
  });
};

/** 阶段 1：白条领用 */
export const pickupPigCut = (data: PigCutPickupForm) => {
  return request({
    url: '/djs/warehouse/pigCut/pickup',
    method: 'post',
    data
  });
};

/** 阶段 2：分割出库称重（多部位） */
export const cutOutPigCut = (data: PigCutOutForm) => {
  return request({
    url: '/djs/warehouse/pigCut/cutOut',
    method: 'post',
    data
  });
};

/** 阶段 3：分割完成 */
export const cutDonePigCut = (data: PigCutDoneForm) => {
  return request({
    url: '/djs/warehouse/pigCut/cutDone',
    method: 'post',
    data
  });
};
