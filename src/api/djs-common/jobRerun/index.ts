import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { JobLogQuery, JobLogVO, JobRerunForm } from './types';

/**
 * 定时任务重跑 API（DENGBO row7）。
 *
 * 后端：org.dromara.djs.common.job.controller.DjsJobRerunController
 * 路径前缀：/djs/job/rerun
 */

/** 查询执行日志（分页） */
export const listJobLog = (query: JobLogQuery): AxiosPromise<JobLogVO[]> => {
  return request({
    url: '/djs/job/rerun/list',
    method: 'get',
    params: query
  });
};

/** 列出已注册可重跑 job 名（下拉用） */
export const listRerunJobs = (): AxiosPromise<string[]> => {
  return request({
    url: '/djs/job/rerun/jobs',
    method: 'get'
  });
};

/** 按日期范围手动重跑（无日期 job 不传 begin/end） */
export const runJob = (data: JobRerunForm) => {
  return request({
    url: '/djs/job/rerun/run',
    method: 'post',
    data
  });
};
