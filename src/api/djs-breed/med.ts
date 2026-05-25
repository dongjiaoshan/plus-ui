import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  MedBatchForm,
  MedBatchQuery,
  MedBatchVO,
  MedicineForm,
  MedicineQuery,
  MedicineVO,
  MedUsageForm,
  MedUsageQuery,
  MedUsageTodayStat,
  MedUsageVO
} from './med/types';

/**
 * 药品库 + 药品批次 + 领用台账 API（BRD-MED-001 / BRD-MED-002）。
 *
 * 后端：
 *  - org.dromara.djs.breed.med.controller.MedicineController   /djs/breed/med
 *  - org.dromara.djs.breed.med.controller.MedBatchController   /djs/breed/med-batch
 *  - org.dromara.djs.breed.med.controller.MedUsageController   /djs/breed/med-usage
 */

// ============= Medicine =============

/** 查询药品列表（分页） */
export const listMedicine = (query: MedicineQuery): AxiosPromise<MedicineVO[]> => {
  return request({
    url: '/djs/breed/med/list',
    method: 'get',
    params: query
  });
};

/** 查询药品详情 */
export const getMedicine = (id: number | string): AxiosPromise<MedicineVO> => {
  return request({
    url: '/djs/breed/med/getInfo/' + id,
    method: 'get'
  });
};

/** 新增药品 */
export const addMedicine = (data: MedicineForm) => {
  return request({
    url: '/djs/breed/med/add',
    method: 'post',
    data
  });
};

/** 修改药品（medicineCode 后端忽略） */
export const updateMedicine = (data: MedicineForm) => {
  return request({
    url: '/djs/breed/med/edit',
    method: 'put',
    data
  });
};

/** 删除药品（批量，逗号拼接） */
export const delMedicine = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/breed/med/remove/' + path,
    method: 'delete'
  });
};

// ============= MedBatch =============

/** 查询批次列表（分页） */
export const listMedBatch = (query: MedBatchQuery): AxiosPromise<MedBatchVO[]> => {
  return request({
    url: '/djs/breed/med-batch/list',
    method: 'get',
    params: query
  });
};

/** 查询批次详情 */
export const getMedBatch = (id: number | string): AxiosPromise<MedBatchVO> => {
  return request({
    url: '/djs/breed/med-batch/getInfo/' + id,
    method: 'get'
  });
};

/** 新增批次 */
export const addMedBatch = (data: MedBatchForm) => {
  return request({
    url: '/djs/breed/med-batch/add',
    method: 'post',
    data
  });
};

/** 修改批次（medicineId 后端忽略） */
export const updateMedBatch = (data: MedBatchForm) => {
  return request({
    url: '/djs/breed/med-batch/edit',
    method: 'put',
    data
  });
};

/** 删除批次（批量） */
export const delMedBatch = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/breed/med-batch/remove/' + path,
    method: 'delete'
  });
};

// ============= MedUsage（BRD-MED-002 领用台账） =============

/** 分页查询领用记录 */
export const listMedUsage = (query: MedUsageQuery): AxiosPromise<MedUsageVO[]> => {
  return request({
    url: '/djs/breed/med-usage/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getMedUsage = (id: number | string): AxiosPromise<MedUsageVO> => {
  return request({
    url: '/djs/breed/med-usage/getInfo/' + id,
    method: 'get'
  });
};

/** 新增领用 / 退回 / 损耗（后端同步扣减或归还库存） */
export const addMedUsage = (data: MedUsageForm) => {
  return request({
    url: '/djs/breed/med-usage/add',
    method: 'post',
    data
  });
};

/** 软删（不回滚库存） */
export const delMedUsage = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/breed/med-usage/remove/' + path,
    method: 'delete'
  });
};

/** 今日汇总 {use, return, loss} */
export const medUsageTodayStat = (): AxiosPromise<MedUsageTodayStat> => {
  return request({
    url: '/djs/breed/med-usage/today-stat',
    method: 'get'
  });
};
