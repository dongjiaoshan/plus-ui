/**
 * 种植总览类型定义（FIX-PLT-AD-OVERVIEW-001）。
 *
 * 镜像后端 org.dromara.djs.plant.overview.domain.vo.*：
 *  - PlantOverviewSummaryVo（5 产量 KPI 吨 + 作物卡片列表）
 *  - CropOverviewCardVo（单作物卡片，kg）
 *  - CropDetailVo（作物详情 14 列逐地块明细，kg）
 *
 * ID 字段（cropId）全 string（snowflake 19 位，Number 会截断，见 skill coder-djs-cross-layer-contract 契约 1）。
 * 单位口径（决策#7）：KPI 用吨（*Ton），卡片/明细用 kg。
 */

/** 单作物卡片（图1 作物卡片网格，整卡可点击下钻携 cropId）。 */
export interface CropOverviewCardVO {
  /** 作物 id（下钻 query 参数 cropId）。 */
  cropId: string;
  /** 作物名称。 */
  cropName?: string;
  /** 作物编码（卡片上随作物名展示，区分同名不同编码作物）。 */
  cropCode?: string;
  /** 作物缩略图 ossId（卡片缩略图，listByIds 换 url）。 */
  cropImageOssId?: string | null;
  /** 当前地已种（已实际开始种植地块数，卡片头展示）。 */
  currentPlantedPlotCount?: number;
  /** 当前已种面积（亩）。 */
  currentPlantedArea?: number | string;

  // ============== 「计划」组 ==============
  /** 计划地块数。 */
  planPlotCount?: number;
  /** 计划面积（亩）。 */
  planArea?: number | string;
  /** 计划预计产量（kg）。 */
  planExpectedYield?: number | string;

  // ============== 「已完成」组 ==============
  /** 已种地数。 */
  donePlotCount?: number;
  /** 已种面积（亩）。 */
  doneArea?: number | string;
  /** 已摘产量（kg）。 */
  doneHarvestYield?: number | string;
}

/** 种植总览汇总（图1：5 产量 KPI 吨 + 作物卡片列表 kg）。 */
export interface PlantOverviewSummaryVO {
  /** ① 空地块数（plot_status=1）。 */
  idlePlotCount?: number;
  /** ② 已种植地块数（plot_status=2）。 */
  plantedPlotCount?: number;
  /** ③ 已采摘总量（吨，SUM(actual_yield)/1000）。 */
  harvestedTotalTon?: number | string;
  /** ④ 预计总产量（吨，SUM(expected_yield)/1000）。 */
  expectedTotalTon?: number | string;
  /** ⑤ 剩余预计总产量（吨，(expected-actual)/1000，下限 0）。 */
  remainingExpectedTon?: number | string;
  /** 作物卡片列表（每作物一卡；无数据时空列表）。 */
  crops?: CropOverviewCardVO[];
}

/** 作物详情 14 列逐地块明细行（图2，按 cropId 聚合 t_plant_plant_details）。 */
export interface CropDetailVO {
  /** 明细 id（row-key 用，不导出）。 */
  id: string;
  /** 1 作物名称。 */
  cropName?: string;
  /** 2 地块编号（plot_code，用户手填业务码）。 */
  plotCode?: string;
  /** 3 种植地块（plot_name）。 */
  plotName?: string;
  /** 3 种植状态（字典 djs_plant_plan_status）。 */
  plantStatus?: string;
  /** 4 采摘状态（字典 djs_pick_status）。 */
  harvestStatus?: string;
  /** 4 种植季（字典 djs_planting_season）。 */
  planSeason?: string;
  /** 5 计划种植日期（模糊文案，例 "4月中旬"）。 */
  planPlantDate?: string;
  /** 6 种植日期（YYYY-MM-DD，未发生 null）。 */
  plantDate?: string | null;
  /** 7 种植人员（种植班组名）。 */
  plantTeamName?: string;
  /** 8 实际开始采摘日期（null 未发生）。 */
  beginHarvestdate?: string | null;
  /** 9 实际结束采摘日期（null 未发生）。 */
  endHarvestdate?: string | null;
  /** 10 最早起始采摘时间（计划最早采摘日）。 */
  earliestHarvestdate?: string | null;
  /** 11 最晚截止采摘时间（计划最晚采摘日）。 */
  lastHarvestdate?: string | null;
  /** 12 地块面积（亩）。 */
  plotArea?: number | string;
  /** 13 标准产量（kg，预计产量）。 */
  expectedYield?: number | string;
  /** 14 实际采收量（kg）。 */
  actualYield?: number | string;
}
