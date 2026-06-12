import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { OutsourcePigForm, OutsourcePigQuery, OutsourcePigVO } from './outsourcePig/types';

/**
 * 外购猪只 API（DJS-FIX-WMS-RALN）。
 *
 * 后端：org.dromara.djs.warehouse.outsource.controller.OutsourcePigController
 * 路径前缀：/djs/warehouse/outsourcePig（仅 新增 + 删除，无编辑）
 */

/** 查询外购猪只列表（分页） */
export const listOutsourcePig = (query: OutsourcePigQuery): AxiosPromise<OutsourcePigVO[]> => {
  return request({
    url: '/djs/warehouse/outsourcePig/list',
    method: 'get',
    params: query
  });
};

/** 查询外购猪只详情 */
export const getOutsourcePig = (id: number | string): AxiosPromise<OutsourcePigVO> => {
  return request({
    url: '/djs/warehouse/outsourcePig/getInfo/' + id,
    method: 'get'
  });
};

/** 新增外购猪只 */
export const addOutsourcePig = (data: OutsourcePigForm) => {
  return request({
    url: '/djs/warehouse/outsourcePig/add',
    method: 'post',
    data
  });
};

/** 删除外购猪只（支持批量，逗号拼接） */
export const delOutsourcePig = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/warehouse/outsourcePig/remove/' + path,
    method: 'delete'
  });
};
