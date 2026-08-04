import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 库存总览 API（WMS-STOCK-OVERVIEW-001，仓库-admin 行56）。
 *
 * 后端：org.dromara.djs.warehouse.stock.controller.StockOverviewController
 *       /djs/warehouse/stockOverview
 * compute-on-read 回放 t_warehouse_stock_flow（Kevin 拍板）：
 *   list 每日库存系统汇总 + detail 当日按产品/库位的库存情况（期初/入/出/损耗/饲喂/期末）。
 */

/** 每日库存总览汇总行 */
export interface StockOverviewDailyVO {
  /** 统计日期 yyyy-MM-dd */
  statDate: string;
  /** 当日库存非 0 的产品/商品 distinct 数 */
  productCount: number;
}

/** 当日库存明细行（按 产品 × 库位） */
export interface StockOverviewDetailVO {
  /** 产品 id（string 防精度丢失） */
  productId: string;
  /** 产品图片 ossId（COALESCE(product_thumb, image_oss_id)，可空） */
  imageOssId?: string;
  /** 产品编码 */
  productCode?: string;
  /** 产品名称 */
  productName?: string;
  /** 规格（product_info.product_spec，如 500g/包，可空） */
  productSpec?: string;
  /** 单位 */
  productUnit?: string;
  /** 库位 id（string 防精度丢失） */
  locationId?: string;
  /** 库位名称 */
  locationName?: string;
  /** 期初库存 */
  beginStock?: number | string;
  /** 入库量 */
  inboundQty?: number | string;
  /** 出库量（不含 ship_out；生产产品不入库 → ship_out 流水整体不参与回放） */
  outboundQty?: number | string;
  /** 损耗量（信息列，期末不二次扣） */
  lossQty?: number | string;
  /** 饲料饲喂量（仅果蔬原材料有值） */
  feedQty?: number | string;
  /** 期末库存（= 期初 + 入库 − 出库） */
  endStock?: number | string;
}

/** 列表查询参数 */
export interface StockOverviewQuery {
  /** 起始日期 yyyy-MM-dd */
  dateFrom?: string;
  /** 截止日期 yyyy-MM-dd */
  dateTo?: string;
}

/** 详情查询参数 */
export interface StockOverviewDetailQuery {
  /** 统计自然日 yyyy-MM-dd（必传） */
  date: string;
  /** 产品名称模糊 */
  productName?: string;
  /** 库位 id 精确 */
  locationId?: number | string;
}

/** 每日库存系统汇总列表（按日期倒序，不分页） */
export const listStockOverview = (query: StockOverviewQuery): AxiosPromise<StockOverviewDailyVO[]> => {
  return request({
    url: '/djs/warehouse/stockOverview/list',
    method: 'get',
    params: query
  });
};

/** 某日库存明细（详情弹窗） */
export const getStockOverviewDetail = (query: StockOverviewDetailQuery): AxiosPromise<StockOverviewDetailVO[]> => {
  return request({
    url: '/djs/warehouse/stockOverview/detail',
    method: 'get',
    params: query
  });
};

// ==================== 库存月汇总（row190，compute-on-read 同构日汇总）====================

/** 每月库存汇总行 */
export interface StockOverviewMonthlyVO {
  /** 统计月份 yyyy-MM */
  statMonth: string;
  /** 当月涉及的产品 distinct 数 */
  productCount: number;
}

/** 月汇总列表查询（月首日 yyyy-MM-dd） */
export interface StockMonthlyQuery {
  monthFrom?: string;
  monthTo?: string;
}

/** 月汇总明细查询 */
export interface StockMonthlyDetailQuery {
  /** 统计月首日 yyyy-MM-dd（必传） */
  monthStart: string;
  productName?: string;
  locationId?: number | string;
}

/** 每月库存汇总列表（按月份倒序，不分页） */
export const listStockMonthly = (query: StockMonthlyQuery): AxiosPromise<StockOverviewMonthlyVO[]> => {
  return request({
    url: '/djs/warehouse/stockOverview/monthly',
    method: 'get',
    params: query
  });
};

/** 某月库存明细（详情弹窗，列与日汇总一致） */
export const getStockMonthlyDetail = (query: StockMonthlyDetailQuery): AxiosPromise<StockOverviewDetailVO[]> => {
  return request({
    url: '/djs/warehouse/stockOverview/monthly/detail',
    method: 'get',
    params: query
  });
};
