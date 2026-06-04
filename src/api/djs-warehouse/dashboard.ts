import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 仓库看板 API（DJS-FIX-ADMIN-W22-006 占位版）。
 *
 * 后端：org.dromara.djs.warehouse.dashboard.controller.WarehouseDashboardController
 *   - GET /djs/warehouse/dashboard/summary  3 KPI 卡 + 库位概览
 *
 * 完整版（趋势折线 / 出入库饼图 / 4 业态对比）推 V1.x WMS-DASH-001。
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

/** 仓库看板汇总 */
export const getWarehouseDashboardSummary = (): AxiosPromise<WarehouseDashboardSummaryVo> => {
  return request({
    url: '/djs/warehouse/dashboard/summary',
    method: 'get'
  });
};
