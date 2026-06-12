import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { CropFarmworkVO, CropInfoForm, CropInfoQuery, CropInfoVO, CropPlantingRecordVO } from './crop/types';

/**
 * 作物 API（PLT-MD-001）。
 *
 * 后端：org.dromara.djs.plant.crop.controller.CropInfoController  /djs/plant/crop
 */

export const listCrop = (query: CropInfoQuery): AxiosPromise<CropInfoVO[]> => {
  return request({
    url: '/djs/plant/crop/list',
    method: 'get',
    params: query
  });
};

export const getCrop = (id: number | string): AxiosPromise<CropInfoVO> => {
  return request({
    url: '/djs/plant/crop/getInfo/' + id,
    method: 'get'
  });
};

export const addCrop = (data: CropInfoForm) => {
  return request({
    url: '/djs/plant/crop/add',
    method: 'post',
    data
  });
};

export const updateCrop = (data: CropInfoForm) => {
  return request({
    url: '/djs/plant/crop/edit',
    method: 'put',
    data
  });
};

export const delCrop = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/plant/crop/remove/' + path,
    method: 'delete'
  });
};

/**
 * 作物详情·种植信息子表（按 cropId 聚合，9 列；FIX-PLT-AD-DETAIL-001）。
 */
export const listPlantingByCrop = (cropId: number | string): AxiosPromise<CropPlantingRecordVO[]> => {
  return request({
    url: `/djs/plant/crop/${cropId}/planting`,
    method: 'get'
  });
};

/**
 * 作物详情·农事信息子表（按 cropId 关联农事记录；FIX-PLT-AD-DETAIL-001）。
 */
export const listFarmworkByCrop = (cropId: number | string): AxiosPromise<CropFarmworkVO[]> => {
  return request({
    url: `/djs/plant/crop/${cropId}/farmwork`,
    method: 'get'
  });
};
