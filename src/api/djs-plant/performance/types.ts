/**
 * 班组绩效结算类型定义（PLT-PERF-001）。
 *
 * 镜像后端 org.dromara.djs.plant.perf.domain.vo.PlantWorkPerformanceVo。
 * ID 字段全 string（snowflake 19 位，Number 会截断，见 skill coder-djs-cross-layer-contract 契约 1）。
 */

/**
 * 主列表行（班组 × 月聚合，rework 134/135）。
 *
 * 镜像后端 PerfListRow。列表行无唯一 id，前端 row-key / 详情寻址用 teamId+statMonth 复合键。
 */
export interface PerfListRowVO {
  /** 统计月份 yyyy-MM */
  statMonth: string;
  teamId?: string;
  /** service enrich：班组名 */
  teamName?: string;
  /** service enrich：班组人数（该班组 t_plant_work_people 活动成员数） */
  teamMemberCount?: number;
  /** 采摘总量（斤，= SUM(pick_weight)） */
  totalPickWeight?: number | string;
  /** 该班组该月绩效总额（元，= SUM(performance_amount)） */
  teamMonthAmount?: number | string;
  /** 作物种类数 */
  cropCount?: number;
  /** 农事处理总数（该班组该月全部农事类型计数） */
  farmCount?: number;
}

/**
 * 逐作物绩效行（详情「产量绩效」tab 按作物分行，rework 135）。
 *
 * 镜像后端 PlantWorkPerformanceVo。ID 字段全 string（snowflake 19 位，Number 会截断）。
 */
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
}
