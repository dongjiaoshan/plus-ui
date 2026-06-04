/**
 * 退货管理 admin API（WMS-SHIP-001）。
 *
 * 后端：org.dromara.djs.warehouse.shipment.returnpkg.controller.ReturnProductController
 *   /djs/warehouse/return
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { ReturnConfirmBody, ReturnProductForm, ReturnProductQuery, ReturnProductVO } from './return/types';

/** 列表（分页） */
export const listReturn = (query?: ReturnProductQuery): AxiosPromise<ReturnProductVO[]> => {
  return request({
    url: '/djs/warehouse/return/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getReturn = (id: string) => {
  return request<ReturnProductVO>({
    url: `/djs/warehouse/return/${id}`,
    method: 'get'
  });
};

/** 新增 */
export const addReturn = (data: ReturnProductForm) => {
  return request<string>({
    url: '/djs/warehouse/return',
    method: 'post',
    data
  });
};

/** 编辑（仅 pending 状态） */
export const updateReturn = (data: ReturnProductForm) => {
  return request({
    url: '/djs/warehouse/return',
    method: 'put',
    data
  });
};

/** 软删 */
export const delReturn = (ids: string | string[]) => {
  return request({
    url: `/djs/warehouse/return/${Array.isArray(ids) ? ids.join(',') : ids}`,
    method: 'delete'
  });
};

/** 确认退货（store_to_warehouse 联动 stock_flow） */
export const confirmReturn = (id: string, body: ReturnConfirmBody) => {
  return request({
    url: `/djs/warehouse/return/${id}/confirm`,
    method: 'post',
    data: body
  });
};

/** 导出 */
export const exportReturn = (query?: ReturnProductQuery) => {
  return request({
    url: '/djs/warehouse/return/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};
