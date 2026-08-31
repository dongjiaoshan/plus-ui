import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 库存看板 admin API（运营管理 → 农场信息 → 育肥猪信息，V6-R150）。
 *
 * 后端：
 *  - GET /djs/breed/inventory/age-dist    — 日龄分布（柱状图）
 *  - GET /djs/breed/inventory/barn-matrix — 栋舍 × 日龄段矩阵（列表）
 *
 * 两个端点直接委托小程序「猪只库存信息」页在用的同一个 service，日龄分桶口径完全一致
 * （甲方要求「和小程序里的展示保持一致」）。育肥猪的分段来自后台「育肥日龄阶段配置」
 * （t_farm_fatten_age_stage），段数动态；仔猪为固定 6 段。
 */

/** 本页支持的猪只段（与后端 pig_type 对齐） */
export type OpsInventoryPigType = 'fattening' | 'piglet';

/** 日龄分布桶项 */
export interface InventoryDistItemVO {
  /** 分段中文名，如 '26-42日' / '250日以上'（后端按配置动态生成的数据，直接上屏，不做 i18n） */
  label: string;
  /** 该段头数（含 0 段） */
  count: number;
}

/** 栋舍 × 日龄段矩阵行 */
export interface InventoryBarnMatrixVO {
  /** 栋舍 ID（string，全链路禁 Number） */
  barnId: string;
  /** 栋舍名称 */
  barnName: string;
  /** 该栋舍在栏总头数（已排除离场 END、无栋舍猪只） */
  count: number;
  /** 按状态分组计数：仅母猪段有值，育肥/仔猪段为空对象 */
  byStatus: Record<string, number>;
  /** key = 中文日龄段名，与 age-dist 的 label 一一对应且同序（含 count=0 的段） */
  byAge?: Record<string, number>;
}

/** 日龄分布（柱状图数据源） */
export const getOpsInventoryAgeDist = (pigType: OpsInventoryPigType): AxiosPromise<InventoryDistItemVO[]> => {
  return request({
    url: '/djs/breed/inventory/age-dist',
    method: 'get',
    params: { pigType }
  });
};

/** 栋舍 × 日龄段矩阵（列表数据源） */
export const getOpsInventoryBarnMatrix = (pigType: OpsInventoryPigType): AxiosPromise<InventoryBarnMatrixVO[]> => {
  return request({
    url: '/djs/breed/inventory/barn-matrix',
    method: 'get',
    params: { pigType }
  });
};
