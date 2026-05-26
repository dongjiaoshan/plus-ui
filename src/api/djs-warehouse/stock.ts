import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { LocationStockQuery, LocationStockVO } from './stock/types';

/**
 * 库存查询 API（WMS-MD-001）。
 *
 * 后端：org.dromara.djs.warehouse.stock.controller.LocationStockController  /djs/warehouse/stock
 * 只暴露 list / getInfo / export；写入由后续 ticket 完成。
 */

/** 分页查询库存明细 */
export const listStock = (query: LocationStockQuery): AxiosPromise<LocationStockVO[]> => {
  return request({
    url: '/djs/warehouse/stock/list',
    method: 'get',
    params: query
  });
};

/** 查询库存明细详情 */
export const getStock = (id: number | string): AxiosPromise<LocationStockVO> => {
  return request({
    url: '/djs/warehouse/stock/getInfo/' + id,
    method: 'get'
  });
};
