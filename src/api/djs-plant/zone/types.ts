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
  /** 管理地块数量（后端聚合：该片区下未删除地块数，FIX-PLT-AD-ZONE-001） */
  plotCount?: number;
  zoneStatus: number;
  /** 更新人 ID（后端 sys_user.user_id） */
  updateBy?: number | string;
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
  /** 所属大区（字典 djs_zone_belong 值，精确匹配） */
  zoneBelong?: string;
  zoneName?: string;
  zoneStatus?: number;
  /** 更新人 ID（精确匹配，FIX-PLT-AD-ZONE-001） */
  updateBy?: number;
  /** 更新时间起（yyyy-MM-dd[ HH:mm:ss]，含） */
  updateTimeStart?: string;
  /** 更新时间止（yyyy-MM-dd[ HH:mm:ss]，含） */
  updateTimeEnd?: string;
}
