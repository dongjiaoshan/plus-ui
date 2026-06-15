/**
 * 种植看板 API 类型（PLT-DASH-001 富图看板版）。
 *
 * 后端 org.dromara.djs.plant.dashboard.controller.PlantDashboardController  /djs/plant/dashboard
 * 纯只读聚合：
 *  - GET /summary  土地总览 KPI + 今日农事 + 当月完成率 + 实时种植物统计 + 有机证书一览
 *  - GET /gantt    双甘特（种植段 + 采摘段）
 */

/** 今日农事按类型分桶单行（farm_type code + count，label 走 djs_farm_work_type 字典）。 */
export interface FarmWorkCountVO {
  /** 农事类型 code（djs_farm_work_type） */
  farmType: string;
  /** 该类型今日条数 */
  count: number;
}

/** 当月完成率柱状图单行（按作物分组的 实际 / 预期 产量）。 */
export interface MonthCompletionItemVO {
  /** 作物名称 */
  cropName: string;
  /** 当月该作物实际产量合计 kg */
  actualYield: number;
  /** 当月该作物预期产量合计 kg */
  expectedYield: number;
}

/** 实时种植物统计单行（区块 4：bar=在种地块数 + line=预计产量 kg）。 */
export interface CropPlantStatItemVO {
  /** 作物名称 */
  cropName: string;
  /** 该作物当前在种地块数（bar） */
  plotCount: number;
  /** 该作物预计产量合计 kg（line） */
  expectedYield: number;
}

/** 有机证书情况一览（区块 3）。 */
export interface OrganicCertOverviewVO {
  /** 土地有机证书最早到期天数（可为负=已过期，无证书 null） */
  plotCertMinDays: number | null;
  /** 作物有机证书最早到期天数（可为负=已过期，无证书 null） */
  cropCertMinDays: number | null;
  /** 作物无证书品类数 */
  cropNoCertCount: number;
  /** 已建档作物品类总数（预留证书品类数） */
  cropReservedCount: number;
}

/** 种植看板汇总（/summary 返回结构）。 */
export interface PlantDashboardSummaryVO {
  /** 空闲地块数（plot_status=1） */
  idlePlotCount: number;
  /** 种植中地块数（plot_status=2） */
  plantingPlotCount: number;
  /** 采摘中地块数（plot_status=3） */
  harvestingPlotCount: number;
  /** 待种地块数 */
  pendingPlotCount: number;
  /** 地块总数 */
  totalPlotCount: number;
  /** 土地总面积（亩） */
  totalPlotArea: number;
  /** 当前种植面积（亩） */
  currentPlantingArea: number;
  /** 当前预计产量（kg，前端按 kg → 万斤换算） */
  currentExpectedYield: number;
  /** 今日农事分桶列表 */
  todayFarmWork: FarmWorkCountVO[];
  /** 今日农事总条数 */
  todayFarmWorkTotal: number;
  /** 当月完成率列表 */
  monthCompletion: MonthCompletionItemVO[];
  /** 实时种植物统计列表（按作物） */
  cropPlantStat: CropPlantStatItemVO[];
  /** 有机证书情况一览 */
  organicCertOverview: OrganicCertOverviewVO;
}

/** 双甘特单条（种植段 plant=绿 / 采摘段 pick=黄）。 */
export interface GanttItemVO {
  /** 甘特条 id（明细 snowflake id + -plant / -pick，string 防丢精度） */
  id: string;
  /** 甘特条文本（作物名-地块名） */
  text: string;
  /** 段开始日期 */
  startDate: string;
  /** 段结束日期 */
  endDate: string;
  /** 进度 0~100 */
  progress: number;
  /** 段类型：plant / pick */
  type: 'plant' | 'pick';
}
