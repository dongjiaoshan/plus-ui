/**
 * 种植看板 API 类型（PLT-DASH-001 富图看板版）。
 *
 * 后端 org.dromara.djs.plant.dashboard.controller.PlantDashboardController  /djs/plant/dashboard
 * 纯只读聚合：
 *  - GET /summary  土地总览 KPI + 今日农事 + 当月完成率 + 实时种植物统计 + 有机证书一览
 *  - GET /gantt    双甘特（种植段 + 采摘段）
 */

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

/** 有机证书一览（区块 3，果蔬证书口径）。 */
export interface OrganicCertOverviewVO {
  /** 果蔬有机证到期日（最新一张果蔬证书到期日 YYYY-MM-DD，无证书 null） */
  cropCertExpiryDate: string | null;
  /** 果蔬有机证书到期天数（DATEDIFF，可为负=已过期，无证书 null） */
  cropCertDaysToExpiry: number | null;
  /** 作物无证书品类数（在种作物中不在最新证书覆盖品类里的数量） */
  cropNoCertCount: number;
  /** 果蔬有机证书品类数（在种作物中在最新证书覆盖品类里的数量） */
  cropCertCategoryCount: number;
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
  /** 当月待种植地块数（当月有计划但未实际开始种植的不重复地块数） */
  monthPendingPlotCount: number;
  /** 地块总数 */
  totalPlotCount: number;
  /** 土地总面积（亩） */
  totalPlotArea: number;
  /** 当前种植面积（亩） */
  currentPlantingArea: number;
  /** 当前预计产量（kg，前端按 kg → 万斤换算） */
  currentExpectedYield: number;
  /** 当年预计产量（kg，前端按 kg → 吨换算 ÷1000） */
  annualExpectedYield: number;
  /** 今日工作 - 种植（今日 begin_actualdate=CURDATE 地块数） */
  todayPlantingPlotCount: number;
  /** 今日工作 - 采摘（今日 begin_harvestdate=CURDATE 地块数） */
  todayHarvestPlotCount: number;
  /** 今日工作 - 空地管理（今日农事 翻耕/整地/施肥 地块数） */
  todayIdleMgmtPlotCount: number;
  /** 今日工作 - 种植管理（今日农事 移栽/水肥/浇灌/除草/整枝绑蔓/病虫防治/退茬 地块数） */
  todayPlantMgmtPlotCount: number;
  /** 今日工作 - 灾害损失（今日农事 disaster 地块数） */
  todayDisasterPlotCount: number;
  /** 今日工作 - 采摘活动（今日采摘活动采摘量 kg） */
  todayPickActivityWeight: number;
  /** 当月完成率列表 */
  monthCompletion: MonthCompletionItemVO[];
  /** 实时种植物统计列表（按作物） */
  cropPlantStat: CropPlantStatItemVO[];
  /** 有机证书情况一览 */
  organicCertOverview: OrganicCertOverviewVO;
}

/** 双甘特单条（种植段 plant=绿 / 采摘段 pick=黄）。 */
export interface GanttItemVO {
  /** 甘特条 id（种植段=明细id+-plant / 采摘段=作物id+-pick，string 防丢精度） */
  id: string;
  /** 甘特条文本（种植段=作物名-地块名 / 采摘段=作物名） */
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
