import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { FattenAgeStageForm, FattenAgeStageVO } from './production-config/types';

/**
 * 生产配置 API（A1 母猪生产 / 育肥日龄阶段 / 出栏配置）。
 *
 *  - cycle/sow       母猪生产周期    /djs/breed/production/cycle/sow/*       djs:breed:production-cycle:*
 *  - cycle/slaughter 出栏配置        /djs/breed/production/cycle/slaughter/* djs:breed:production-cycle:*
 *  - fatten-stage    育肥日龄阶段    /djs/breed/production/fatten-stage/*    djs:breed:production-cycle:*
 */

// ============= A1 母猪生产配置（sow，6 项整数天数表单）=============

export const getSowConfig = (): AxiosPromise<Record<string, number>> => {
  return request({ url: '/djs/breed/production/cycle/sow/get', method: 'get' });
};

export const saveSowConfig = (data: Record<string, number>) => {
  return request({ url: '/djs/breed/production/cycle/sow/save', method: 'post', data });
};

// ============= A1 出栏配置（slaughter，单值表单）=============

export const getSlaughterConfig = (): AxiosPromise<Record<string, number>> => {
  return request({ url: '/djs/breed/production/cycle/slaughter/get', method: 'get' });
};

export const saveSlaughterConfig = (data: Record<string, number>) => {
  return request({ url: '/djs/breed/production/cycle/slaughter/save', method: 'post', data });
};

// ============= A1 育肥日龄阶段（fatten-stage，表格批量保存）=============

export const listFattenStage = (): AxiosPromise<FattenAgeStageVO[]> => {
  return request({ url: '/djs/breed/production/fatten-stage/list', method: 'get' });
};

export const batchSaveFattenStage = (data: FattenAgeStageForm[]) => {
  return request({ url: '/djs/breed/production/fatten-stage/batchSave', method: 'post', data });
};

export const removeFattenStage = (id: number | string) => {
  return request({ url: '/djs/breed/production/fatten-stage/remove/' + id, method: 'delete' });
};
