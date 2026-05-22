import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  BoarConfigForm,
  BoarConfigQuery,
  BoarConfigVO,
  MedScheduleConfigForm,
  MedScheduleConfigQuery,
  MedScheduleConfigVO,
  ProductionCycleConfigForm,
  ProductionCycleConfigQuery,
  ProductionCycleConfigVO
} from './production-config/types';

/**
 * 生产配置 API（BRD-MD-003，3 套 CRUD）。
 *
 *  - cycle  生产周期    /djs/breed/production/cycle/*    djs:breed:production-cycle:*
 *  - boar   精液公猪    /djs/breed/production/boar/*     djs:breed:production-boar:*
 *  - med    药品周期    /djs/breed/production/med/*      djs:breed:production-med:*
 */

// ============= 生产周期（cycle）=============

export const listProductionCycle = (query: ProductionCycleConfigQuery): AxiosPromise<ProductionCycleConfigVO[]> => {
  return request({ url: '/djs/breed/production/cycle/list', method: 'get', params: query });
};

export const getProductionCycle = (id: number | string): AxiosPromise<ProductionCycleConfigVO> => {
  return request({ url: '/djs/breed/production/cycle/getInfo/' + id, method: 'get' });
};

export const addProductionCycle = (data: ProductionCycleConfigForm) => {
  return request({ url: '/djs/breed/production/cycle/add', method: 'post', data });
};

export const updateProductionCycle = (data: ProductionCycleConfigForm) => {
  return request({ url: '/djs/breed/production/cycle/edit', method: 'put', data });
};

export const delProductionCycle = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({ url: '/djs/breed/production/cycle/remove/' + path, method: 'delete' });
};

// ============= 精液公猪（boar）=============

export const listBoarConfig = (query: BoarConfigQuery): AxiosPromise<BoarConfigVO[]> => {
  return request({ url: '/djs/breed/production/boar/list', method: 'get', params: query });
};

export const getBoarConfig = (id: number | string): AxiosPromise<BoarConfigVO> => {
  return request({ url: '/djs/breed/production/boar/getInfo/' + id, method: 'get' });
};

export const addBoarConfig = (data: BoarConfigForm) => {
  return request({ url: '/djs/breed/production/boar/add', method: 'post', data });
};

export const updateBoarConfig = (data: BoarConfigForm) => {
  return request({ url: '/djs/breed/production/boar/edit', method: 'put', data });
};

export const delBoarConfig = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({ url: '/djs/breed/production/boar/remove/' + path, method: 'delete' });
};

// ============= 药品周期（med）=============

export const listMedSchedule = (query: MedScheduleConfigQuery): AxiosPromise<MedScheduleConfigVO[]> => {
  return request({ url: '/djs/breed/production/med/list', method: 'get', params: query });
};

export const getMedSchedule = (id: number | string): AxiosPromise<MedScheduleConfigVO> => {
  return request({ url: '/djs/breed/production/med/getInfo/' + id, method: 'get' });
};

export const addMedSchedule = (data: MedScheduleConfigForm) => {
  return request({ url: '/djs/breed/production/med/add', method: 'post', data });
};

export const updateMedSchedule = (data: MedScheduleConfigForm) => {
  return request({ url: '/djs/breed/production/med/edit', method: 'put', data });
};

export const delMedSchedule = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({ url: '/djs/breed/production/med/remove/' + path, method: 'delete' });
};
