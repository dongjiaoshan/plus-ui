import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 出入库月汇总 API（V6-R154 列表 / R155 入库汇总 / R156 出库汇总）。
 *
 * 后端：org.dromara.djs.warehouse.flow.controller.InoutMonthlyController
 *       /djs/warehouse/inoutMonthly
 * compute-on-read：按月实时 GROUP BY t_warehouse_stock_flow，无汇总表、无跑批。
 * 三个端点都不分页（月份行个位数，下钻行数 ≈ 产品数 × 方式数），一次返全量。
 */

/** 月份行（列表只有汇总月份 + 操作两列，故只有一个字段） */
export interface InoutMonthVO {
  /** 汇总月份 yyyy-MM */
  statMonth: string;
}

/** 下钻查询参数（入库汇总 / 出库汇总共用） */
export interface InoutSummaryQuery {
  /** 统计月份 yyyy-MM（必传） */
  statMonth: string;
  /** 产品名称模糊 */
  productName?: string;
  /** 产品类型多选（djs_product_type） */
  productTypes?: number[];
  /** 入库方式多选（djs_flow_type，仅入库汇总） */
  flowTypes?: string[];
  /** 供应商名称模糊（仅入库汇总） */
  supplierName?: string;
  /** 出库去向多选（djs_stock_out_dest，仅出库汇总） */
  stockOutDests?: string[];
}

/** 入库汇总行（产品 × 入库方式 × 供应商；字典 label 与空值兜底都在后端完成） */
export interface InoutSummaryInVO {
  productName?: string;
  productTypeName?: string;
  productSpec?: string;
  inModeName?: string;
  inboundQty?: number | string;
  productUnit?: string;
  /** 供应商（空供应商那一桶后端回填「无供应商」） */
  supplierName?: string;
}

/** 出库汇总行（产品 × 出库去向） */
export interface InoutSummaryOutVO {
  productName?: string;
  productTypeName?: string;
  productSpec?: string;
  /** 出库去向（空 / 字典未命中后端回填「未指定」） */
  outDestName?: string;
  outboundQty?: number | string;
  productUnit?: string;
}

/** 有出入库流水的月份列表（倒序，不分页） */
export const listInoutMonth = (params: { statMonth?: string }): AxiosPromise<InoutMonthVO[]> => {
  return request({
    url: '/djs/warehouse/inoutMonthly/list',
    method: 'get',
    params
  });
};

/** 当月入库汇总（R155 下钻弹窗） */
export const listInSummary = (params: InoutSummaryQuery): AxiosPromise<InoutSummaryInVO[]> => {
  return request({
    url: '/djs/warehouse/inoutMonthly/in/list',
    method: 'get',
    params
  });
};

/** 当月出库汇总（R156 下钻弹窗） */
export const listOutSummary = (params: InoutSummaryQuery): AxiosPromise<InoutSummaryOutVO[]> => {
  return request({
    url: '/djs/warehouse/inoutMonthly/out/list',
    method: 'get',
    params
  });
};
