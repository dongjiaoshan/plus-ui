/**
 * 果蔬上市计划类型定义（V6-R151，运营管理 → 农场信息）。
 *
 * 后端：org.dromara.djs.plant.market.*  /djs/ops/marketPlan
 * 雪花 id 全链路 string（后端 Jackson 全局把 Long 序列化成字符串）。
 */

/** 列表查询条件：作物名称模糊 + 上市月份 + 下市月份（月份格式 yyyy-MM）。 */
export interface MarketPlanQuery {
  cropName?: string;
  marketBeginMonth?: string;
  marketEndMonth?: string;
  pageNum?: number;
  pageSize?: number;
}

/** 一行 = 一条种植计划。 */
export interface MarketPlanVO {
  /** 种植计划 id（row-key） */
  planId: string;
  /** 计划编号 PLAN-yyyy-NNN（不上列表） */
  planNo?: string;
  /** 计划年份（不上列表） */
  planYear?: number;
  /** 作物 id */
  cropId?: string;
  /** 作物主图 ossId（后端已解析成 cropImageUrl，前端不直接用） */
  cropImage?: string;
  /** 作物图片 OSS URL（无图为空） */
  cropImageUrl?: string;
  /** 作物名称 */
  cropName?: string;
  /** 预计产量 kg */
  expectedYield?: number;
  /** 实际产量 kg */
  actualYield?: number;
  /** 上市月份 yyyy-MM（该计划无采摘明细时为空） */
  marketBeginMonth?: string;
  /** 下市月份 yyyy-MM（该计划无采摘明细时为空） */
  marketEndMonth?: string;
}
