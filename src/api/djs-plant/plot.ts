import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  PlotFarmworkRecordVO,
  PlotInfoForm,
  PlotInfoQuery,
  PlotInfoVO,
  PlotOrganicRefVO,
  PlotPlantingRecordVO
} from './plot/types';

/**
 * 地块 API（PLT-MD-001）。
 *
 * 后端：org.dromara.djs.plant.plot.controller.PlotInfoController  /djs/plant/plot
 */

export const listPlot = (query: PlotInfoQuery): AxiosPromise<PlotInfoVO[]> => {
  return request({
    url: '/djs/plant/plot/list',
    method: 'get',
    params: query
  });
};

export const getPlot = (id: number | string): AxiosPromise<PlotInfoVO> => {
  return request({
    url: '/djs/plant/plot/getInfo/' + id,
    method: 'get'
  });
};

export const addPlot = (data: PlotInfoForm) => {
  return request({
    url: '/djs/plant/plot/add',
    method: 'post',
    data
  });
};

export const updatePlot = (data: PlotInfoForm) => {
  return request({
    url: '/djs/plant/plot/edit',
    method: 'put',
    data
  });
};

export const delPlot = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/plant/plot/remove/' + path,
    method: 'delete'
  });
};

/** 地块详情·种植信息子表（FIX-PLT-AD-DETAIL-001，按 plotId 透视，11 列）。 */
export const listPlantingByPlot = (plotId: number | string): AxiosPromise<PlotPlantingRecordVO[]> => {
  return request({
    url: `/djs/plant/plot/${plotId}/planting`,
    method: 'get'
  });
};

/** 地块详情·农事信息子表（FIX-PLT-AD-DETAIL-001，按 plotId 透视）。 */
export const listFarmworkByPlot = (plotId: number | string): AxiosPromise<PlotFarmworkRecordVO[]> => {
  return request({
    url: `/djs/plant/plot/${plotId}/farmwork`,
    method: 'get'
  });
};

/** 地块详情·认证信息子表（FIX-PLT-AD-DETAIL-001，按 plotId 关联有机证书）。 */
export const listOrganicByPlot = (plotId: number | string): AxiosPromise<PlotOrganicRefVO[]> => {
  return request({
    url: `/djs/plant/plot/${plotId}/organic`,
    method: 'get'
  });
};
