import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { GanttItemVO, PlantDashboardSummaryVO } from './dashboard/types';

/**
 * 种植看板 API（PLT-DASH-001 富图看板版）。
 *
 * 后端 org.dromara.djs.plant.dashboard.controller.PlantDashboardController  /djs/plant/dashboard
 * 纯只读聚合，2 个端点，5 分钟前端轮询：
 *  - GET /summary  土地总览 KPI + 今日农事 + 当月完成率 + 实时种植物统计 + 有机证书一览
 *  - GET /gantt    双甘特（种植段 plant=绿 + 采摘段 pick=黄）
 *
 * 权限：djs:plant:dashboard:view（be @SaCheckPermission 与 fe 路由 perms 一致）。
 */

/** 种植看板汇总。 */
export const getPlantDashboardSummary = (): AxiosPromise<PlantDashboardSummaryVO> => {
  return request({
    url: '/djs/plant/dashboard/summary',
    method: 'get'
  });
};

/** 双甘特图数据（种植段 + 采摘段）。 */
export const getPlantDashboardGantt = (): AxiosPromise<GanttItemVO[]> => {
  return request({
    url: '/djs/plant/dashboard/gantt',
    method: 'get'
  });
};
