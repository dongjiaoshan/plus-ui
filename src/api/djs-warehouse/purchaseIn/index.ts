import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PurchaseInBo, PurchaseInQuery, PurchaseInRecordVO } from './types';

/**
 * 采购入库简化版 API（D9 hotfix admin 端）。
 *
 * 后端：org.dromara.djs.warehouse.purchase.controller.WarehousePurchaseInController
 *      /djs/warehouse/purchaseIn
 *
 * V1 真采购模块（含供应商 / 单价 / 验收）延后 D11+ WMS；本 hotfix 只是给 admin 一个"补入库流水 + 累加库存"
 * 的最简通道，解决包材领用前置库存缺失。
 */

/** 提交一笔采购入库（UPSERT location_stock + INSERT stock_flow 同事务） */
export const submitPurchaseIn = (data: PurchaseInBo): AxiosPromise<number> => {
  return request({
    url: '/djs/warehouse/purchaseIn/submit',
    method: 'post',
    data
  });
};

/** 分页查询采购入库流水 */
export const listPurchaseIn = (query: PurchaseInQuery): AxiosPromise<PurchaseInRecordVO[]> => {
  return request({
    url: '/djs/warehouse/purchaseIn/list',
    method: 'get',
    params: query
  });
};

/** 导出 */
export const exportPurchaseIn = (query: PurchaseInQuery) => {
  return request({
    url: '/djs/warehouse/purchaseIn/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};
