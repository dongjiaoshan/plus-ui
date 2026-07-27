/**
 * 地块类型定义（PLT-MD-001）。
 */

export interface PlotInfoVO extends BaseEntity {
  id: number | string;
  plotCode: string;
  plotImagePreview?: string;
  plotImageUrl?: string;
  zoneId: number | string;
  /** service enrich：所属片区名 */
  zoneName?: string;
  /** service enrich：所属大区（取自所属片区 zone.zoneBelong；字典 djs_zone_belong） */
  zoneBelong?: string;
  plotType?: string;
  plotName: string;
  plotStatus: number;
  isLease: number;
  plotRemark?: string;
  plotArea: number | string;
  plotLocationDesc?: string;
  plotLocationX?: number | string;
  plotLocationY?: number | string;
  soilType?: string;
  soilFertility?: string;
  soilPh?: number | string;
  terrainCondition?: string;
  lightCondition?: string;
  drainCondition?: string;
  /** D9+ PLT-PLAN-001 上线后启用，D8 阶段始终 null */
  currentCropName?: string;
  /** service enrich：历史种植次数（按 plot_id COUNT t_plant_plant_details） */
  historyPlantCount?: number;
  /** service enrich：最高亩产作物名 */
  maxYieldCropName?: string;
  /** service enrich：最高亩作物产量 kg/亩 */
  maxYieldPerMu?: number | string;
  /** 更新人姓名（后端 @Translation 回填） */
  updateByName?: string;
}

export interface PlotInfoForm {
  id?: number | string;
  plotCode: string;
  plotImagePreview?: string;
  plotImageUrl?: string;
  zoneId?: number | string;
  plotType?: string;
  plotName: string;
  /** 当前状态：表单只读展示（默认空闲），不参与提交，后端按种植记录联动（FIX-PLT-AD-DETAIL-001） */
  plotStatus?: number;
  isLease: number;
  plotRemark?: string;
  plotArea?: number;
  plotLocationDesc?: string;
  plotLocationX?: number;
  plotLocationY?: number;
  soilType?: string;
  soilFertility?: string;
  soilPh?: number;
  terrainCondition?: string;
  lightCondition?: string;
  drainCondition?: string;
}

export interface PlotInfoQuery extends PageQuery {
  zoneId?: number | string;
  plotCode?: string;
  plotName?: string;
  plotType?: string;
  plotStatus?: number;
  isLease?: number;
}

/**
 * 地块详情·种植信息子表单行（按 plotId 透视）。
 * 字段对齐后端 PlotPlantingRecordVo。
 */
export interface PlotPlantingRecordVO {
  id: number | string;
  /** 种植日期 */
  plantDate?: string;
  /** 作物图片（OSS objectName） */
  cropImage?: string;
  cropName?: string;
  cropCode?: string;
  /** 种植人（种植班组名） */
  plantByName?: string;
  /** 预计亩产（kg/亩） */
  expectedYield?: number | string;
  /** 实际产量（kg） */
  actualProduction?: number | string;
  /** 实际亩产（kg/亩） */
  actualYield?: number | string;
  /** 采摘开始日期 */
  beginHarvestdate?: string;
  /** 采摘结束日期 */
  endHarvestdate?: string;
  /** 采摘人（采摘班组名） */
  harvestByName?: string;
}

/**
 * 地块详情·农事信息子表单行（FIX-PLT-AD-DETAIL-001，按 plotId 透视）。
 * 字段对齐后端 PlotFarmworkRecordVo。
 */
export interface PlotFarmworkRecordVO {
  id: number | string;
  /** 农事日期 */
  farmDate?: string;
  /** 农事类型（字典 djs_farm_work_type） */
  farmType?: string;
  /** 作业地块名 */
  plotName?: string;
  /** 作业人（处理班组名） */
  farmByName?: string;
  /** 说明 */
  remark?: string;
}

/**
 * 地块详情·认证信息子表单行（FIX-PLT-AD-DETAIL-001，按 plotId 透视）。
 * 字段对齐后端 PlotOrganicRefVo。
 */
export interface PlotOrganicRefVO {
  organicId: number | string;
  /** 证书编号 */
  organicNo?: string;
  /** 颁发单位 */
  organicCompany?: string;
  /** 有效期 */
  organicValid?: string;
  /** 是否预警（字典 djs_yes_no：1=预警 / 2=正常） */
  isWarning?: number;
}
