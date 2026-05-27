/**
 * 作物类型定义（PLT-MD-001）。
 */

export interface CropInfoVO extends BaseEntity {
  id: number | string;
  cropCode: string;
  cropName: string;
  cropImagePreview?: string;
  cropImageUrl?: string;
  varietyName?: string;
  varietyOrigin?: string;
  cropFamily?: string;
  relatedProduct?: number | string;
  plantingSeason?: string;
  sowingPeriod?: string;
  maxCycle?: number;
  minCycle?: number;
  fertilizationInterval?: number;
  irrigationInterval?: number;
  predictedPer?: number | string;
  qualityDesc?: string;
  pickUnitPrice?: number | string;
}

export interface CropInfoForm {
  id?: number | string;
  cropCode: string;
  cropName: string;
  cropImagePreview?: string;
  cropImageUrl?: string;
  varietyName?: string;
  varietyOrigin?: string;
  cropFamily?: string;
  relatedProduct?: number | string;
  /** 多选逗号分隔（spring,summer 等） */
  plantingSeason?: string;
  sowingPeriod?: string;
  maxCycle?: number;
  minCycle?: number;
  fertilizationInterval?: number;
  irrigationInterval?: number;
  predictedPer?: number;
  qualityDesc?: string;
  pickUnitPrice?: number;
}

export interface CropInfoQuery extends PageQuery {
  cropCode?: string;
  cropName?: string;
  varietyName?: string;
  cropFamily?: string;
  plantingSeason?: string;
}
