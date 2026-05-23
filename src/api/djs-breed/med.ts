import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { MedBatchForm, MedBatchQuery, MedBatchVO, MedicineForm, MedicineQuery, MedicineVO } from './med/types';

/**
 * 药品库 + 药品批次 API（BRD-MED-001）。
 *
 * 后端：
 *  - org.dromara.djs.breed.med.controller.MedicineController  /djs/breed/med
 *  - org.dromara.djs.breed.med.controller.MedBatchController  /djs/breed/med-batch
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
