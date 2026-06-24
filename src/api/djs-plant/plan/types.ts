/**
 * 种植计划相关类型（PLT-PLAN-001）。
 *
 * 对齐后端：
 *   - org.dromara.djs.plant.plan.domain.vo.PlantPlanVo
 *   - org.dromara.djs.plant.plan.domain.bo.PlantPlanCreateBo / PlantPlanUpdateBo
 *
 * 注意：snowflake ID 全链路 string（契约 1）。
 */

export interface PlantPlanQuery {
  planNo?: string;
  planYear?: number;
  planSeason?: string;
  cropId?: number | string;
  /** 农作物名称模糊（原型「种植农作物」筛选，对 crop_info.crop_name like）。 */
  cropName?: string;
  plantStatus?: string;
  /** 计划日期范围-起（导出/兼容保留，列表筛选已改为 planMonth）。 */
  beginPlanDate?: string;
  /** 计划日期范围-止（导出/兼容保留）。 */
  endPlanDate?: string;
  /** 计划月份（原型「计划月份」筛选，1-12；结合 planYear 查某年某月的计划）。 */
  planMonth?: number;
  /** 计划更新时间（按天，原型「计划更新时间」筛选）。 */
  queryUpdateTime?: string;
  /** 计划编制人 user_id（原型「计划编制人」筛选，对 create_by 精确，导出/兼容保留）。 */
  queryCreateBy?: number | string;
  /** 计划编制人姓名模糊（原型「计划编制人」筛选，对 sys_user.nick_name like）。 */
  queryCreateByName?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface PlantPlanVO {
  id: string;
  planNo: string;
  planYear: number;
  cropId: string;
  cropName?: string;
  /** 种植图片（crop_info.crop_image_preview，service enrich）。 */
  cropImage?: string;
  plantDate?: string;
  planSeason: string;
  /** 计划最早开始日期 = MIN(details 开始日期推算)。 */
  earliestBegindate?: string;
  /** 计划最晚开始日期 = MAX(details 开始日期推算)。 */
  lastBegindate?: string;
  /** 计划种植月份（最早开始那条明细的 plant_month）；列表"计划种植日期"列用。 */
  plantMonth?: number;
  /** 计划种植旬别（05/15/25，dict djs_plant_period）；与 plantMonth 拼成「6月中旬」。 */
  plantPeriod?: string;
  earliestHarvestdate?: string;
  lastHarvestdate?: string;
  totalArea?: number;
  totalPlot?: number;
  /** 预计产量 kg = SUM(details.expected_yield)。 */
  expectedYield?: number;
  /** 实际产量 kg = SUM(details.actual_yield)。 */
  actualYield?: number;
  /** 已完成种植地数量 = COUNT(details plant_status=completed)。 */
  finishedPlot?: number;
  /** 计划完成率(%) = finishedPlot/totalPlot×100，0~100。 */
  completionRate?: number;
  plantStatus: string;
  createTime?: string;
  /** 计划更新时间。 */
  updateTime?: string;
  /** 编制人 user_id。 */
  createBy?: number | string;
  /** 计划编制人姓名（注解翻译）。 */
  createByName?: string;
}

/** 列表顶部 5 KPI 统计卡（FIX-PLT-AD-PLAN-001，对齐原型 7b44cd24）。 */
export interface PlantPlanStatsVO {
  /** 空地块数。 */
  idlePlot?: number;
  /** 已种植地块数。 */
  plantedPlot?: number;
  /** 计划种植地块数。 */
  plannedPlot?: number;
  /** 计划地块使用频次（小数）。 */
  plotUsageFreq?: number;
  /** 计划种植作物品种数。 */
  cropVarietyCount?: number;
}

export interface PlantDetailInput {
  id?: string;
  plotId: string;
  plantMonth: number;
  plantPeriod: '05' | '15' | '25';
  plantBy?: string;
  harvestBy?: string;
}

export interface PlantPlanCreateForm {
  planYear: number;
  planSeason: string;
  cropId?: string;
  plantDate?: string;
  details: PlantDetailInput[];
}

export interface PlantPlanUpdateForm {
  id: string;
  planSeason?: string;
  cropId?: string;
  plantDate?: string;
  details?: PlantDetailInput[];
}

export interface PlantDetailsVO {
  id: string;
  plantId: string;
  plotId: string;
  cropId: string;
  plantMonth: number;
  plantPeriod: string;
  beginActualdate?: string;
  endActualdate?: string;
  beginHarvestdate?: string;
  endHarvestdate?: string;
  earliestHarvestdate: string;
  lastHarvestdate: string;
  plantStatus: string;
  harvestStatus: string;
  plotArea: number;
  expectedYield?: number;
  lossYield?: number;
  actualYield?: number;
  averageYield?: number;
  plantBy?: string;
  harvestBy?: string;
  isPick: number;
  plotName?: string;
  plotCode?: string;
  cropName?: string;
  plantTeamName?: string;
  harvestTeamName?: string;
}

export interface PlantPlanDetailVO {
  plan: PlantPlanVO;
  details: PlantDetailsVO[];
}

export interface PlotByZoneRow {
  plotId: string;
  plotName: string;
  plotCode: string;
  plotArea: number;
  plotStatus: number;
  /** 当年该地块计划种植次数（轮作次数）；listAvailablePlots(planYear) 传 planYear 时回填。 */
  rotationCount?: number;
}

/** 向导 step3「查看」弹框：某地块当年计划实际数据行（测试反馈 row27）。 */
export interface PlotYearPlanRowVO {
  detailId: string;
  /** 计划种植月份 1-12。 */
  plantMonth?: number;
  /** 计划种植旬别 05/15/25（dict djs_plant_period）。 */
  plantPeriod?: string;
  /** 计划种植作物名。 */
  cropName?: string;
  /** 最早采摘日期。 */
  earliestHarvestdate?: string;
  /** 最晚采摘日期。 */
  lastHarvestdate?: string;
  /** 种植状态（dict djs_plant_plan_status）。 */
  plantStatus?: string;
  /** 采摘状态（dict djs_pick_status）。 */
  harvestStatus?: string;
}

export interface PlotByZoneVO {
  zoneId?: string;
  zoneName: string;
  zoneCode: string;
  plots: PlotByZoneRow[];
}

export interface PlantPlanGanttRow {
  detailId: string;
  plotId: string;
  plotName?: string;
  plotCode?: string;
  earliestHarvestdate?: string;
  lastHarvestdate?: string;
  beginActualdate?: string;
  endActualdate?: string;
  beginHarvestdate?: string;
  endHarvestdate?: string;
  plantStatus: string;
  harvestStatus: string;
}

export interface PlantPlanGanttVO {
  planId: string;
  planNo: string;
  planYear: number;
  planSeason: string;
  cropName?: string;
  rows: PlantPlanGanttRow[];
}
