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

/** 导出 */
export const exportShipment = (query?: ShipmentQuery) => {
  return request({
    url: '/djs/warehouse/shipment/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};
