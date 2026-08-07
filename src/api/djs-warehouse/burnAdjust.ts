import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 燎毛间产品重量调整 API（V6-R43，admin 系统管理 → 数据管理）。
 *
 * 后端：org.dromara.djs.warehouse.burn.controller.BurnInhouseAdjustController
 *       /djs/warehouse/burnAdjust
 *
 * 一行 = 一条燎毛间产品入库产出行（t_warehouse_product_inhouse）。
 * 调整重量会同步改写「白条库存 / 燎毛入库流水 / 燎毛记录合计」，
 * 且只在该猪只燎毛间未点「处理完成」时允许（后端硬校验，前端只控按钮显隐）。
 */

/** 列表行 */
export interface BurnInhouseAdjustVO {
  /** 产品入库行主键（string 防雪花精度丢失） */
  id: string;
  /** 入库时间 yyyy-MM-dd HH:mm:ss */
  inboundTime?: string;
  /** 产品名称 */
  productName?: string;
  /** 产品入库重量 kg */
  productWeight?: number | string;
  /** 计量单位 */
  productUnit?: string;
  /** 猪只耳号（外购白条为空） */
  earNo?: string;
  /** 白条状态码（djs_bar_status，排障用） */
  barStatus?: string;
  /** 猪只燎毛间是否处理完成：1=是（不可调整）/ 0=否 */
  burnFinished?: number;
  /** 入库库位名称 */
  locationName?: string;
  /** 是否调整（djs_yes_no：1=是 / 0=否） */
  isAdjusted?: number;
  /** 入库人 ID */
  operatorId?: string;
  /** 入库人姓名 */
  operatorName?: string;
  /** 调整时间 */
  adjustTime?: string;
  /** 调整人 ID */
  adjustBy?: string;
  /** 调整人姓名 */
  adjustByName?: string;
  /** 猪只接收重量 kg（燎毛间称重录的头皮肉重量；未称重为空） */
  arriveWeight?: number | string;
  /** 该白条已入库产品重量合计 kg（含本行） */
  inboundedWeight?: number | string;
  /** 待入库重量 kg = 接收重量 − 已入库合计（含本行），钳 0；未称重为空 */
  pendingWeight?: number | string;
}

/** 列表查询参数 */
export interface BurnInhouseAdjustQuery {
  /** 入库日期起 yyyy-MM-dd（闭区间） */
  inboundDateFrom?: string;
  /** 入库日期止 yyyy-MM-dd（闭区间） */
  inboundDateTo?: string;
  /** 产品名称（模糊） */
  productName?: string;
  /** 是否调整（1=是 / 0=否；空=不限） */
  isAdjusted?: number;
  pageNum?: number;
  pageSize?: number;
}

/** 调整入参 */
export interface BurnInhouseAdjustForm {
  /** 产品入库行主键 */
  id: string;
  /** 调整后的产品入库重量 kg */
  productWeight: number;
}

/** 分页列表 */
export const listBurnAdjust = (query: BurnInhouseAdjustQuery): AxiosPromise<BurnInhouseAdjustVO[]> => {
  return request({
    url: '/djs/warehouse/burnAdjust/list',
    method: 'get',
    params: query
  });
};

/** 调整产品入库重量 */
export const adjustBurnInhouseWeight = (data: BurnInhouseAdjustForm): AxiosPromise<void> => {
  return request({
    url: '/djs/warehouse/burnAdjust/adjust',
    method: 'post',
    data
  });
};
