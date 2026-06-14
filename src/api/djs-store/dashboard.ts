import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 门店看板 API（STR-DASH-001，纯只读聚合）。
 *
 * 后端：org.dromara.djs.store.dashboard.controller.StoreDashboardController
 *   - GET /djs/store/dashboard/summary?storeId=  6 KPI + 产品结构 + TOP10 + 近10日趋势
 *   - GET /djs/store/dashboard/daily?storeId=    猪肉/果蔬速览 + 需求/发货统计（mp 主用）
 *
 * 数据源 t_store_sale_record（STR-OP-001）+ t_warehouse_demand_manage（WMS-DEMAND-001），无新表。
 *
 * 跨层契约：productId 是 snowflake，类型 string（不可 number，防 19 位截断）。
 */

/** 通用"分组 : 数量"项（产品结构 / 需求统计 / 发货统计 复用） */
export interface StoreGroupCount {
  /** 分组键（业态 / 状态字面量） */
  key: string;
  /** 聚合值（需求量 / 笔数） */
  value: number;
}

/** TOP10 产品排行单行（与后端 StoreProductRankItemVo 对齐） */
export interface StoreProductRankItem {
  /** 产品 ID（snowflake，string） */
  productId: string;
  /** 产品名称 */
  productName: string;
  /** 销售额 */
  saleAmount: number;
  /** 销售数量 */
  saleQty: number;
  /** 订单数（当月热门产品 TOP10 按订单数排行用） */
  orderCount?: number;
}

/** 近 N 日新增会员趋势单点（与后端 StoreMemberGrowthPointVo 对齐） */
export interface StoreMemberGrowthPoint {
  /** 日期 'YYYY-MM-DD' */
  date: string;
  /** 当日新增会员数 */
  count: number;
}

/** 近 10 日趋势单点（与后端 StoreTrendPointVo 对齐） */
export interface StoreTrendPoint {
  /** 日期 'YYYY-MM-DD' */
  date: string;
  /** 当日订单数 */
  orderCount: number;
  /** 当日销售额 */
  saleAmount: number;
  /** 当日销售量（原型销售量/退货量柱） */
  saleQty: number;
  /** 当日退货量（原型销售量/退货量柱） */
  returnQty: number;
  /** 当日客单价 */
  avgPrice: number;
}

/** 门店看板汇总（与后端 StoreDashboardSummaryVo 对齐） */
export interface StoreDashboardSummaryVo {
  /** 今日销售额 */
  todaySaleAmount: number;
  /** 本月累计销售额 */
  monthSaleAmount: number;
  /** 今日订单数 */
  todayOrderCount: number;
  /** 本月订单数 */
  monthOrderCount: number;
  /** 待发货数 */
  pendingShipCount: number;
  /** 待采购数 */
  pendingPurchaseCount: number;
  /** 会员总数（原型会员信息组） */
  totalMembers: number;
  /** 今日新增会员（原型会员信息组） */
  todayNewMembers: number;
  /** 老客复购数（当月消费 ≥2 次会员数，原型会员信息组） */
  repeatCustomer: number;
  /** 本月客单价（monthSaleAmount/monthOrderCount，原型会员信息组） */
  monthAvgPrice: number;
  /** 今日销售额同比 %（上期为 0 时 null） */
  todaySaleAmountYoy?: number | null;
  /** 今日订单数同比 %（上期为 0 时 null） */
  todayOrderCountYoy?: number | null;
  /** 当日产品结构（业态:需求量，保留兼容） */
  productStructure: StoreGroupCount[];
  /** 当月订单产品结构（产品名:订单数，原型「当月订单产品结构」饼图） */
  monthProductStructure: StoreGroupCount[];
  /** 当日热销产品 TOP10 排行（按销售额） */
  top10Products: StoreProductRankItem[];
  /** 当月热门产品 TOP10 排行（按订单数，原型横向柱） */
  monthTop10ByOrder: StoreProductRankItem[];
  /** 近 10 日趋势（订单数/销售额/客单价/销售量/退货量） */
  trend10Days: StoreTrendPoint[];
  /** 近 10 日新增会员趋势（原型「近十日订单数与新会员趋势」竖柱） */
  memberGrowth10Days: StoreMemberGrowthPoint[];
  /** 本月逐日趋势（原型「销售额与客单价趋势」竖柱=销售额+折线=客单价，横轴本月每天） */
  monthDailyTrend: StoreTrendPoint[];
}

/** 门店看板汇总（storeId 可选，不传按数据权限范围聚合） */
export const getStoreDashboardSummary = (storeId?: string): AxiosPromise<StoreDashboardSummaryVo> => {
  return request({
    url: '/djs/store/dashboard/summary',
    method: 'get',
    params: storeId ? { storeId } : undefined
  });
};
