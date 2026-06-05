/**
 * 片区类型定义（PLT-MD-001）。
 *
 * - ID 字段全 `number | string`：snowflake long → string 序列化，避免精度丢失
 */

export interface PlotZoneVO extends BaseEntity {
  id: number | string;
  zoneCode: string;
  zoneName: string;
  zoneDesc?: string;
  zoneBelong?: string;
  zoneStatus: number;
  /** 更新人姓名（后端 @Translation 回填） */
  updateByName?: string;
}

/**
 * 新增 / 编辑表单。
 *
 * `zoneCode` 新增时必填，编辑时后端强制锁回旧值（form 仍展示，disabled）。
 */
export interface PlotZoneForm {
  id?: number | string;
  zoneCode: string;
  zoneName: string;
  zoneDesc?: string;
  zoneBelong?: string;
  zoneStatus: number;
}

export interface PlotZoneQuery extends PageQuery {
  zoneCode?: string;
  zoneName?: string;
  zoneStatus?: number;
}
