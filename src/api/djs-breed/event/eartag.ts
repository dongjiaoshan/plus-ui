import type { AxiosPromise } from 'axios';
import request from '@/utils/request';

export interface PigletnoVO {
  id: number | string;
  pigletEarNo: string;
  motherEarNo: string;
  fatherEarNo?: string;
  farrowId: number | string;
  tagDate: string;
  pigletSex: 'F' | 'M';
  birthWeight?: number;
  pigId: number | string;
  operatorId?: number | string;
  remark?: string;
  createTime?: string;
}

export interface PigletEarTagQuery {
  pageNum?: number;
  pageSize?: number;
  pigletEarNo?: string;
  motherEarNo?: string;
  farrowId?: number | string;
  pigletSex?: 'F' | 'M';
  beginDate?: string;
  endDate?: string;
}

/** admin 只读：仔猪耳标历史分页查询（BRD-EVENT-003） */
export function listPigletEarTag(query: PigletEarTagQuery): AxiosPromise<any> {
  return request({
    url: '/djs/breed/event/eartag/list',
    method: 'get',
    params: query
  });
}
