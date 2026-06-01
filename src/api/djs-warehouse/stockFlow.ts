import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { StockFlowQuery, StockFlowVO } from './stockFlow/types';

/**
 * 出入库流水 API（WMS-MAT-001 admin → 预热 D11 WMS-FLOW-001）。
 *
 * 后端：org.dromara.djs.warehouse.flow.controller.StockFlowController  /djs/warehouse/stockFlow
 *
 * 写入由 mp 端 + burn / cut / mat service 自动写。admin 端只读 list / 详情 / 导出。
 * `adjust` 调账 D11 WMS-FLOW-001 完整实现；当前 admin 按钮 placeholder。
 */

/** 分页查询 */
export const listStockFlow = (query: StockFlowQuery): AxiosPromise<StockFlowVO[]> => {
  return request({
    url: '/djs/warehouse/stockFlow/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getStockFlow = (id: number | string): AxiosPromise<StockFlowVO> => {
  return request({
    url: '/djs/warehouse/stockFlow/' + id,
    method: 'get'
  });
};

/** 导出 */
export const exportStockFlow = (query: StockFlowQuery) => {
  return request({
    url: '/djs/warehouse/stockFlow/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * D11 WMS-FLOW-001：入库记录 / 出库记录两页（后端强制 inout_type=IN / OT）。
 *
 * 复用 StockFlowVO / StockFlowQuery；inoutType 由后端锁定，前端无需传。
 * 导出走 proxy.download 直接打 /in/export、/out/export，不在此封装。
 */

/** 入库记录分页 */
export const listFlowIn = (query: StockFlowQuery): AxiosPromise<StockFlowVO[]> => {
  return request({
    url: '/djs/warehouse/stockFlow/in/list',
    method: 'get',
    params: query
  });
};

/** 出库记录分页 */
export const listFlowOut = (query: StockFlowQuery): AxiosPromise<StockFlowVO[]> => {
  return request({
    url: '/djs/warehouse/stockFlow/out/list',
    method: 'get',
    params: query
  });
};
