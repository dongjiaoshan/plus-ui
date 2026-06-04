import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PlantWorkPerformanceQuery, PlantWorkPerformanceVO } from './performance/types';

/**
 * 班组绩效结算 API（PLT-PERF-001）。
 *
 * 后端：org.dromara.djs.plant.perf.controller.PlantWorkPerformanceController  /djs/plant/work-performance
 * 绩效由 generate 系统生成（手动触发，V1 无定时任务），无 add/edit/remove。
 */

/** 分页查询绩效列表。 */
export const listPerformance = (query: PlantWorkPerformanceQuery): AxiosPromise<PlantWorkPerformanceVO[]> => {
  return request({
    url: '/djs/plant/work-performance/list',
    method: 'get',
    params: query
  });
};

/** 绩效行详情（产量绩效 tab 数据）。 */
export const getPerformance = (id: number | string): AxiosPromise<PlantWorkPerformanceVO> => {
  return request({
    url: '/djs/plant/work-performance/' + id,
    method: 'get'
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
