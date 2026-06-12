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
  plantStatus?: string;
  /** 计划日期模糊（原型「计划日期」筛选，对后端 plant_date）。 */
  planDate?: string;
  /** 计划更新时间（按天，原型「计划更新时间」筛选）。 */
  queryUpdateTime?: string;
  /** 计划编制人 user_id（原型「计划编制人」筛选，对 create_by）。 */
  queryCreateBy?: number | string;
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
