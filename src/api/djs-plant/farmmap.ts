import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { FarmMapBindBody, FarmMapOverviewVO } from './farmmap/types';

/**
 * 农场地图 API（PLT-FARMMAP-001）。
 *
 * 后端 org.dromara.djs.plant.farmmap.controller.FarmMapController  /djs/plant/farmmap
 *  - GET    /overview            已挂格子 + 图外地块 + 覆盖率（一次拉全）
 *  - POST   /bind                把一个格子挂到一块地上（已挂则改挂）
 *  - DELETE /bind/{regionKey}    解绑
 *
 * 权限：读 djs:plant:farmmap:list / 写 djs:plant:farmmap:bind（menu 8400-8402）。
 */

/** 拉全图。三样数据同源同刷，不拆端点——拆了会出现覆盖率对不上的中间态。 */
export const getFarmMapOverview = (): AxiosPromise<FarmMapOverviewVO> => {
  return request({
    url: '/djs/plant/farmmap/overview',
    method: 'get'
  });
};

/** 把一个格子挂到一块地上。地块已挂在别的格子上时后端拒绝并给出那个格子号。 */
export const bindFarmMapRegion = (data: FarmMapBindBody): AxiosPromise<void> => {
  return request({
    url: '/djs/plant/farmmap/bind',
    method: 'post',
    data
  });
};

/** 解绑一个格子。格子本来就没挂也返回成功。 */
export const unbindFarmMapRegion = (regionKey: string): AxiosPromise<void> => {
  return request({
    url: `/djs/plant/farmmap/bind/${regionKey}`,
    method: 'delete'
  });
};
