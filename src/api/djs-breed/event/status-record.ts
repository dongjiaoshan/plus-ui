import type { AxiosPromise } from 'axios';
import request from '@/utils/request';

/** 猪只状态变更流水（t_farm_status_record，状态机自动写入） */
export interface PigStatusRecordVO {
  id: number | string;
  pigId: number | string;
  earNo: string;
  oldStatus?: string;
  newStatus: string;
  eventType: string;
  relatedEventId?: number | string;
  durationDays?: number;
  changeTime: string;
  createTime?: string;
}

export interface PigStatusRecordQuery {
  pageNum?: number;
  pageSize?: number;
  pigId?: number | string;
  earNo?: string;
  eventType?: string;
  newStatus?: string;
  changeTimeStart?: string;
  changeTimeEnd?: string;
}

/** admin "事件台账" 全局状态流水分页（替代 D6 早期 7 个独立事件菜单） */
export function listStatusRecord(query: PigStatusRecordQuery): AxiosPromise<any> {
  return request({
    url: '/djs/breed/pig/status-record/list',
    method: 'get',
    params: query
  });
}
