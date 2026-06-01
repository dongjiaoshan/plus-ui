import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { DisasterRecordQuery, DisasterRecordVO, FarmRecordQuery, FarmRecordVO } from './farm-records/types';

/**
 * 农事记录 API。
 *
 * 后端：org.dromara.djs.plant.farm.controller.FarmRecordsController  /djs/plant/farm/*
 * 录入入口在 mp（PLT-WORK-001）；admin 端只查询 + 详情 + 导出（无 add/edit/remove）。
 *
 * - PLT-WORK-002：admin "种植 → 农事记录" 5 Tab 列表（/list /getInfo /export）。
 * - PLT-WORK-003：灾害子集独立子页（/disaster/*）。
 */

// ---------- PLT-WORK-002 农事记录 5 Tab 列表 ----------

/** 分页查询农事记录（5 Tab 切换时传 farmWorkTypes 多选，service 走 IN 过滤）。 */
export const listFarmRecords = (query: FarmRecordQuery): AxiosPromise<FarmRecordVO[]> => {
  return request({
    url: '/djs/plant/farm/list',
    method: 'get',
    params: query
  });
};

/** 农事记录详情。 */
export const getFarmRecordDetail = (id: number | string): AxiosPromise<FarmRecordVO> => {
  return request({
    url: '/djs/plant/farm/getInfo/' + id,
    method: 'get'
  });
};

// ---------- PLT-WORK-003 灾害子集 ----------

export const listDisaster = (query: DisasterRecordQuery): AxiosPromise<DisasterRecordVO[]> => {
  return request({
    url: '/djs/plant/farm/disaster/list',
    method: 'get',
    params: query
  });
};

export const getDisasterDetail = (id: number | string): AxiosPromise<DisasterRecordVO> => {
  return request({
    url: '/djs/plant/farm/disaster/getInfo/' + id,
    method: 'get'
  });
};
