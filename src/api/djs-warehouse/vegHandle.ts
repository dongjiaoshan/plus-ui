import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { VegetableHandleVO, HandleRecordVO, VegHandleQuery } from './vegHandle/types';

/**
 * 毛菜处理 API（WMS-VEG-001 admin 只读）。
 *
 * 后端：org.dromara.djs.warehouse.veg.controller.VegetableHandleController  /djs/warehouse/vegHandle
 *
 * 写入由 mp 端 /applet/warehouse/vegHandle/submit；admin 端只 list / 详情 / 详情下钻 records / 导出。
 */

/** 分页查询 */
export const listVegHandle = (query: VegHandleQuery): AxiosPromise<VegetableHandleVO[]> => {
  return request({
    url: '/djs/warehouse/vegHandle/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getVegHandle = (id: number | string): AxiosPromise<VegetableHandleVO> => {
  return request({
    url: '/djs/warehouse/vegHandle/' + id,
    method: 'get'
  });
};

/** 详情下钻：本汇总下所有 handle_record 流水 */
export const listVegHandleRecords = (id: number | string): AxiosPromise<HandleRecordVO[]> => {
  return request({
    url: `/djs/warehouse/vegHandle/${id}/records`,
    method: 'get'
  });
};

/** 导出 */
export const exportVegHandle = (query: VegHandleQuery) => {
  return request({
    url: '/djs/warehouse/vegHandle/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};
