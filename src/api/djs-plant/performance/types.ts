/**
 * 班组绩效结算类型定义（PLT-PERF-001）。
 *
 * 镜像后端 org.dromara.djs.plant.perf.domain.vo.PlantWorkPerformanceVo。
 * ID 字段全 string（snowflake 19 位，Number 会截断，见 skill coder-djs-cross-layer-contract 契约 1）。
 */

/** 绩效列表行。 */
export interface PlantWorkPerformanceVO {
  id: string;
  /** 统计月份 yyyy-MM */
  statMonth: string;
  teamId?: string;
  /** service enrich：班组名 */
  teamName?: string;
  cropId?: string;
  /** service enrich：作物名 */
  cropName?: string;
  /** 采摘总量（斤） */
  pickWeight?: number | string;
  /** 单价快照（元/斤） */
  unitPriceSnapshot?: number | string;
  /** 应付绩效金额（元） */
  performanceAmount?: number | string;
  /** 绩效规则描述（如 "1.00 元/斤"） */
  performanceRule?: string;
  remark?: string;
  createTime?: string;
}

/** 绩效列表查询参数。 */
export interface PlantWorkPerformanceQuery extends PageQuery {
  /** 统计月份 yyyy-MM（精确匹配） */
  statMonth?: string;
  teamId?: number | string;
  cropId?: number | string;
}
