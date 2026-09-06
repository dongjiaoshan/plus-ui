import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 出入库统计 API（V6-R167 入库统计 / 出库统计两个 Tab）。
 *
 * 后端：org.dromara.djs.warehouse.flow.controller.InoutStatController
 *       /djs/warehouse/inoutStat
 * compute-on-read：按日期区间实时 GROUP BY t_warehouse_stock_flow，无汇总表、无跑批
 * （与兄弟页「出入库月汇总」同一套聚合口径，只把「先选月份再下钻」换成「日期区间 + Tab」）。
 * 日期区间放开后行数可能上万，两个列表都走后端分页（返 TableDataInfo）。
 */

/** 查询参数（入库统计 / 出库统计共用；日期两端可空 = 不限） */
export interface InoutStatQuery extends PageQuery {
  /** 起始日期 yyyy-MM-dd（含） */
  dateFrom?: string;
  /** 截止日期 yyyy-MM-dd（含） */
  dateTo?: string;
  /** 产品名称模糊 */
  productName?: string;
  /** 产品类型多选（djs_product_type） */
  productTypes?: number[];
  /** 入库方式多选（djs_flow_type，仅入库统计） */
  flowTypes?: string[];
  /** 供应商 ID 精确（仅入库统计；雪花 > 2^53 全链路 string；与 noSupplier 互斥） */
  supplierId?: string;
  /** 只看「无供应商」那一桶（仅入库统计；与 supplierName 互斥） */
  noSupplier?: boolean;
  /** 出库去向多选（djs_stock_out_dest，仅出库统计） */
  stockOutDests?: string[];
}

/** 入库统计行（产品 × 入库方式 × 供应商；字典 label 与空值兜底都在后端完成） */
export interface InoutStatInVO {
  productName?: string;
  productTypeName?: string;
  productSpec?: string;
  inModeName?: string;
  inboundQty?: number | string;
  productUnit?: string;
  /** 供应商（空供应商那一桶后端回填「无供应商」） */
  supplierName?: string;
}

/** 出库统计行（产品 × 出库去向） */
export interface InoutStatOutVO {
  productName?: string;
  productTypeName?: string;
  productSpec?: string;
  /** 出库去向（空 / 字典未命中后端回填「未指定」） */
  outDestName?: string;
  outboundQty?: number | string;
  productUnit?: string;
}

/** 入库统计分页 */
export const listInStat = (params: InoutStatQuery): AxiosPromise<InoutStatInVO[]> => {
  return request({
    url: '/djs/warehouse/inoutStat/in/list',
    method: 'get',
    params
  });
};

/** 出库统计分页 */
export const listOutStat = (params: InoutStatQuery): AxiosPromise<InoutStatOutVO[]> => {
  return request({
    url: '/djs/warehouse/inoutStat/out/list',
    method: 'get',
    params
  });
};
