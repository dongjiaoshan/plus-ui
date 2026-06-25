/**
 * 退货管理 admin API（WMS-SHIP-001）。
 *
 * 后端：org.dromara.djs.warehouse.shipment.returnpkg.controller.ReturnProductController
 *   /djs/warehouse/return
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { ReturnConfirmBody, ReturnProductForm, ReturnProductQuery, ReturnProductVO, ReturnStoreDailyVO } from './return/types';

/**
 * 列表（分页，逐条明细；明细弹窗下钻复用）。
 * STORE-RETURN-UNIFY-001：仓库退货记录统一读门店退回真相源 t_store_return（门店退货→仓库确认入库）。
 * 端点改指 /djs/store/return/list（OR 权限：djs:store:return:list 或 djs:warehouse:return:list）。
 */
export const listReturn = (query?: ReturnProductQuery): AxiosPromise<ReturnProductVO[]> => {
  return request({
    url: '/djs/store/return/list',
    method: 'get',
    params: query
  });
};

/**
 * 外层「门店 + 当日」汇总列表（主从视图外层）。
 * STORE-RETURN-UNIFY-001：改指 /djs/store/return/store-daily（仅 store_to_warehouse 方向聚合）。
 */
export const listReturnStoreDaily = (query?: ReturnProductQuery): AxiosPromise<ReturnStoreDailyVO[]> => {
  return request({
    url: '/djs/store/return/store-daily',
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
