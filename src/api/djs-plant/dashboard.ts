import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 种植看板 API（PLT-DASH-001 / D13）。
 *
 * 后端（纯只读聚合，前端 5 分钟轮询）：
 *  - GET /djs/plant/dashboard/summary — 土地总览 KPI + 今日农事 KPI + 当月完成率柱状图
 *  - GET /djs/plant/dashboard/gantt   — 双甘特图（种植段 plant 绿 / 采摘段 pick 黄）
 *
 * 权限：djs:plant:dashboard:view（be @SaCheckPermission 与 fe 路由 perms 一致）。
 */

/** 今日农事按类型分桶单项 */
export interface FarmWorkCountVO {
  /** 农事类型 code（字典 djs_farm_work_type） */
  farmType: string;
  /** 该类型今日农事条数 */
  count: number;
}

/** 当月完成率柱状图单项 */
export interface MonthCompletionItemVO {
  /** 作物名称 */
  cropName: string;
  /** 当月实际产量合计（BigDecimal → number） */
  actualYield: number;
  /** 当月预期产量合计（BigDecimal → number） */
  expectedYield: number;
}

/** 种植看板汇总返回结构 */
export interface PlantDashboardSummaryVO {
  /** 空闲地块数 */
  idlePlotCount: number;
  /** 种植中地块数 */
  plantingPlotCount: number;
  /** 采摘中地块数 */
  harvestingPlotCount: number;
  /** 待种地块数 */
  pendingPlotCount: number;
  /** 地块总数 */
  totalPlotCount: number;
  /** 土地总面积（亩，BigDecimal → number） */
  totalPlotArea: number;
  /** 今日农事按类型分桶 */
  todayFarmWork: FarmWorkCountVO[];
  /** 今日农事总条数 */
  todayFarmWorkTotal: number;
  /** 当月完成率（按作物分组） */
  monthCompletion: MonthCompletionItemVO[];
}

/** 甘特单条（种植段 / 采摘段） */
export interface GanttItemVO {
  /**
   * 甘特条 id（明细 snowflake id + "-plant" / "-pick"）。
   * snowflake 19 位序列化为 string，不准 number（跨层契约 1：丢精度）。
   */
  id: string;
  /** 甘特条文本（作物名-地块名） */
  text: string;
  /** 段开始日期（yyyy-MM-dd） */
  startDate: string;
  /** 段结束日期（yyyy-MM-dd） */
  endDate: string;
  /** 进度 0~100 */
  progress: number;
  /** 段类型：plant（种植）/ pick（采摘） */
  type: 'plant' | 'pick';
}

export const getSummary = (): AxiosPromise<PlantDashboardSummaryVO> => {
  return request({
    url: '/djs/plant/dashboard/summary',
    method: 'get'
  });
};

export const getGantt = (): AxiosPromise<GanttItemVO[]> => {
  return request({
    url: '/djs/plant/dashboard/gantt',
    method: 'get'
  });
};
