import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { StockCheckCreateForm, StockCheckHeaderVO, StockCheckLineQuery, StockCheckQuery, StockCheckRecordVO } from './check/types';

/**
 * 库存盘点 admin API（WMS-STOCK-001）。
 *
 * 后端：org.dromara.djs.warehouse.check.controller.StockCheckController  /djs/warehouse/check
 */

/** 盘点单列表（盘点单维度 + 盈亏计） */
export const listCheck = (query: StockCheckQuery): AxiosPromise<StockCheckHeaderVO[]> => {
  return request({
    url: '/djs/warehouse/check/list',
    method: 'get',
    params: query
  });
};

/** 某盘点单的明细 line 列表 */
export const listCheckLines = (query: StockCheckLineQuery): AxiosPromise<StockCheckRecordVO[]> => {
  return request({
    url: '/djs/warehouse/check/lines',
    method: 'get',
    params: query
  });
};

/** 新建盘点单（锁库位） */
export const addCheck = (data: StockCheckCreateForm): AxiosPromise<number | string> => {
  return request({
    url: '/djs/warehouse/check',
    method: 'post',
    data
  });
};

/** 完成盘点（写流水 + 回写库存 + 解锁） */
export const completeCheck = (id: number | string): AxiosPromise<void> => {
  return request({
    url: '/djs/warehouse/check/complete/' + id,
    method: 'put'
  });
};

/** 取消盘点（仅解锁，不回写） */
export const cancelCheck = (id: number | string): AxiosPromise<void> => {
  return request({
    url: '/djs/warehouse/check/cancel/' + id,
    method: 'put'
  });
};
