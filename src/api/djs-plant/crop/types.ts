/**
 * 作物类型定义（PLT-MD-001 + FIX-PLT-AD-INFO-LIST-001 派生统计 + FIX-PLT-AD-DETAIL-001 详情子表）。
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
  /** 作物属（自由文本，例 芸薹属） */
  cropGenus?: string;
  relatedProduct?: number | string;
  /** 关联产品名称（后端按 relatedProduct → t_warehouse_product_info.product_name 批量 enrich） */
  relatedProductName?: string;
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
  /** 更新人 ID（BaseEntity） */
  updateBy?: number | string;
  /** 更新人姓名（后端 @Translation enrich） */
  updateByName?: string;
  /** 历史种植次数（派生统计，COUNT t_plant_plant_details） */
  historyPlantCount?: number;
  /** 平均亩产 kg/亩（派生统计，AVG average_yield） */
  avgYield?: number | string;
  /** 最大亩产 kg/亩（派生统计，MAX average_yield） */
  maxYield?: number | string;
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
  /** 作物属（自由文本，例 芸薹属） */
  cropGenus?: string;
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
  varietyOrigin?: string;
  cropFamily?: string;
  /** 作物属（自由文本，模糊） */
  cropGenus?: string;
  plantingSeason?: string;
  /** 有机证书（1=有 / 2=无） */
  hasOrganic?: number;
  /** 证书是否预警（1=预警 / 2=正常） */
  organicWarning?: number;
  updateBy?: number | string;
  /** 更新时间范围，RuoYi BaseEntity 约定 params[beginTime]/params[endTime] */
  params?: Record<string, any>;
}

/**
 * 作物详情·种植信息子表行（FIX-PLT-AD-DETAIL-001，9 列）。
 * 后端 org.dromara.djs.plant.crop.domain.vo.CropPlantingRecordVo（T2 同名对齐）。
 */
export interface CropPlantingRecordVO {
  id: number | string;
  /** 种植日期 */
  plantDate?: string;
  /** 地块编码 */
  plotCode?: string;
  /** 种植地块名 */
  plotName?: string;
  /** 种植人（种植班组名） */
  plantTeamName?: string;
  /** 预计亩产 kg/亩 */
  predictedPer?: number | string;
  /** 预计最早采摘日期 */
  earliestHarvestDate?: string;
  /** 实际产量 kg（明细采摘累计 actual_yield） */
  actualYield?: number | string;
  /** 实际亩产 kg/亩 = actual_yield / plot_area */
  actualPer?: number | string;
  /** 采摘开始日期 */
  pickStartDate?: string;
  /** 采摘结束日期 */
  pickEndDate?: string;
  /** 采摘人（采摘班组名） */
  pickTeamName?: string;
}

/**
 * 作物详情·农事信息子表行（FIX-PLT-AD-DETAIL-001）。
 * 后端 org.dromara.djs.plant.crop.domain.vo.CropFarmworkVo（T2 同名对齐）。
 */
export interface CropFarmworkVO {
  id: number | string;
  /** 农事日期 */
  farmDate?: string;
  /** 农事类型（字典 djs_farm_work_type 值） */
  farmType?: string;
  /** 作业地块名 */
  plotName?: string;
  /** 作业人（处理班组名） */
  teamName?: string;
  /** 说明（备注） */
  remark?: string;
}
