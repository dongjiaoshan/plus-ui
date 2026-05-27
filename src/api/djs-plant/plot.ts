import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PlotInfoForm, PlotInfoQuery, PlotInfoVO } from './plot/types';

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
