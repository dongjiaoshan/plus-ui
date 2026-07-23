import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 仓库看板 API。
 *
 * 后端：org.dromara.djs.warehouse.dashboard.controller.WarehouseDashboardController
 *   - GET /djs/warehouse/dashboard/summary  3 KPI 卡 + 库位概览
 *   - GET /djs/warehouse/dashboard/charts   6 ECharts 图 + 双 KPI 横条 11 指标
 *
 * 跨层契约：locationId 是 snowflake，类型 string（不可 number，防 19 位截断）。
 */

/** 库位概览单行（与后端 LocationOverviewItemVo 对齐） */
export interface LocationOverviewItem {
  /** 库位 ID（snowflake，string） */
  locationId: string;
  /** 库位名称 */
  locationName: string;
  /** 库位类型（字典 djs_location_type） */
  locationType: string;
  /** 当前库存合计（kg 或 件） */
  currentStock: number;
  /** 状态 normal / abnormal */
  status: string;
}

/** 仓库看板汇总（与后端 WarehouseDashboardSummaryVo 对齐） */
export interface WarehouseDashboardSummaryVo {
  /** 今日白条需求量（SUM demand_quantity，白条业态） */
  todayDemandQuantity: number;
  /** 今日生产入库笔数 */
  todayProductionCount: number;
  /** 最近盘点正常数（diff=0） */
  stockCheckNormal: number;
  /** 最近盘点异常数（diff!=0） */
  stockCheckAbnormal: number;
  /** 最近盘点计损数（diff<0 盘亏） */
  stockCheckLoss: number;
  /** 当月异常库位数 */
  monthAbnormalLocationCount: number;
  /** 库位概览列表（Top 20） */
  locationOverview: LocationOverviewItem[];
}

/** 饼图 / 环形图 series item（与后端 ChartSeriesItemVo 对齐） */
export interface ChartSeriesItem {
  /** 分类标签（已映射中文） */
  name: string;
  /** 聚合值 */
  value: number;
  /** 产品单位（product_unit，用于前端 KG / 非 KG 维度过滤；'kg' 为 KG，其余 / 空为非 KG） */
  unit?: string;
}

/** 折线图单点（与后端 ChartTrendPointVo 对齐） */
export interface ChartTrendPoint {
  /** 日期 yyyy-MM-dd */
  date: string;
  /** 当日聚合值 */
  value: number;
}

/** 仓库看板可视化（与后端 WarehouseDashboardChartsVo 对齐） */
export interface WarehouseDashboardChartsVo {
  /** 图① 果蔬产品当日需求分布饼（近 30 日 vegetable 业态按产品名） */
  demandByType: ChartSeriesItem[];
  /** 图①（近 7 日）明日产品需求分布·猪肉（pork 按产品名，前端「猪肉/果蔬」切换） */
  demandPork: ChartSeriesItem[];
  /** 图①（近 7 日）明日产品需求分布·果蔬（vegetable 按产品名，前端「猪肉/果蔬」切换 + TOP5 归其他） */
  demandVeg: ChartSeriesItem[];
  /** 图② 退货环（退货方向构成，兼容旧口径） */
  returnByDirection: ChartSeriesItem[];
  /** 图② 退货分布·猪肉（pork 按产品名） */
  returnPork: ChartSeriesItem[];
  /** 图② 退货分布·果蔬（vegetable 按产品名，前端「猪肉/果蔬」切换） */
  returnVegetable: ChartSeriesItem[];
  /** 图③ 生产趋势折线（近 7 日生产重量，兼容旧口径） */
  productionTrend: ChartTrendPoint[];
  /** 图③ 组合图·白条头数（近 7 日，柱） */
  productionWhiteBarHeadTrend: ChartTrendPoint[];
  /** 图③ 组合图·猪肉产品重量（近 7 日，线） */
  productionPorkWeightTrend: ChartTrendPoint[];
  /** 图③ 组合图·果蔬产品重量（近 7 日，线） */
  productionVegWeightTrend: ChartTrendPoint[];
  /** 图④ 盘点结果饼（正常 / 异常 / 计损） */
  checkResult: ChartSeriesItem[];
  /** 图⑤ 异常库位环（异常 vs 正常库位数，兼容旧口径） */
  locationHealth: ChartSeriesItem[];
  /** 图⑤ 当月盘点异常库位分布环（按库位名） */
  abnormalLocationByName: ChartSeriesItem[];
  /** 图⑥ 损耗折线（近 7 日损耗量，兼容旧口径） */
  lossTrend: ChartTrendPoint[];
  /** 图⑥ 损耗多系列·猪肉（近 7 日，线） */
  lossPorkTrend: ChartTrendPoint[];
  /** 图⑥ 损耗多系列·果蔬（近 7 日，线） */
  lossVegTrend: ChartTrendPoint[];

  // 横条 1「今日需求」8 项（对齐原型）+ 兼容旧 3 项
  /** 白条需求（头） */
  todayDemandWhiteBar: number;
  /** 猪肉产品需求量（kg） */
  todayDemandPork: number;
  /** 红白脏产品需求量（kg，V1 无数据源默认 0） */
  todayDemandOffal: number;
  /** 礼盒需求量（份） */
  todayDemandGiftBox: number;
  /** 果蔬产品需求品种数（种，belong_type='vegetable' 去重产品数） */
  todayDemandVegetableKinds: number;
  /** 猪肉产品需求品种数（种，belong_type='pork' 去重产品数） */
  todayDemandPorkKinds: number;
  /** 其他产品需求品种数（种，belong_type 非 pork/vegetable/white_bar 去重产品数） */
  todayDemandOtherKinds: number;
  /** 果蔬需求量（kg） */
  todayDemandVegetable: number;
  /** 鸡蛋需求量（个） */
  todayDemandEgg: number;
  /** 干货需求量（kg） */
  todayDemandDryGood: number;
  /** 其他业态需求量（兼容旧口径） */
  todayDemandOther: number;
  /** 今日需求单数（兼容旧口径） */
  todayDemandOrderCount: number;
  /** 今日需求总量（兼容旧口径） */
  todayDemandTotal: number;

  // 横条 2「今日生产」8 项（对齐原型）+ 兼容旧 5 项
  /** 送宰猪只（头） */
  todaySlaughterPigCount: number;
  /** 白条总重（kg） */
  todayWhiteBarWeight: number;
  /** 出栏猪只总重（kg，今日 bar_info marketing_weight 合计） */
  todayMarketingWeight: number;
  /** 毛菜处理果蔬品种数（种，今日 record_type=1 已称重去重作物数） */
  todayVegHandleKinds: number;
  /** 毛菜处理果蔬总重量（kg，今日 record_type=1 已称重 record_weight 合计） */
  todayVegHandleWeight: number;
  /** 分割白条（头） */
  todayCutBarCount: number;
  /** 分割猪只产品总重（kg） */
  todayCutProductWeight: number;
  /** 果蔬接收品种（种） */
  todayVegReceiveKinds: number;
  /** 果蔬接收总重（kg） */
  todayVegReceiveWeight: number;
  /** 果蔬产品种类（种） */
  todayVegProductKinds: number;
  /** 果蔬产品总重（kg） */
  todayVegProductWeight: number;
  /** 今日生产笔数（兼容旧口径） */
  todayProductionCount: number;
  /** 今日生产重量（兼容旧口径） */
  todayProductionWeight: number;
  /** 今日入库笔数（兼容旧口径） */
  todayInboundCount: number;
  /** 今日出库笔数（兼容旧口径） */
  todayOutboundCount: number;
  /** 今日损耗量（兼容旧口径） */
  todayLossQuantity: number;
}

/** 仓库看板汇总（3 KPI 卡 + 库位概览） */
export const getWarehouseDashboardSummary = (): AxiosPromise<WarehouseDashboardSummaryVo> => {
  return request({
    url: '/djs/warehouse/dashboard/summary',
    method: 'get'
  });
};

/** 仓库看板可视化（6 图 + 双 KPI 横条） */
export const getWarehouseDashboardCharts = (): AxiosPromise<WarehouseDashboardChartsVo> => {
  return request({
    url: '/djs/warehouse/dashboard/charts',
    method: 'get'
  });
};
