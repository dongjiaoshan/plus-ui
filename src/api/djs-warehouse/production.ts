import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { ProductProductionVO, ProductProductionQuery } from './production/types';

/**
 * 发货产品生产记录 API（WMS-PACK-001 admin 只读）。
 *
 * 后端：org.dromara.djs.warehouse.pack.controller.ProductProductionController  /djs/warehouse/production
 *
 * 写入由 mp 端 /applet/warehouse/pack/{veg,gift,dry,celery}；admin 只 list / 详情 / 导出。
 */

/** 分页查询 */
export const listProduction = (query: ProductProductionQuery): AxiosPromise<ProductProductionVO[]> => {
  return request({
    url: '/djs/warehouse/production/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getProduction = (id: number | string): AxiosPromise<ProductProductionVO> => {
  return request({
    url: '/djs/warehouse/production/' + id,
    method: 'get'
  });
};

/** 导出 */
export const exportProduction = (query: ProductProductionQuery) => {
  return request({
    url: '/djs/warehouse/production/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};
