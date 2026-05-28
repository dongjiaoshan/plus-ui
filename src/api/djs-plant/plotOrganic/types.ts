/**
 * 土地有机证书类型定义（PLT-MD-003）。
 *
 * - ID 字段全 `number | string`：snowflake long → string 序列化，避免精度丢失
 */

export interface RelatedPlotRef {
  plotId: number | string;
  plotName: string;
}

export interface PlotOrganicVO extends BaseEntity {
  id: number | string;
  organicNo: string;
  organicCompany: string;
  organicValid: string;
  organicImagePreview?: string;
  organicImageUrl?: string;
  isWarning: number;
  relatedPlots?: RelatedPlotRef[];
}

/**
 * 新增 / 编辑表单。
 *
 * `organicNo` 新增时必填，编辑时后端强制锁回旧值（form 仍展示，disabled）。
 * `plotIds` 关联地块多选；后端先软删旧关联再插入新关联（同事务）。
 */
export interface PlotOrganicForm {
  id?: number | string;
  organicNo: string;
  organicCompany: string;
  organicValid: string;
  organicImagePreview?: string;
  organicImageUrl?: string;
  plotIds?: (number | string)[];
}

export interface PlotOrganicQuery extends PageQuery {
  organicNo?: string;
  organicCompany?: string;
  isWarning?: number;
}
