import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { WhiteBarShipmentVO, WhiteBarShipmentQuery } from './production/types';

/**
 * 白条发货记录 API（WS12 row133，admin 只读）。
 *
 * 后端：org.dromara.djs.warehouse.pack.controller.ProductProductionController
 *   GET  /djs/warehouse/production/whiteBarShipment/list
 *   POST /djs/warehouse/production/whiteBarShipment/export
 *
 * 数据源 = t_warehouse_product_production 中 belong_type='white_bar' 的出库记录
 * （白条整只/半只出库到发货月台 或 仓库出库）。
 */

/** 白条发货记录分页查询 */
export const listWhiteBarShipment = (query: WhiteBarShipmentQuery): AxiosPromise<WhiteBarShipmentVO[]> => {
  return request({
    url: '/djs/warehouse/production/whiteBarShipment/list',
    method: 'get',
    params: query
  });
};

/** 白条发货记录导出 */
export const exportWhiteBarShipment = (query: WhiteBarShipmentQuery) => {
  return request({
    url: '/djs/warehouse/production/whiteBarShipment/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};
