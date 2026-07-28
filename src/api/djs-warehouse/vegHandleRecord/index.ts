import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { VegHandleRecordQuery, VegHandleRecordVO } from './types';

/**
 * 毛菜间处理记录 API（FIX-ADMIN-R130，仓库-admin 行130「毛菜间处理记录」只读菜单）。
 */

/** 毛菜间处理记录分页列表（按处理日期倒序） */
export const listVegHandleRecord = (query: VegHandleRecordQuery): AxiosPromise<VegHandleRecordVO[]> => {
  return request({
    url: '/djs/warehouse/vegHandleRecord/list',
    method: 'get',
    params: query
  });
};
