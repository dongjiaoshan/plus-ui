/**
 * 采摘计划 + 采摘活动类型契约（PLT-PLAN-002）。
 *
 * 对齐后端：
 *   - org.dromara.djs.plant.pick.domain.vo.{PickPlanGroupVo, PickActivityVo, PickTaskVo}
 *
 * 采摘计划列表按作物纯聚合（去 plantId/planNo），详情/调整改单行（setSchedule / toggleActivity）。
 * 注意：snowflake ID 全链路 string（契约 1）。
 */

// ============================================================
// 采摘计划（按作物聚合 + 调整）
// ============================================================

export interface PickPlanQuery {
  /** 作物筛选（原型唯一主筛选「作物名称」下拉传 cropId） */
  cropId?: number | string;
  /** 采摘状态（原型外增强项，后端仍支持；默认不传） */
  harvestStatus?: string;
}

/**
 * 采摘计划列表行 VO（按作物纯聚合，对齐原型）。
 * 对齐后端 org.dromara.djs.plant.pick.domain.vo.PickPlanGroupVo。
 */
export interface PickPlanGroupVO {
  cropId: string;
  cropName?: string;
  /** 作物主图 public URL（后端 resolver 回填）。 */
  cropImageUrl?: string;
  plotCount: number;
  planEarliest?: string;
  planLatest?: string;
  /** 当前种植亩数（SUM plot_area，亩）。 */
  totalAcreage?: number;
  /** 预计需求量（kg；无来源时 NULL，前端 - 兜底）。 */
  demandQty?: number;
  /** 预计产量（SUM expected_yield，kg）。 */
  expectedYield?: number;
  /** 当年已采摘量（当年累计实采，kg）。 */
  actualYield?: number;
  /** 预计灾害损失量（SUM loss_yield，kg）。 */
  disasterLoss?: number;
  /** 当年种植地块总数。 */
  plotTotalCount?: number;
  /** 已设为采摘活动的地块数。 */
  activityPlotCount: number;
}

/**
 * 「设置计划」modal 单行提交：仅 开始 / 结束采摘日期。
 * id = plant_details.id（PK，后端据此定位单行，无需 plantId）。
 */
export interface PickSetScheduleForm {
  id: string;
  /** 开始采摘日期（earliest_harvestdate） */
  earliestHarvestdate?: string;
  /** 结束采摘日期（last_harvestdate） */
  lastHarvestdate?: string;
}

/** 「设为/取消采摘活动」单行切换：is_pick 1=是 / 2=否。 */
export interface PickToggleActivityForm {
  id: string;
  isPick: number;
}

// ============================================================
// 采摘活动（只读每日采摘聚合报表）
// 对齐后端 org.dromara.djs.plant.pick.domain.vo.PickActivityVo
//   + org.dromara.djs.plant.pick.domain.query.PickActivityQuery
// 按「作物 + 活动日期」聚合 t_plant_plant_details，仅查询 + 导出，无写操作。
// ============================================================

export interface PickActivityQuery {
  /** 作物 id（作物名称下拉） */
  cropId?: number | string;
  /** 活动日期（单日，对齐原型） */
  activityDate?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface PickActivityVO {
  /** 作物 id（作物名称下拉回显用） */
  cropId: string;
  /** 活动日期 */
  activityDate: string;
  /** 作物名称 */
  cropName: string;
  /** 活动地块数（COUNT DISTINCT plot_id） */
  plotCount: number;
  /** 今日采摘重量（当日 SUM actual_yield，kg） */
  todayPickWeight?: number;
  /** 预计总产量（SUM expected_yield，kg） */
  expectedYield?: number;
  /** 累计已采重量（截至该日累计 SUM actual_yield，kg） */
  cumulativePickWeight?: number;
}
