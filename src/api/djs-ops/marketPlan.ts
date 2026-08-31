import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { MarketPlanQuery, MarketPlanVO } from './marketPlan/types';

/**
 * 果蔬上市计划 API（V6-R151）。
 *
 * 后端：org.dromara.djs.plant.market.controller.MarketPlanController  /djs/ops/marketPlan
 * 导出不在此封装函数，走 proxy.download（与 djs-plant/plan 一致）。
 */
export const listMarketPlan = (query: MarketPlanQuery): AxiosPromise<MarketPlanVO[]> => {
  return request({
    url: '/djs/ops/marketPlan/list',
    method: 'get',
    params: query
  });
};
