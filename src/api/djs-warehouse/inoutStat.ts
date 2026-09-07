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
 *
 * 行内「查看详情」（V6-R186）另有四个端点：入 / 出各「明细分页 + 明细导出」。
 * 明细与汇总在后端共用同一份 FROM / WHERE，只多叠一段分组键等值，
 * 所以明细逐条加起来必然等于被点击那一行的量。
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

/** 入库统计行（产品编码 × 产品 × 入库方式 × 供应商；字典 label 与空值兜底都在后端完成） */
export interface InoutStatInVO {
  /** 产品编码（product_info.product_id 业务码，列表第一列，也是聚合的身份键） */
  productCode?: string;
  productName?: string;
  productTypeName?: string;
  productSpec?: string;
  inModeName?: string;
  inboundQty?: number | string;
  productUnit?: string;
  /** 供应商（空供应商那一桶后端回填「无供应商」，是展示值不是分组键） */
  supplierName?: string;
  /** 入库方式原始值（展示走 inModeName；「查看详情」下钻要拿它当分组键） */
  flowType?: string;
  /** 供应商分组键原始值（空供应商那一桶是空串；下钻必须传它，不能传 supplierName） */
  supplierKey?: string;
}

/** 出库统计行（产品编码 × 产品 × 出库去向） */
export interface InoutStatOutVO {
  /** 产品编码（product_info.product_id 业务码，列表第一列，也是聚合的身份键） */
  productCode?: string;
  productName?: string;
  productTypeName?: string;
  productSpec?: string;
  /** 出库去向（空 / 字典未命中后端回填「未指定」，是展示值不是分组键） */
  outDestName?: string;
  outboundQty?: number | string;
  productUnit?: string;
  /** 出库去向原始值（「未指定」那一桶是空串）；「查看详情」下钻要拿它当分组键 */
  stockOutDest?: string;
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

/**
 * 「查看详情」查询参数（V6-R186 入库明细 / 出库明细共用）。
 *
 * 继承列表的筛选条件：点开详情时把列表当前的筛选原样带上，明细才必然是那一行的真子集。
 * 分组键（productCode / flowType / supplierName / outDest）把明细钉到被点击的那一行；
 * dateFrom / dateTo 复用列表的字段——弹窗里的日期筛选就是把汇总区间再收窄一次。
 */
export interface InoutStatDetailQuery extends InoutStatQuery {
  /** 产品编码（必填，租户内唯一，等价于钉住一个产品档案） */
  productCode: string;
  /** 入库方式（仅入库明细；分组键，不传等于把该产品所有入库方式混在一起） */
  flowType?: string;
  /** 供应商名称（仅入库明细）：「无供应商」那一桶传 undefined 或空串都行 */
  supplierName?: string;
  /** 出库去向原始值（仅出库明细）：「未指定」那一桶传 undefined 或空串都行 */
  outDest?: string;
  /** 记录人（stock_flow.operator_id，与「入库记录」页的操作人同一口径） */
  operatorId?: string | number;
}

/**
 * 明细的「分组键 + 筛选」（不含分页）。
 *
 * 弹窗把它存成状态、拼参数时再补 pageNum / pageSize —— 直接用 InoutStatDetailQuery
 * 会因为继承链上的 PageQuery 把分页字段变成必填，状态里根本没有分页可填。
 */
export type InoutStatDetailFilter = Omit<InoutStatDetailQuery, 'pageNum' | 'pageSize'>;

/** 入库明细行（甲方 row186 第 2 点的 8 列） */
export interface InoutStatInDetailVO {
  /** 入库日期（业务日期 yyyy-MM-dd） */
  flowDate?: string;
  productCode?: string;
  productName?: string;
  productSpec?: string;
  /** 入库量带单位展示串（后端单通道派生，页面与 xlsx 读同一个字段） */
  inQtyLabel?: string;
  supplierName?: string;
  operatorName?: string;
  /** 入库操作时间（落库时间 yyyy-MM-dd HH:mm:ss，不是业务日期） */
  createTime?: string;
}

/** 出库明细行（甲方 row186 第 3 点的 8 列） */
export interface InoutStatOutDetailVO {
  flowDate?: string;
  productCode?: string;
  productName?: string;
  productSpec?: string;
  /** 出库量带单位展示串 */
  outQtyLabel?: string;
  outDestName?: string;
  operatorName?: string;
  createTime?: string;
}

/** 入库明细分页（R186 入库统计行「查看详情」） */
export const listInStatDetail = (params: InoutStatDetailQuery): AxiosPromise<InoutStatInDetailVO[]> => {
  return request({
    url: '/djs/warehouse/inoutStat/in/detail/list',
    method: 'get',
    params
  });
};

/** 出库明细分页（R186 出库统计行「查看详情」） */
export const listOutStatDetail = (params: InoutStatDetailQuery): AxiosPromise<InoutStatOutDetailVO[]> => {
  return request({
    url: '/djs/warehouse/inoutStat/out/detail/list',
    method: 'get',
    params
  });
};
