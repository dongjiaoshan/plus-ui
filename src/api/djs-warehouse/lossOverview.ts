import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 损耗总览 API（WMS-LOSS-OVERVIEW-001，仓库-admin 行63）。
 *
 * 后端：org.dromara.djs.warehouse.loss.controller.LossOverviewController
 *       /djs/warehouse/lossOverview
 * compute-on-read over t_warehouse_loss_flow：list 每日汇总 + detail 当日明细。
 */

/** 每日损耗汇总行 */
export interface LossOverviewDailyVO {
  /** 损耗日期 yyyy-MM-dd */
  lossDate: string;
  /** 当日损耗记录条数（与详情弹框行数一致） */
  productCount: number;
}

/** 当日损耗明细行 */
export interface LossOverviewDetailVO {
  /** 损耗记录 id（string 防精度丢失） */
  id: string;
  /** 记录时间 */
  lossDate: string;
  /** 产品图片 ossId（COALESCE(product_thumb, image_oss_id)，可空） */
  imageOssId?: string;
  /** 产品编码 */
  productCode?: string;
  /** 产品名称 */
  productName?: string;
  /** 单位 */
  productUnit?: string;
  /** 损耗类型 djs_loss_type */
  lossType?: string;
  /** 损耗量 */
  lossWeight?: number | string;
}

/** 列表查询参数 */
export interface LossOverviewQuery {
  /** 起始日期 yyyy-MM-dd */
  dateFrom?: string;
  /** 截止日期 yyyy-MM-dd */
  dateTo?: string;
}

/** 详情查询参数 */
export interface LossDetailQuery {
  /** 统计自然日 yyyy-MM-dd（必传） */
  date: string;
  /** 产品名称模糊 */
  productName?: string;
  /** 损耗类型 djs_loss_type */
  lossType?: string;
}

/** 每日损耗汇总列表（按日期倒序，不分页） */
export const listLossOverview = (query: LossOverviewQuery): AxiosPromise<LossOverviewDailyVO[]> => {
  return request({
    url: '/djs/warehouse/lossOverview/list',
    method: 'get',
    params: query
  });
};

/** 某日损耗明细（详情弹窗） */
export const getLossDetail = (query: LossDetailQuery): AxiosPromise<LossOverviewDetailVO[]> => {
  return request({
    url: '/djs/warehouse/lossOverview/detail',
    method: 'get',
    params: query
  });
};
