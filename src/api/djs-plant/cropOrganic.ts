import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { CropOrganicForm, CropOrganicQuery, CropOrganicVO } from './cropOrganic/types';

/**
 * 果蔬有机证书 API（PLT-MD-003）。
 *
 * 后端：org.dromara.djs.plant.organic.controller.CropOrganicController  /djs/plant/cropOrganic
 */

export const listCropOrganic = (query: CropOrganicQuery): AxiosPromise<CropOrganicVO[]> => {
  return request({
    url: '/djs/plant/cropOrganic/list',
    method: 'get',
    params: query
  });
};

export const getCropOrganic = (id: number | string): AxiosPromise<CropOrganicVO> => {
  return request({
    url: '/djs/plant/cropOrganic/getInfo/' + id,
    method: 'get'
  });
};

export const addCropOrganic = (data: CropOrganicForm) => {
  return request({
    url: '/djs/plant/cropOrganic/add',
    method: 'post',
    data
  });
};

export const updateCropOrganic = (data: CropOrganicForm) => {
  return request({
    url: '/djs/plant/cropOrganic/edit',
    method: 'put',
    data
  });
};

export const delCropOrganic = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/plant/cropOrganic/remove/' + path,
    method: 'delete'
  });
};
