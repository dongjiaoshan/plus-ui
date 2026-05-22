import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { BreedConfigForm, BreedConfigQuery, BreedConfigVO, BreedInfoForm, BreedInfoQuery, BreedInfoVO } from './breeding/types';

/**
 * 育种配置 API（BRD-MD-001 / CR-20260519-06）。
 *
 * 两套 CRUD：
 *  - BreedInfo  品种 / 品系  → /djs/breed/breeding/info
 *  - BreedConfig 配种关系   → /djs/breed/breeding/config
 *
 * 权限串都用 djs:breed:breeding:{list,add,edit,remove,export}（共用一组）。
 */

// ============= BreedInfo =============

/** 列表（admin 4 tab 通过 breedStrain 过滤：tab1=1 / tab3=2） */
export const listBreedInfo = (query: BreedInfoQuery): AxiosPromise<BreedInfoVO[]> => {
  return request({
    url: '/djs/breed/breeding/info/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getBreedInfo = (id: number | string): AxiosPromise<BreedInfoVO> => {
  return request({
    url: '/djs/breed/breeding/info/getInfo/' + id,
    method: 'get'
  });
};

/** 新增 */
export const addBreedInfo = (data: BreedInfoForm) => {
  return request({
    url: '/djs/breed/breeding/info/add',
    method: 'post',
    data
  });
};

/** 编辑 */
export const updateBreedInfo = (data: BreedInfoForm) => {
  return request({
    url: '/djs/breed/breeding/info/edit',
    method: 'put',
    data
  });
};

/** 删除（支持批量） */
export const delBreedInfo = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/breed/breeding/info/remove/' + path,
    method: 'delete'
  });
};

// ============= BreedConfig =============

/** 列表（admin 4 tab 通过 breedStrain 过滤：tab2=1 / tab4=2） */
export const listBreedConfig = (query: BreedConfigQuery): AxiosPromise<BreedConfigVO[]> => {
  return request({
    url: '/djs/breed/breeding/config/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getBreedConfig = (id: number | string): AxiosPromise<BreedConfigVO> => {
  return request({
    url: '/djs/breed/breeding/config/getInfo/' + id,
    method: 'get'
  });
};

/** 新增 */
export const addBreedConfig = (data: BreedConfigForm) => {
  return request({
    url: '/djs/breed/breeding/config/add',
    method: 'post',
    data
  });
};

/** 编辑 */
export const updateBreedConfig = (data: BreedConfigForm) => {
  return request({
    url: '/djs/breed/breeding/config/edit',
    method: 'put',
    data
  });
};

/** 删除（支持批量） */
export const delBreedConfig = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/breed/breeding/config/remove/' + path,
    method: 'delete'
  });
};
