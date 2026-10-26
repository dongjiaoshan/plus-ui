import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 猪肉日分割出库统计 API（V7-R6，挂【库存管理】）。
 *
 * 后端：org.dromara.djs.warehouse.cutout.controller.CutOutDailyController
 *       /djs/warehouse/cutOutDaily
 * compute-on-read：按天实时聚合「白条分割出库管理」的仓库出库流水（按出库去向）
 * 与门店需求产出记录（白条分割出库选门店需求 + 白条发门店，按门店），无汇总表、无跑批。
 * 「查看」明细与汇总在后端共用同一份 WHERE，逐条加起来等于该行出库总重量。
 */

/** 出库去向下拉里「门店需求」的约定值（不在字典 djs_stock_out_dest 里；与后端 CutOutDailyQuery.OUT_DEST_STORE_DEMAND 一致） */
export const OUT_DEST_STORE_DEMAND = 'store_demand';

/** 列表行类别：warehouse 仓库出库 / store 门店需求 */
export type CutOutDestType = 'warehouse' | 'store';

/** 列表查询参数（统计日期两端可空 = 不限；默认当天由页面给） */
export interface CutOutDailyQuery extends PageQuery {
  /** 统计日期起 yyyy-MM-dd（含） */
  beginDate?: string;
  /** 统计日期止 yyyy-MM-dd（含） */
  endDate?: string;
  /** 出库去向：djs_stock_out_dest 字典值，或 OUT_DEST_STORE_DEMAND */
  outDest?: string;
  /** 出库门店 ID（雪花 > 2^53 全链路 string）；只作用于门店需求 */
  storeId?: string;
}

/** 列表行（一天 × 一个去向；出库去向 label 后端已翻好） */
export interface CutOutDailyVO {
  /** 统计日期 yyyy-MM-dd */
  statDate: string;
  destType: CutOutDestType;
  /** 出库去向原始值（仓库出库 = 字典值，「未指定」那一桶是空串；门店需求 = store_demand），下钻传它 */
  outDest: string;
  /** 出库去向展示值（字典 label / 门店需求 / 未指定） */
  outDestLabel?: string;
  /** 门店 ID（仅门店需求行） */
  storeId?: string;
  /** 门店名称（仅门店需求行） */
  storeName?: string;
  /** 出库总重量 kg */
  totalWeight?: number | string;
}

/** 「查看」明细参数：钉到列表某一行 */
export interface CutOutDailyDetailQuery {
  statDate: string;
  destType: CutOutDestType;
  /** 仓库出库行的出库去向原始值 */
  outDest?: string;
  /** 门店需求行的门店 ID */
  storeId?: string;
}

/** 明细行（甲方原文 6 列） */
export interface CutOutDailyDetailVO {
  productCode?: string;
  productName?: string;
  /** 出库量 kg（3 位小数） */
  quantity?: number | string;
  /** 单位（恒 kg） */
  unit?: string;
  /** 猪只耳号（无耳号后端兜 "-"） */
  earNo?: string;
  /** 出库时间 yyyy-MM-dd HH:mm:ss */
  outTime?: string;
}

/** 列表分页 */
export const listCutOutDaily = (params: CutOutDailyQuery): AxiosPromise<CutOutDailyVO[]> => {
  return request({
    url: '/djs/warehouse/cutOutDaily/list',
    method: 'get',
    params
  });
};

/** 「查看」明细（不分页） */
export const getCutOutDailyDetail = (params: CutOutDailyDetailQuery): AxiosPromise<CutOutDailyDetailVO[]> => {
  return request({
    url: '/djs/warehouse/cutOutDaily/detail',
    method: 'get',
    params
  });
};

/** 明细导出地址（走 proxy.download，与明细同源同参） */
export const CUT_OUT_DAILY_DETAIL_EXPORT_URL = '/djs/warehouse/cutOutDaily/detail/export';
