import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { LocationCardSummaryVO, LocationInfoForm, LocationInfoQuery, LocationInfoVO, LocationProductStockVO } from './location/types';

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

/** 库位类型卡片汇总（顶部 2×4 网格，固定返 8 类） */
export const getLocationSummary = (): AxiosPromise<LocationCardSummaryVO[]> => {
  return request({
    url: '/djs/warehouse/location/summary',
    method: 'get'
  });
};

/**
 * 单库位内的逐产品库存明细（V6 row136：库位总览卡片点开的右侧抽屉）。
 *
 * @param locationId  库位 ID
 * @param productName 产品名称模糊搜索（可空）
 */
export const getLocationProductStock = (
  locationId: number | string,
  productName?: string
): AxiosPromise<LocationProductStockVO[]> => {
  return request({
    url: '/djs/warehouse/location/productStock',
    method: 'get',
    params: { locationId, productName }
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

/** 行内切换库位状态（locationStatus：1=启用 / 2=停用；仅改单字段，复用 location:edit 权限） */
export const changeLocationStatus = (id: number | string, locationStatus: number) => {
  return request({
    url: '/djs/warehouse/location/changeStatus',
    method: 'put',
    data: { id, locationStatus }
  });
};
