import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 仓库看板 API。
 *
 * 后端：org.dromara.djs.warehouse.dashboard.controller.WarehouseDashboardController
 *   - GET /djs/warehouse/dashboard/summary  3 KPI 卡 + 库位概览
 *   - GET /djs/warehouse/dashboard/charts   6 ECharts 图 + 双 KPI 横条 11 指标
 *
 * 跨层契约：locationId 是 snowflake，类型 string（不可 number，防 19 位截断）。
 */

/** 库位概览单行（与后端 LocationOverviewItemVo 对齐） */
export interface LocationOverviewItem {
  /** 库位 ID（snowflake，string） */
  locationId: string;
  /** 库位名称 */
  locationName: string;
  /** 库位类型（字典 djs_location_type） */
  locationType: string;
  /** 当前库存合计（kg 或 件） */
  currentStock: number;
  /** 状态 normal / abnormal */
  status: string;
}

/** 仓库看板汇总（与后端 WarehouseDashboardSummaryVo 对齐） */
export interface WarehouseDashboardSummaryVo {
  /** 今日白条需求量（SUM demand_quantity，白条业态） */
  todayDemandQuantity: number;
  /** 今日生产入库笔数 */
  todayProductionCount: number;
  /** 最近盘点正常数（diff=0） */
  stockCheckNormal: number;
  /** 最近盘点异常数（diff!=0） */
  stockCheckAbnormal: number;
  /** 最近盘点计损数（diff<0 盘亏） */
  stockCheckLoss: number;
  /** 当月异常库位数 */
  monthAbnormalLocationCount: number;
  /** 库位概览列表（Top 20） */
  locationOverview: LocationOverviewItem[];
}

/** 饼图 / 环形图 series item（与后端 ChartSeriesItemVo 对齐） */
export interface ChartSeriesItem {
  /** 分类标签（已映射中文） */
  name: string;
  /** 聚合值 */
  value: number;
}

/** 折线图单点（与后端 ChartTrendPointVo 对齐） */
export interface ChartTrendPoint {
  /** 日期 yyyy-MM-dd */
  date: string;
  /** 当日聚合值 */
  value: number;
}

/** 仓库看板可视化（与后端 WarehouseDashboardChartsVo 对齐） */
export interface WarehouseDashboardChartsVo {
  /** 图① 需求饼（4 业态需求量占比） */
  demandByType: ChartSeriesItem[];
  /** 图② 退货环（退货方向构成） */
  returnByDirection: ChartSeriesItem[];
  /** 图③ 生产趋势折线（近 7 日生产重量） */
  productionTrend: ChartTrendPoint[];
  /** 图④ 盘点结果饼（正常 / 异常 / 计损） */
  checkResult: ChartSeriesItem[];
  /** 图⑤ 异常库位环（异常 vs 正常库位数） */
  locationHealth: ChartSeriesItem[];
  /** 图⑥ 损耗折线（近 7 日损耗量） */
  lossTrend: ChartTrendPoint[];

  // 横条 1「今日需求」6 项
  /** 白条业态需求量 */
  todayDemandWhiteBar: number;
  /** 蔬菜业态需求量 */
  todayDemandVegetable: number;
  /** 礼盒业态需求量 */
  todayDemandGiftBox: number;
  /** 其他业态需求量 */
  todayDemandOther: number;
  /** 今日需求单数 */
  todayDemandOrderCount: number;
  /** 今日需求总量 */
  todayDemandTotal: number;

  // 横条 2「今日生产」5 项
  /** 今日生产笔数 */
  todayProductionCount: number;
  /** 今日生产重量 */
  todayProductionWeight: number;
  /** 今日入库笔数 */
  todayInboundCount: number;
  /** 今日出库笔数 */
  todayOutboundCount: number;
  /** 今日损耗量 */
  todayLossQuantity: number;
}

/** 仓库看板汇总（3 KPI 卡 + 库位概览） */
export const getWarehouseDashboardSummary = (): AxiosPromise<WarehouseDashboardSummaryVo> => {
  return request({
    url: '/djs/warehouse/dashboard/summary',
    method: 'get'
  });
};

/** 仓库看板可视化（6 图 + 双 KPI 横条） */
export const getWarehouseDashboardCharts = (): AxiosPromise<WarehouseDashboardChartsVo> => {
  return request({
    url: '/djs/warehouse/dashboard/charts',
    method: 'get'
  });
};
