import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 需求单打印 API（V7-R8，仓库 › 需求管理 › 需求单打印）。
 *
 * 后端：org.dromara.djs.warehouse.demand.controller.DemandPrintController  /djs/warehouse/demand/print
 * 权限：djs:warehouse:demand:print（需求管理菜单通配 djs:warehouse:demand:* 覆盖）。
 */

/** 订货单列表查询。 */
export interface DemandPrintQuery extends PageQuery {
  /** 需求日期起（yyyy-MM-dd，含） */
  beginDate?: string;
  /** 需求日期止（yyyy-MM-dd，含） */
  endDate?: string;
  /** 需求门店多选（snowflake 字符串） */
  storeIds?: string[];
}

/** 订货单列表行：一行 = 一个（需求日期 × 门店）。 */
export interface DemandPrintSheetVO {
  demandDate: string;
  storeId: string;
  storeName?: string;
  /** 需求品类数（该门店该日有效需求的去重产品数） */
  categoryCount: number;
}

/** 订货单明细行（同产品多条需求已合并）。 */
export interface DemandPrintItemVO {
  productId: string;
  productName: string;
  productSpec?: string;
  demandQuantity: number | string;
  productUnit?: string;
  /** 产品类别 djs_belong_type（白条单位显「头」、数量保留原始小数） */
  belongType?: string;
  /** 需求备注（多条去重以「；」拼接） */
  demandRemark?: string;
}

/** 订货单打印明细。 */
export interface DemandPrintDetailVO {
  demandDate: string;
  storeId: string;
  storeName?: string;
  categoryCount: number;
  items: DemandPrintItemVO[];
}

/** 订货单列表（分页）。 */
export const listDemandPrintSheet = (query: DemandPrintQuery): AxiosPromise<DemandPrintSheetVO[]> =>
  request({ url: '/djs/warehouse/demand/print/list', method: 'get', params: query });

/** 某门店某日订货单打印明细。 */
export const getDemandPrintDetail = (demandDate: string, storeId: string): AxiosPromise<DemandPrintDetailVO> =>
  request({ url: '/djs/warehouse/demand/print/detail', method: 'get', params: { demandDate, storeId } });
