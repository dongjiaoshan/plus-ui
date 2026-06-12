/**
 * 果蔬有机证书类型定义（PLT-MD-003 / FIX-PLT-AD-INFO-LIST-001）。
 */

/** 关联作物轻量引用（一证多作物，service enrich，对齐后端 CropRefVo）。 */
export interface RelatedCropRef {
  cropId: number | string;
  cropName: string;
}

export interface CropOrganicVO extends BaseEntity {
  id: number | string;
  cropCertNo: string;
  cropCertCompany: string;
  cropCertValid: string;
  /** 旧单值关联作物 ID（过渡保留，一证多作物以 relatedCrops 为准）。 */
  cropId?: number | string;
  /** service enrich：旧单值关联作物名（过渡保留）。 */
  cropName?: string;
  /** 关联作物（一证多作物，service enrich）。 */
  relatedCrops?: RelatedCropRef[];
  cropImagePreview?: string;
  cropImageUrl?: string;
  isWarning: number;
  /** 更新人姓名（后端注解翻译 updateBy → updateByName）。 */
  updateByName?: string;
}

export interface CropOrganicForm {
  id?: number | string;
  cropCertNo: string;
  cropCertCompany: string;
  cropCertValid: string;
  /** 旧单值关联作物 ID（过渡保留）。 */
  cropId?: number | string;
  /** 关联作物 ID 列表（一证多作物，el-transfer 选）。 */
  cropIds?: (number | string)[];
  cropImagePreview?: string;
  cropImageUrl?: string;
}

export interface CropOrganicQuery extends PageQuery {
  cropCertNo?: string;
  cropCertCompany?: string;
  cropId?: number | string;
  isWarning?: number;
}
