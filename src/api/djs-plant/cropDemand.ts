import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { CropDemandForm, CropDemandQuery, CropDemandReplyForm, CropDemandVO } from './cropDemand/types';

/**
 * 作物需求 / 需求反馈 API（V6-R152 + V6-R153）。
 *
 * 后端：org.dromara.djs.plant.demand.controller.CropDemandController  /djs/plant/cropDemand
 * 运营端「作物需求」与种植端「需求反馈」共用同一组端点（list / getInfo 走 SaMode.OR 双权限）。
 */

export const listCropDemand = (query: CropDemandQuery): AxiosPromise<CropDemandVO[]> => {
  return request({
    url: '/djs/plant/cropDemand/list',
    method: 'get',
    params: query
  });
};

export const getCropDemand = (id: number | string): AxiosPromise<CropDemandVO> => {
  return request({
    url: '/djs/plant/cropDemand/getInfo/' + id,
    method: 'get'
  });
};

export const addCropDemand = (data: CropDemandForm) => {
  return request({
    url: '/djs/plant/cropDemand/add',
    method: 'post',
    data
  });
};

/** 删除需求（后端校验只有创建人本人能删）。 */
export const delCropDemand = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/plant/cropDemand/remove/' + path,
    method: 'delete'
  });
};

/** 回复需求（首次回复与修改回复同一端点，回复后状态恒为已回复）。 */
export const replyCropDemand = (data: CropDemandReplyForm) => {
  return request({
    url: '/djs/plant/cropDemand/reply',
    method: 'put',
    data
  });
};
