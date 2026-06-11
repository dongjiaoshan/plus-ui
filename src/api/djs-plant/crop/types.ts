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
  /** 主图 ossId（IMG-LIB-001 L1，自动匹配/手改） */
  imageOssId?: string | null;
  /** 图来源（0 自动 / 1 手动） */
  imageSource?: number;
  /** 主图 public URL（resolver 兜底回填） */
  imageUrl?: string | null;
}

export interface CropInfoForm {
  id?: number | string;
  cropCode: string;
  cropName: string;
  cropImagePreview?: string;
  cropImageUrl?: string;
  /** 主图 ossId（IMG-LIB-001；手选则提交 imageSource=1） */
  imageOssId?: string | null;
  /** 图来源（0 自动 / 1 手动） */
  imageSource?: number;
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
