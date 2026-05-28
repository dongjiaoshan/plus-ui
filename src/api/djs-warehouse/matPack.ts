import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { StockFlowQuery, StockFlowVO } from './stockFlow/types';

/**
 * 包材领用 API（WMS-MAT-001 admin 只读）。
 *
 * 后端：org.dromara.djs.warehouse.flow.controller.MatPackController  /djs/warehouse/mat/pack
 *
 * Controller 内部强制 matType='package'，admin 页只显示包材相关流水。
 * V1.5 其他 8 类物资（白条 / 蔬菜 / 鸡蛋 / 干货 / 果蔬 / 采食 / 药品 / 种子）复用同模板，
 * 各自加 Controller + admin 页即可。
 */

/** 分页查询（admin 端隐式过滤包材） */
export const listMatPack = (query: StockFlowQuery): AxiosPromise<StockFlowVO[]> => {
  return request({
    url: '/djs/warehouse/mat/pack/list',
    method: 'get',
    params: query
  });
};

/** 导出 */
export const exportMatPack = (query: StockFlowQuery) => {
  return request({
    url: '/djs/warehouse/mat/pack/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};
