import type { AxiosPromise } from 'axios';
import request from '@/utils/request';

/**
 * 生长记录 API（BRD-EVENT-005 GROWTH）。
 *
 * 后端：
 *   org.dromara.djs.breed.event.growth.controller.PigGrowthController
 *     - GET    /djs/breed/event/growth/list     列表（分页 + pigId / 耳号 / 日期过滤）
 *     - GET    /djs/breed/event/growth/{id}     详情
 *     - POST   /djs/breed/event/growth          新增（admin 端可录背膘 / 背高）
 *     - DELETE /djs/breed/event/growth/{ids}    批量删除（3 天内可删）
 */

export interface PigGrowthVO {
  id: number | string;
  pigId: number | string;
  earNo: string;
  measureDate: string;
  weight: number | string;
  backfatThickness?: number | string | null;
  backHeight?: number | string | null;
  photoOssIds?: string;
  operatorId?: number | string | null;
  barnName?: string | null;
  penName?: string | null;
  remark?: string;
  createTime?: string;
}

export interface PigGrowthQuery {
  pageNum?: number;
  pageSize?: number;
  pigId?: number | string;
  earNo?: string;
  beginDate?: string;
  endDate?: string;
}

export interface PigGrowthBody {
  pigId: number | string;
  measureDate: string;
  weight: number;
  backfatThickness?: number | null;
  backHeight?: number | null;
  photoOssIds?: string;
  remark?: string;
}

/** admin：生长记录分页查询 */
export function listGrowth(query: PigGrowthQuery): AxiosPromise<any> {
  return request({
    url: '/djs/breed/event/growth/list',
    method: 'get',
    params: query
  });
}

/** admin：生长记录详情 */
export function getGrowth(id: number | string): AxiosPromise<{ data: PigGrowthVO }> {
  return request({
    url: `/djs/breed/event/growth/${id}`,
    method: 'get'
  });
}

/** admin：新增生长记录（背膘 / 背高 admin 端录） */
export function addGrowth(body: PigGrowthBody): AxiosPromise<any> {
  return request({
    url: '/djs/breed/event/growth',
    method: 'post',
    data: body
  });
}

/** admin：批量删除（3 天内可删，超期 service 抛 growth.delete.expired） */
export function delGrowth(ids: Array<number | string>): AxiosPromise<any> {
  return request({
    url: `/djs/breed/event/growth/${ids.join(',')}`,
    method: 'delete'
  });
}
