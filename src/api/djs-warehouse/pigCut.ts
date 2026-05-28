import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PigCutRecordVO, PigCutRecordQuery } from './pigCut/types';

/**
 * 分割工序记录 API（WMS-PIG-002 admin 只读）。
 *
 * 后端：org.dromara.djs.warehouse.cut.controller.PigCutRecordController  /djs/warehouse/pigCut
 *
 * 写入由 mp 端 /applet/warehouse/pigCut/{pickup,cutOut,cutDone}；admin 端只 list / 详情 / 导出。
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
