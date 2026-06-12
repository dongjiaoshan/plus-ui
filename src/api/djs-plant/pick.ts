import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  PickPlanQuery,
  PickPlanGroupVO,
  PickSetScheduleForm,
  PickToggleActivityForm,
  PickActivityQuery,
  PickActivityVO
} from './pick/types';
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

/**
 * 采摘计划详情（调整页）拉行。
 *
 * 列表已改纯作物聚合（rowKey 去 plantId），导航只携带 cropId；故详情按 cropId 拉
 * 该作物名下全部 plant_details 行（跨计划）。后端现有端点为 `/{planId}/{cropId}/details`
 * 需 planId；本卡列表不再提供 planId，需后端补 crop-only 详情端点（见 _open-issues）。
 */
export const listPickPlanDetailsByCrop = (cropId: number | string): AxiosPromise<PlantDetailsVO[]> => {
  return request({
    url: `/djs/plant/pick/plan/crop/${cropId}/details`,
    method: 'get'
  });
};

/** 「设置计划」modal 单行提交（开始/结束采摘日期）。 */
export const setPickSchedule = (data: PickSetScheduleForm): AxiosPromise<number> => {
  return request({
    url: '/djs/plant/pick/plan/setSchedule',
    method: 'put',
    data
  });
};

/** 「设为/取消采摘活动」单行切换（is_pick 1↔2）。 */
export const togglePickActivity = (data: PickToggleActivityForm): AxiosPromise<number> => {
  return request({
    url: '/djs/plant/pick/plan/toggleActivity',
    method: 'put',
    data
  });
};

// ============================================================
// 采摘活动（只读每日采摘聚合报表，仅查询 + 导出）
// 导出走 ruoyi 全局 proxy.download('djs/plant/pick/activity/export', ...)
// ============================================================

export const listPickActivity = (query: PickActivityQuery): AxiosPromise<PickActivityVO[]> => {
  return request({
    url: '/djs/plant/pick/activity/list',
    method: 'get',
    params: query
  });
};
