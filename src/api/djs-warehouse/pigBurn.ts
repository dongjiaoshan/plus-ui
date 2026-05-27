import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PigBurnRecordVO, PigBurnRecordQuery } from './pigBurn/types';

/**
 * 燎毛工序记录 API（WMS-PIG-001 admin 只读）。
 *
 * 后端：org.dromara.djs.warehouse.burn.controller.PigBurnRecordController  /djs/warehouse/pigBurn
 *
 * 写入由 mp 端 /applet/warehouse/pigBurn/submit；admin 端只 list / 详情 / 导出。
 */

/** 分页查询 */
export const listPigBurn = (query: PigBurnRecordQuery): AxiosPromise<PigBurnRecordVO[]> => {
  return request({
    url: '/djs/warehouse/pigBurn/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getPigBurn = (id: number | string): AxiosPromise<PigBurnRecordVO> => {
  return request({
    url: '/djs/warehouse/pigBurn/' + id,
    method: 'get'
  });
};

/** 导出 */
export const exportPigBurn = (query: PigBurnRecordQuery) => {
  return request({
    url: '/djs/warehouse/pigBurn/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};
