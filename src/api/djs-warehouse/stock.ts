import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { LocationStockQuery, LocationStockVO, StockBasketVO, StockOutForm, StockTransferForm } from './stock/types';

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
 * 查询当前库存中实际存在的猪只耳号（去重，供库存查询页耳号下拉用，row152-2）。
 *
 * @param locationId 库位 ID（可空，不传则取全部库存）
 */
/**
 * 合并行背后的各篮明细（row223 / D-0068「各篮明细（入库时间+重量）下沉到详情里看」）。
 *
 * 列表按 产品+库位+耳号+地块+三期+白条流水号 合并之后，篮这一层从列表上消失了，
 * 这个端点是它唯一的去处 —— 没有它，工人对不出一行的合计是怎么来的。
 */
export const listStockBaskets = (stockIds: Array<number | string>): AxiosPromise<StockBasketVO[]> => {
  return request({
    url: '/djs/warehouse/stock/baskets',
    method: 'get',
    params: { stockIds: stockIds.join(',') }
  });
};

export const listStockEarNos = (locationId?: number | string): AxiosPromise<string[]> => {
  return request({
    url: '/djs/warehouse/stock/earNos',
    method: 'get',
    params: { locationId }
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

/**
 * 库存查询行「猪肉转移」（WS13 / row143）：猪肉鲜品库 → 冻品库。
 *
 * 后端按源库存行 id 取 locationId + productId，同事务扣源库存 + 加冻品库库存 + 双向流水。
 */
export const pigTransfer = (data: StockTransferForm) => {
  return request({
    url: '/djs/warehouse/stock/pigTransfer',
    method: 'post',
    data
  });
};
