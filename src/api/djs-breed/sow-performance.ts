/**
 * 母猪生产指标 API（BRD-LIST-001 详情 tab2，只读）。
 *
 * 后端：org.dromara.djs.breed.production.controller.SowPerformanceController
 *   - GET /djs/breed/sow-performance/{pigId}  权限 djs:breed:pig:query
 */
import type { AxiosPromise } from 'axios';
import request from '@/utils/request';

export interface SowPerformanceVO {
  id: number | string;
  pigId: number | string;
  earNo: string;
  parity: number;
  totalBorn: number;
  totalLiveBorn: number;
  totalWeaned: number;
  avgBornWeight?: number | string | null;
  avgWeanedWeight?: number | string | null;
  lastUpdateDate?: string | null;
}

/** 按 pigId 查母猪所有胎次的生产指标（parity DESC） */
export function listSowPerformance(pigId: number | string): AxiosPromise<SowPerformanceVO[]> {
  return request({
    url: `/djs/breed/sow-performance/${pigId}`,
    method: 'get'
  });
}
