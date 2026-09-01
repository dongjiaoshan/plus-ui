/**
 * 果蔬上市计划类型定义（V6-R151，运营管理 → 农场信息）。
 *
 * 后端：org.dromara.djs.plant.market.*  /djs/ops/marketPlan
 * 雪花 id 全链路 string（后端 Jackson 全局把 Long 序列化成字符串）。
 */

/** 列表查询条件：作物名称模糊 + 上市月份 + 下架月份（筛选粒度仍是月，格式 yyyy-MM）。 */
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
  /** 作物图片 OSS URL（无图为空；只上列表不进导出） */
  cropImageUrl?: string;
  /**
   * 上市状态码（后端按上市/下架日期与当天现算，不落库）：
   * pending 待上市 / upcoming 即将上市 / on_sale 上市中 / ending 即将下市 / off_shelf 已下架；
   * 上市日期为空时为空。中文由前端按码查 i18n（marketPlan.status.*）。
   */
  marketStatus?: string;
  /** 状态中文名（后端导出 Excel 用，前端不读它） */
  marketStatusName?: string;
  /** 作物名称 */
  cropName?: string;
  /** 预计产量 kg */
  expectedYield?: number;
  /** 实际产量 kg */
  actualYield?: number;
  /** 上市日期 yyyy-MM-dd（实际开始采摘日期优先，无则计划最早采摘日期；该计划无采摘明细时为空） */
  marketBeginDate?: string;
  /** 下架日期 yyyy-MM-dd（实际结束采摘日期优先，无则计划最晚采摘日期；该计划无采摘明细时为空） */
  marketEndDate?: string;
}
