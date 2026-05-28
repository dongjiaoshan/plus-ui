/**
 * 果蔬有机证书类型定义（PLT-MD-003）。
 */

export interface CropOrganicVO extends BaseEntity {
  id: number | string;
  cropCertNo: string;
  cropCertCompany: string;
  cropCertValid: string;
  cropId: number | string;
  /** service enrich：关联作物名 */
  cropName?: string;
  cropImagePreview?: string;
  cropImageUrl?: string;
  isWarning: number;
}

export interface CropOrganicForm {
  id?: number | string;
  cropCertNo: string;
  cropCertCompany: string;
  cropCertValid: string;
  cropId?: number | string;
  cropImagePreview?: string;
  cropImageUrl?: string;
}

export interface CropOrganicQuery extends PageQuery {
  cropCertNo?: string;
  cropCertCompany?: string;
  cropId?: number | string;
  isWarning?: number;
}
