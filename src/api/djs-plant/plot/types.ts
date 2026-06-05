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
  plotStatus: number;
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
