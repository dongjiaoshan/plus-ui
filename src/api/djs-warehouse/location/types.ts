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
  /** 库位排序（升序，越小越靠前） */
  locationSort?: number;
  /** 库位说明 */
  locationDesc?: string;
  remark?: string;
  /** 更新人姓名（后端 @Translation 回填） */
  updateByName?: string;
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
  /** 库位排序（升序，越小越靠前） */
  locationSort?: number;
  /** 库位说明 */
  locationDesc?: string;
  remark?: string;
}

export interface LocationInfoQuery extends PageQuery {
  locationCode?: string;
  locationName?: string;
  locationType?: string;
  locationStatus?: number;
}

/**
 * 库位卡片汇总（DJS-FIX-ADMIN-W22-008）。
 *
 * 库位总览页卡片网格数据源；后端按单个库位逐行返回（每库位一张卡）。
 * 镜像 be {@code LocationCardSummaryVo} 字段。
 */
export interface LocationCardSummaryVO {
  /** 库位主键 id（卡片唯一 key） */
  locationId: number | string;
  /** 库位编码 */
  locationCode: string;
  /** 库位名称（卡片标题） */
  locationName: string;
  /** 库位类型字典 value（副标签） */
  locationType: string;
  /** 库位类型中文 label */
  locationTypeLabel: string;
  /** 该库位在库产品数 */
  productCount: number;
  /** 当前库存总量 */
  currentStock: number | string;
  /** 今日入库总量 */
  todayInQty: number | string;
  /** 今日出库总量 */
  todayOutQty: number | string;
  /** 最近盘点日 */
  lastCheckDate?: string;
  /** 最近盘点结果（djs_check_result 1/2/3） */
  lastCheckResult?: number;
}
