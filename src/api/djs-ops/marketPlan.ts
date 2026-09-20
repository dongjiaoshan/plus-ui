import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { MarketPlanQuery, MarketPlanVO } from './marketPlan/types';
import type { DateWindowStatusStatVO } from '@/api/djs-plant/common/types';

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

/**
 * 顶部统计版块：五档状态的全量计数（不是当前页）。
 *
 * 传与列表相同的筛选条件；后端会忽略其中的 marketStatus，其余条件照常生效。
 */
export const getMarketPlanStatusStat = (query: MarketPlanQuery): AxiosPromise<DateWindowStatusStatVO> => {
  return request({
    url: '/djs/ops/marketPlan/statusStat',
    method: 'get',
    params: query
  });
};
