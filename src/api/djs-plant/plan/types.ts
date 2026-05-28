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
  pageNum?: number;
  pageSize?: number;
}

export interface PlantPlanVO {
  id: string;
  planNo: string;
  planYear: number;
  cropId: string;
  cropName?: string;
  plantDate?: string;
  planSeason: string;
  earliestHarvestdate?: string;
  lastHarvestdate?: string;
  totalArea?: number;
  totalPlot?: number;
  plantStatus: string;
  createTime?: string;
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
