import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { BarnForm, BarnQuery, BarnVO, FarmContactForm, FarmInfoVO, PenForm, PenQuery, PenVO } from './farm/types';

/**
 * 农场 / 栋舍 / 栏位 API（BRD-MD-002）。
 *
 * 后端 3 controller：
 *   - /djs/breed/farm-info  权限 djs:breed:farm-info:{query,edit}
 *   - /djs/breed/barn       权限 djs:breed:barn:{list,add,edit,remove}
 *   - /djs/breed/pen        权限 djs:breed:pen:{list,add,edit,remove}
 */

// ============= FarmInfo =============

/** 查当前农场（V1 hardcode id=1001） */
export const getCurrentFarm = (): AxiosPromise<FarmInfoVO> => {
  return request({
    url: '/djs/breed/farm-info/current',
    method: 'get'
  });
};

/** 编辑联系信息（仅 contactName / contactPhone / address） */
export const updateFarmContact = (data: FarmContactForm) => {
  return request({
    url: '/djs/breed/farm-info/contact',
    method: 'put',
    data
  });
};

// ============= Barn =============

export const listBarn = (query: BarnQuery): AxiosPromise<BarnVO[]> => {
  return request({
    url: '/djs/breed/barn/list',
    method: 'get',
    params: query
  });
};

export const getBarn = (id: number | string): AxiosPromise<BarnVO> => {
  return request({
    url: '/djs/breed/barn/getInfo/' + id,
    method: 'get'
  });
};

export const addBarn = (data: BarnForm) => {
  return request({
    url: '/djs/breed/barn/add',
    method: 'post',
    data
  });
};

export const updateBarn = (data: BarnForm) => {
  return request({
    url: '/djs/breed/barn/edit',
    method: 'put',
    data
  });
};

export const delBarn = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/breed/barn/remove/' + path,
    method: 'delete'
  });
};

// ============= Pen =============

export const listPen = (query: PenQuery): AxiosPromise<PenVO[]> => {
  return request({
    url: '/djs/breed/pen/list',
    method: 'get',
    params: query
  });
};

export const getPen = (id: number | string): AxiosPromise<PenVO> => {
  return request({
    url: '/djs/breed/pen/getInfo/' + id,
    method: 'get'
  });
};

export const addPen = (data: PenForm) => {
  return request({
    url: '/djs/breed/pen/add',
    method: 'post',
    data
  });
};

export const updatePen = (data: PenForm) => {
  return request({
    url: '/djs/breed/pen/edit',
    method: 'put',
    data
  });
};

export const delPen = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/breed/pen/remove/' + path,
    method: 'delete'
  });
};
