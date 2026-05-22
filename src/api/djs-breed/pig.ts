/**
 * 猪只主表 + 状态机 API（BRD-CORE-001）。
 *
 * 4 端点（PigController）：
 *  - GET  /djs/breed/pig/list             权限 djs:breed:pig:list
 *  - GET  /djs/breed/pig/{id}             权限 djs:breed:pig:query   详情（含最近 20 条 history）
 *  - GET  /djs/breed/pig/{id}/history     权限 djs:breed:pig:query   全量历史（DESC，最多 200）
 *  - POST /djs/breed/pig/event            权限 djs:breed:pig:event   通用事件入口（运维/调试）
 */
import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { PigDetailVO, PigEventForm, PigQuery, PigStatusRecordVO, PigVO } from './pig/types';

/** 分页查询猪只列表 */
export const listPig = (query: PigQuery): AxiosPromise<PigVO[]> => {
  return request({
    url: '/djs/breed/pig/list',
    method: 'get',
    params: query
  });
};

/** 详情（含 recentHistory 最近 20 条） */
export const getPig = (id: number | string): AxiosPromise<PigDetailVO> => {
  return request({
    url: '/djs/breed/pig/' + id,
    method: 'get'
  });
};

/** 全量状态变更历史（DESC by changeTime，最多 200 条） */
export const listPigHistory = (id: number | string): AxiosPromise<PigStatusRecordVO[]> => {
  return request({
    url: '/djs/breed/pig/' + id + '/history',
    method: 'get'
  });
};

/**
 * 通用事件入口（运维 / 调试用）。
 *
 * 业务侧子 ticket（BRD-EVENT-*）应走自己的端点 — 内部先 INSERT 业务表再调
 * pigCoreService.fireEvent。本端点仅赋给 boss 角色。
 */
export const firePigEvent = (data: PigEventForm): AxiosPromise<PigStatusRecordVO> => {
  return request({
    url: '/djs/breed/pig/event',
    method: 'post',
    data
  });
};
