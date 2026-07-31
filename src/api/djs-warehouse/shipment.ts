/**
 * 发货流水 admin API（WMS-SHIP-001，admin 只读）。
 *
 * 后端：org.dromara.djs.warehouse.shipment.controller.ShipmentController
 *   /djs/warehouse/shipment
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { ShipmentQuery, ShipmentVO } from './shipment/types';

/** 列表（分页） */
export const listShipment = (query?: ShipmentQuery): AxiosPromise<ShipmentVO[]> => {
  return request({
    url: '/djs/warehouse/shipment/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getShipment = (id: string) => {
  return request<ShipmentVO>({
    url: `/djs/warehouse/shipment/${id}`,
    method: 'get'
  });
};

// 发货流水导出没有独立 api 封装：页面统一走 utils/request 的通用 download()（POST + 表单参数），
// 见 views/djs-warehouse/shipment/index.vue handleExport。
// 原先这里有一个 GET 版 exportShipment 但无任何调用方，且后端端点已改 @PostMapping，留着只会误导，已删。
