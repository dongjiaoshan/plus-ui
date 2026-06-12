import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { LocationStockQuery, LocationStockVO, StockOutForm } from './stock/types';

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

/**
 * 库存查询行「产品出库」（DJS-FIX-WMS-RALN-B）。
 *
 * 后端按库存行 id 取 locationId + productId，同事务写出库流水 + 扣减库存。
 */
export const stockOut = (data: StockOutForm) => {
  return request({
    url: '/djs/warehouse/stock/out',
    method: 'post',
    data
  });
};
