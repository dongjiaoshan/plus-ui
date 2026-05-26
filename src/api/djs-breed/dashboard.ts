import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 养殖看板 API（BRD-DASH-001 / D7）。
 *
 * 后端：
 *  - GET  /djs/breed/dashboard/inventory          — 实时库存
 *  - GET  /djs/breed/dashboard/monthly-comparison — 月度对比（当月 vs 上月）
 *  - GET  /djs/breed/dashboard/activity-7d        — 近 7 天活动统计
 *  - GET  /djs/breed/dashboard/annual             — 年度指标
 *  - POST /djs/breed/dashboard/trigger-aggregate  — 手动触发聚合（dev 调试）
 *
 * 颜色规则（国内畜牧惯例反直觉，doc/06 强调）：
 *  - trend = "better" → 红（数值更好）
 *  - trend = "worse"  → 绿（数值更差）
 *  - trend = "flat"   → 黑（持平）
 * be 已根据"上升好还是下降好"决定 trend；fe 只做色彩映射，**不要**自己根据 diff 正负判断。
 */

/** 实时库存返回结构 */
export interface InventoryVO {
  /** key=pig_type (sow/boar/piglet/fattening/reserve) → count，缺失 type 不写入 */
  inventoryByType: Record<string, number>;
  /** key=lifecycle (PZ/PH/FM/DN/KH/...) → count，仅活母猪 */
  sowByLifecycle: Record<string, number>;
}

/** 月度对比单项 KPI */
export interface KpiCompareVO {
  /** 当月值，BigDecimal → number */
  current: number;
  /** 上月值 */
  previous: number;
  /** 差值（current - previous，可负） */
  diff: number;
  /** 趋势字符串，fe 据此映射红/绿/黑 */
  trend: 'better' | 'worse' | 'flat';
}

/** 月度对比返回结构 */
export interface MonthlyComparisonVO {
  currentMonth: string;
  previousMonth: string;
  introduceCount: KpiCompareVO;
  bornCount: KpiCompareVO;
  weanedCount: KpiCompareVO;
  deathCount: KpiCompareVO;
  cullingCount: KpiCompareVO;
  marketingCount: KpiCompareVO;
  marketingWeight: KpiCompareVO;
}

/** 近 7 天单日聚合 */
export interface DailyRowVO {
  statDate: string;
  sowTotal: number;
  sowPregnant: number;
  sowFarrow: number;
  sowWeaning: number;
  sowIdle: number;
  sowCullingCount: number;
  sowDeathCount: number;
  pigletTotal: number;
}

/** 近 7 天活动统计返回结构 */
export interface Activity7dVO {
  rows: DailyRowVO[];
}

/** 年度指标返回结构 */
export interface AnnualIndicatorVO {
  statYear: number;
  introduceCount: number;
  bornCount: number;
  weanedCount: number;
  deathCount: number;
  cullingCount: number;
  marketingCount: number;
  /** kg，BigDecimal(2) */
  marketingWeight: number;
  /** PSY 每头母猪年产断奶仔数，4 位小数 */
  psy: number;
  /** 死亡率，4 位小数 (0~1) */
  mortalityRate: number;
}

export const getInventory = (): AxiosPromise<InventoryVO> => {
  return request({
    url: '/djs/breed/dashboard/inventory',
    method: 'get'
  });
};

export const getMonthlyComparison = (yearMonth?: string): AxiosPromise<MonthlyComparisonVO> => {
  return request({
    url: '/djs/breed/dashboard/monthly-comparison',
    method: 'get',
    params: yearMonth ? { yearMonth } : undefined
  });
};

export const getActivity7d = (): AxiosPromise<Activity7dVO> => {
  return request({
    url: '/djs/breed/dashboard/activity-7d',
    method: 'get'
  });
};

export const getAnnual = (year?: number): AxiosPromise<AnnualIndicatorVO> => {
  return request({
    url: '/djs/breed/dashboard/annual',
    method: 'get',
    params: year ? { year } : undefined
  });
};

export const triggerAggregate = (date?: string): AxiosPromise<string> => {
  return request({
    url: '/djs/breed/dashboard/trigger-aggregate',
    method: 'post',
    params: date ? { date } : undefined
  });
};
