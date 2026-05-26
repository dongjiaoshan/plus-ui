import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { LocationInfoForm, LocationInfoQuery, LocationInfoVO } from './location/types';

/**
 * 库位 API（WMS-MD-001）。
 *
 * 后端：org.dromara.djs.warehouse.location.controller.LocationInfoController  /djs/warehouse/location
 */

/** 分页查询库位列表 */
export const listLocation = (query: LocationInfoQuery): AxiosPromise<LocationInfoVO[]> => {
  return request({
    url: '/djs/warehouse/location/list',
    method: 'get',
    params: query
  });
};

/** 查询库位详情 */
export const getLocation = (id: number | string): AxiosPromise<LocationInfoVO> => {
  return request({
    url: '/djs/warehouse/location/getInfo/' + id,
    method: 'get'
  });
};

/** 新增库位 */
export const addLocation = (data: LocationInfoForm) => {
  return request({
    url: '/djs/warehouse/location/add',
    method: 'post',
    data
  });
};

/** 修改库位（locationCode 后端强制忽略） */
export const updateLocation = (data: LocationInfoForm) => {
  return request({
    url: '/djs/warehouse/location/edit',
    method: 'put',
    data
  });
};

/** 删除库位（批量，逗号拼接；若仍有库存后端抛 location.has_stock） */
export const delLocation = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/warehouse/location/remove/' + path,
    method: 'delete'
  });
};
