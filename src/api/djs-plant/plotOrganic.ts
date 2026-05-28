import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PlotOrganicForm, PlotOrganicQuery, PlotOrganicVO } from './plotOrganic/types';

/**
 * 土地有机证书 API（PLT-MD-003）。
 *
 * 后端：org.dromara.djs.plant.organic.controller.PlotOrganicController  /djs/plant/plotOrganic
 */

export const listPlotOrganic = (query: PlotOrganicQuery): AxiosPromise<PlotOrganicVO[]> => {
  return request({
    url: '/djs/plant/plotOrganic/list',
    method: 'get',
    params: query
  });
};

export const getPlotOrganic = (id: number | string): AxiosPromise<PlotOrganicVO> => {
  return request({
    url: '/djs/plant/plotOrganic/getInfo/' + id,
    method: 'get'
  });
};

export const addPlotOrganic = (data: PlotOrganicForm) => {
  return request({
    url: '/djs/plant/plotOrganic/add',
    method: 'post',
    data
  });
};

export const updatePlotOrganic = (data: PlotOrganicForm) => {
  return request({
    url: '/djs/plant/plotOrganic/edit',
    method: 'put',
    data
  });
};

export const delPlotOrganic = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/plant/plotOrganic/remove/' + path,
    method: 'delete'
  });
};

/** 手动触发到期预警扫描（V1 调试 / 演示用）。 */
export const scanPlotOrganicWarning = () => {
  return request({
    url: '/djs/plant/plotOrganic/scanWarning',
    method: 'post'
  });
};
