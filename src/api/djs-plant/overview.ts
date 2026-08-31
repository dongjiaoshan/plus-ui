import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { CropDetailVO, PlantOverviewSummaryVO } from './overview/types';

/**
 * 种植总览 API（FIX-PLT-AD-OVERVIEW-001）。
 *
 * 后端 org.dromara.djs.plant.overview.controller.PlantOverviewController  /djs/plant/overview
 * 纯只读（替代已删旧种植看板 PLT-DASH-001）：
 *  - GET  /summary             5 产量 KPI（吨）+ 作物卡片列表（kg，可按作物名称过滤）
 *  - GET  /cropDetail          按 cropId 分页查逐地块明细（14 列）
 *  - POST /cropDetail/export   按 cropId 导出当前作物逐地块明细（FastExcel）
 *  - POST /cropCard/export     按作物名称过滤条件导出作物卡片（一作物一行，走 proxy.download 裸路径）
 *
 * 权限：djs:plant:overview:view（be @SaCheckPermission 与 fe 路由 perms 一致）。
 */

/** 种植总览汇总：5 产量 KPI（吨）+ 作物卡片列表（kg）；cropName 只过滤卡片列表，不影响 KPI。 */
export const getPlantOverviewSummary = (cropName?: string): AxiosPromise<PlantOverviewSummaryVO> => {
  return request({
    url: '/djs/plant/overview/summary',
    method: 'get',
    params: { cropName: cropName || undefined }
  });
};

/** 按 cropId 分页查作物逐地块明细（14 列）。 */
export const listCropDetail = (cropId: number | string, pageQuery: PageQuery): AxiosPromise<CropDetailVO[]> => {
  return request({
    url: '/djs/plant/overview/cropDetail',
    method: 'get',
    params: { cropId, ...pageQuery }
  });
};
