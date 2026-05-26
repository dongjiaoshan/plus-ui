/**
 * 库位类型定义（WMS-MD-001）。
 *
 * - ID 字段全 `number | string`：跟 plus-ui 现有惯例对齐；后端 Jackson Long → String 序列化为字符串，
 *   表单 number 输入兼容 union。
 */

export interface LocationInfoVO extends BaseEntity {
  id: number | string;
  locationCode: string;
  locationName: string;
  locationType: string;
  locationThumb?: string;
  locationImg?: string;
  locationStatus: number;
  capacity?: number | string;
  remark?: string;
}

/**
 * 新增 / 编辑表单。
 *
 * `locationCode` 新增时必填，编辑时后端强制锁回旧值（form 仍展示，disabled）。
 */
export interface LocationInfoForm {
  id?: number | string;
  locationCode: string;
  locationName: string;
  locationType: string;
  locationThumb?: string;
  locationImg?: string;
  locationStatus: number;
  /** 表单层用 number；后端 BigDecimal 序列化对接（后端 schema DECIMAL(12,2)） */
  capacity?: number;
  remark?: string;
}

export interface LocationInfoQuery extends PageQuery {
  locationCode?: string;
  locationName?: string;
  locationType?: string;
  locationStatus?: number;
}
