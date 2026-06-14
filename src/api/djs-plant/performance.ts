import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PerfListRowVO, PlantWorkPerformanceQuery, PlantWorkPerformanceVO } from './performance/types';

/**
 * 班组绩效结算 API（PLT-PERF-001 + rework 134/135）。
 *
 * 后端：org.dromara.djs.plant.perf.controller.PlantWorkPerformanceController  /djs/plant/work-performance
 * 绩效由 generate 系统生成（手动触发，V1 无定时任务），无 add/edit/remove。
 * 主列表 = 班组 × 月聚合（PerfListRowVO）；详情按作物分行走 /crop-rows。
 */

/** 分页查询绩效列表（班组 × 月聚合行）。 */
export const listPerformance = (query: PlantWorkPerformanceQuery): AxiosPromise<PerfListRowVO[]> => {
  return request({
    url: '/djs/plant/work-performance/list',
    method: 'get',
    params: query
  });
};

/** 详情按作物分行（某班组某月全部作物的采摘量 / 单价 / 绩效额）。 */
export const getCropRows = (teamId: number | string, statMonth: string): AxiosPromise<PlantWorkPerformanceVO[]> => {
  return request({
    url: '/djs/plant/work-performance/crop-rows',
    method: 'get',
    params: { teamId, statMonth }
  });
};

/** 手动生成指定月份的班组绩效结算（幂等：覆盖该月旧数据）。 */
export const generatePerformance = (statMonth: string): AxiosPromise<number> => {
  return request({
    url: '/djs/plant/work-performance/generate',
    method: 'post',
    params: { statMonth }
  });
};
