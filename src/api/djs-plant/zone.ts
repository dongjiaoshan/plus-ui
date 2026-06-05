import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PlotZoneForm, PlotZoneQuery, PlotZoneVO } from './zone/types';

/**
 * 片区 API（PLT-MD-001）。
 *
 * 后端：org.dromara.djs.plant.zone.controller.PlotZoneController  /djs/plant/zone
 */

/** 分页查询片区列表。 */
export const listZone = (query: PlotZoneQuery): AxiosPromise<PlotZoneVO[]> => {
  return request({
    url: '/djs/plant/zone/list',
    method: 'get',
    params: query
  });
};

/** 列表查询（不分页，给左栏树用）。 */
export const listAllZone = (params?: { zoneName?: string }): AxiosPromise<PlotZoneVO[]> => {
  return request({
    url: '/djs/plant/zone/listAll',
    method: 'get',
    params
  });
};

/** 查询片区详情。 */
export const getZone = (id: number | string): AxiosPromise<PlotZoneVO> => {
  return request({
    url: '/djs/plant/zone/getInfo/' + id,
    method: 'get'
  });
};

/** 新增片区。 */
export const addZone = (data: PlotZoneForm) => {
  return request({
    url: '/djs/plant/zone/add',
    method: 'post',
    data
  });
};

/** 修改片区（zoneCode 后端强制忽略）。 */
export const updateZone = (data: PlotZoneForm) => {
  return request({
    url: '/djs/plant/zone/edit',
    method: 'put',
    data
  });
};

/** 删除片区（批量，逗号拼接；若有关联地块后端抛 plant.zone.has_plot）。 */
export const delZone = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/plant/zone/remove/' + path,
    method: 'delete'
  });
};

/** 行内切换片区状态（zoneStatus：sys_normal_disable 0=正常 / 1=停用；仅改单字段，复用 zone:edit 权限）。 */
export const changeZoneStatus = (id: number | string, zoneStatus: number) => {
  return request({
    url: '/djs/plant/zone/changeStatus',
    method: 'put',
    data: { id, zoneStatus }
  });
};
