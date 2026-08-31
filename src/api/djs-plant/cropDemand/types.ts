/**
 * 作物需求 / 需求反馈类型契约（V6-R152 运营端 + V6-R153 种植端，同一张表两个入口）。
 *
 * 对齐后端：org.dromara.djs.plant.demand.domain.{vo.CropDemandVo, bo.CropDemandBo, bo.CropDemandReplyBo, query.CropDemandQuery}
 *
 * 注意：snowflake ID（id / createBy / replyBy / ossId）全链路 string，禁 Number() 转换。
 */

/** 需求状态字典 djs_plant_demand_status 的两个 code。 */
export const DEMAND_STATUS_PENDING = 'pending';
export const DEMAND_STATUS_REPLIED = 'replied';

export interface CropDemandVO extends BaseEntity {
  id: number | string;
  /** 需求日期（YYYY-MM-DD）。 */
  demandDate: string;
  /** 需求分类（字典 djs_plant_demand_category）。 */
  demandCategory: string;
  /** 需求内容。 */
  demandContent: string;
  /** 需求状态（字典 djs_plant_demand_status）。 */
  demandStatus: string;
  /** 需求图片 ossId 逗号分隔。 */
  imageOssIds?: string;
  /** 回复内容。 */
  replyContent?: string;
  /** 回复时间。 */
  replyTime?: string;
  /** 回复人 ID。 */
  replyBy?: number | string;
  /** 回复人姓名（后端注解翻译）。 */
  replyByName?: string;
  /** 创建人 ID（前端据此判断删除按钮是否可见；后端仍独立校验）。 */
  createBy?: number | string;
  /** 创建人姓名（后端注解翻译）。 */
  createByName?: string;
}

/** 新增需求表单（弹框只有分类 / 内容 / 图片，日期与状态服务端定）。 */
export interface CropDemandForm {
  demandCategory: string;
  demandContent: string;
  imageOssIds?: string;
}

/** 回复表单（首次回复与修改回复同一入口）。 */
export interface CropDemandReplyForm {
  id: number | string;
  replyContent: string;
}

export interface CropDemandQuery extends PageQuery {
  demandContent?: string;
  demandCategory?: string;
  demandStatus?: string;
  /** 需求日期范围起（YYYY-MM-DD，含）。 */
  beginDate?: string;
  /** 需求日期范围止（YYYY-MM-DD，含）。 */
  endDate?: string;
}
