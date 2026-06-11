/**
 * 采摘计划 + 采摘活动类型契约（PLT-PLAN-002）。
 *
 * 对齐后端：
 *   - org.dromara.djs.plant.pick.domain.vo.{PickPlanGroupVo, PickActivityVo, PickTaskVo}
 *   - org.dromara.djs.plant.pick.domain.bo.{PickAdjustBatchBo, PickDetailAdjustBo, PickActivityBo}
 *
 * 注意：snowflake ID 全链路 string（契约 1）。
 */

// ============================================================
// 采摘计划（按作物聚合 + 调整）
// ============================================================

export interface PickPlanQuery {
  planYear?: number;
  planSeason?: string;
  cropId?: number | string;
  harvestStatus?: string;
}

export interface PickPlanGroupVO {
  plantId: string;
  planNo: string;
  planYear: number;
  planSeason: string;
  cropId: string;
  cropName?: string;
  plotCount: number;
  planEarliest?: string;
  planLatest?: string;
  actualBegin?: string;
  actualEnd?: string;
  expectedYield?: number;
  actualYield?: number;
  activityPlotCount: number;
}

export interface PickDetailAdjustInput {
  id: string;
  /** 计划最早采摘日期（用户可编辑） */
  earliestHarvestdate?: string;
  /** 计划最晚采摘日期（按窗口天数由最早派生，后端重算兜底） */
  lastHarvestdate?: string;
  /** 1=是 / 2=否 */
  isPick?: number;
  harvestBy?: string;
}

export interface PickAdjustBatchForm {
  plantId: string;
  cropId: string;
  rows: PickDetailAdjustInput[];
}

// ============================================================
// 采摘活动（CRUD）
// ============================================================

export interface PickActivityQuery {
  activityNo?: string;
  activityName?: string;
  activityStatus?: string;
  cropId?: number | string;
  dateFrom?: string;
  dateTo?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface PickActivityVO {
  id: string;
  activityNo: string;
  activityName: string;
  activityDate: string;
  activityStatus: string;
  cropId: string;
  cropName: string;
  totalPlot: number;
  totalYield: number;
  visitorCount?: number;
  remark?: string;
  createTime?: string;
}

export interface PickActivityForm {
  id?: string;
  activityName: string;
  activityDate: string;
  activityStatus?: string;
  cropId: string;
  totalPlot?: number;
  totalYield?: number;
  visitorCount?: number;
  remark?: string;
}
