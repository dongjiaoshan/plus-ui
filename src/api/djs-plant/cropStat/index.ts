import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { CropPlotStatVO } from './types';

/**
 * 作物在田地块统计 API。
 *
 * 后端：org.dromara.djs.plant.cropstat.controller.CropPlotStatController  /djs/plant/crop-stat
 * 权限：djs:plant:crop:list（复用种植作物查询权限，不新增权限点）。
 */

/** 按作物聚合的在田地块统计（剩余地块 / 预计产量 / 最早·最晚可采摘日期），无入参、一次返全量。 */
export const listCropPlotStat = (): AxiosPromise<CropPlotStatVO[]> => {
  return request({
    url: '/djs/plant/crop-stat/plot',
    method: 'get'
  });
};

/** 果蔬产品行 → 统计值（按 primaryProductId 归并后的口径，同一产品出现多次时已累加）。 */
export interface CropPlotStatByProduct {
  remainPlotCount: number;
  expectYield: number;
  earliestPickDate: string | null;
  latestPickDate: string | null;
}

/**
 * 把按作物返回的统计行归并成「产品 ID → 统计值」的 Map，供果蔬产品行直接取用。
 *
 * key 用作物主产品 `primaryProductId`（作物产品配置首行）；
 * 产品行取值时用 `String(product.productMaterial ?? product.id)` 查表
 * （加工成品走 productMaterial 回落到基础菜，基础果蔬自身即原材料）。
 * 同一产品出现多次时：地块数与预计产量累加，最早取 min、最晚取 max。
 */
export const buildCropPlotStatByProduct = (rows: CropPlotStatVO[]): Record<string, CropPlotStatByProduct> => {
  const map: Record<string, CropPlotStatByProduct> = {};
  for (const row of rows) {
    if (row.primaryProductId === null || row.primaryProductId === undefined || row.primaryProductId === '') {
      continue;
    }
    const key = String(row.primaryProductId);
    const hit = map[key];
    if (!hit) {
      map[key] = {
        remainPlotCount: Number(row.remainPlotCount ?? 0),
        expectYield: Number(row.expectYield ?? 0),
        earliestPickDate: row.earliestPickDate ?? null,
        latestPickDate: row.latestPickDate ?? null
      };
      continue;
    }
    hit.remainPlotCount += Number(row.remainPlotCount ?? 0);
    hit.expectYield += Number(row.expectYield ?? 0);
    if (row.earliestPickDate && (!hit.earliestPickDate || row.earliestPickDate < hit.earliestPickDate)) {
      hit.earliestPickDate = row.earliestPickDate;
    }
    if (row.latestPickDate && (!hit.latestPickDate || row.latestPickDate > hit.latestPickDate)) {
      hit.latestPickDate = row.latestPickDate;
    }
  }
  return map;
};

export default { listCropPlotStat, buildCropPlotStatByProduct };
