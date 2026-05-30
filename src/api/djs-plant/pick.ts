import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PickPlanQuery, PickPlanGroupVO, PickAdjustBatchForm, PickActivityQuery, PickActivityVO, PickActivityForm } from './pick/types';
import type { PlantDetailsVO } from './plan/types';

/**
 * 采摘计划 + 采摘活动 API（PLT-PLAN-002）。
 *
 * 后端：org.dromara.djs.plant.pick.controller.{PickPlanController, PickActivityController}
 *   /djs/plant/pick/plan/*
 *   /djs/plant/pick/activity/*
 */

// ============================================================
// 采摘计划（按作物聚合 + 调整）
// ============================================================

export const listPickPlan = (query: PickPlanQuery): AxiosPromise<PickPlanGroupVO[]> => {
  return request({
    url: '/djs/plant/pick/plan/list',
    method: 'get',
    params: query
  });
};

export const listPickPlanDetails = (planId: number | string, cropId: number | string): AxiosPromise<PlantDetailsVO[]> => {
  return request({
    url: `/djs/plant/pick/plan/${planId}/${cropId}/details`,
    method: 'get'
  });
};

export const adjustPickPlan = (data: PickAdjustBatchForm): AxiosPromise<number> => {
  return request({
    url: '/djs/plant/pick/plan/adjust',
    method: 'put',
    data
  });
};

// ============================================================
// 采摘活动 CRUD
// ============================================================

export const listPickActivity = (query: PickActivityQuery): AxiosPromise<PickActivityVO[]> => {
  return request({
    url: '/djs/plant/pick/activity/list',
    method: 'get',
    params: query
  });
};

export const getPickActivity = (id: number | string): AxiosPromise<PickActivityVO> => {
  return request({
    url: `/djs/plant/pick/activity/getInfo/${id}`,
    method: 'get'
  });
};

export const addPickActivity = (data: PickActivityForm): AxiosPromise<string> => {
  return request({
    url: '/djs/plant/pick/activity/add',
    method: 'post',
    data
  });
};

export const updatePickActivity = (data: PickActivityForm) => {
  return request({
    url: '/djs/plant/pick/activity/edit',
    method: 'put',
    data
  });
};

export const delPickActivity = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: `/djs/plant/pick/activity/remove/${path}`,
    method: 'delete'
  });
};

export const summaryPickActivity = (id: number | string): AxiosPromise<PickActivityVO> => {
  return request({
    url: `/djs/plant/pick/activity/${id}/summary`,
    method: 'put'
  });
};
