import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  PlantPlanQuery,
  PlantPlanVO,
  PlantPlanStatsVO,
  PlantPlanCreateForm,
  PlantPlanUpdateForm,
  PlantPlanDetailVO,
  PlotByZoneVO,
  PlantPlanGanttVO
} from './plan/types';

/**
 * 种植计划 API（PLT-PLAN-001）。
 *
 * 后端：org.dromara.djs.plant.plan.controller.PlantPlanController  /djs/plant/plan
 */

export const listPlan = (query: PlantPlanQuery): AxiosPromise<PlantPlanVO[]> => {
  return request({
    url: '/djs/plant/plan/list',
    method: 'get',
    params: query
  });
};

/** 列表顶部 5 KPI 统计卡（FIX-PLT-AD-PLAN-001）。 */
export const getPlanStats = (): AxiosPromise<PlantPlanStatsVO> => {
  return request({
    url: '/djs/plant/plan/stats',
    method: 'get'
  });
};

export const getPlan = (id: number | string): AxiosPromise<PlantPlanDetailVO> => {
  return request({
    url: '/djs/plant/plan/getInfo/' + id,
    method: 'get'
  });
};

export const addPlan = (data: PlantPlanCreateForm): AxiosPromise<string> => {
  return request({
    url: '/djs/plant/plan/add',
    method: 'post',
    data
  });
};

export const updatePlan = (data: PlantPlanUpdateForm) => {
  return request({
    url: '/djs/plant/plan/edit',
    method: 'put',
    data
  });
};

export const delPlan = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/plant/plan/remove/' + path,
    method: 'delete'
  });
};

export const getPlanGantt = (id: number | string): AxiosPromise<PlantPlanGanttVO> => {
  return request({
    url: '/djs/plant/plan/' + id + '/gantt',
    method: 'get'
  });
};

export const listAvailablePlots = (): AxiosPromise<PlotByZoneVO[]> => {
  return request({
    url: '/djs/plant/plan/availablePlots',
    method: 'get'
  });
};
