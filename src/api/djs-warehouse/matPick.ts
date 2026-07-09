import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 生产物资领用 API（WMS-MATPICK-ADMIN-001，admin 镜像小程序物资领用 行55）。
 *
 * 后端：org.dromara.djs.warehouse.flow.controller.WarehouseMatIssueController  /djs/warehouse/matPick
 *
 * 与 mp 共用同一套 IMatFlowService + t_warehouse_stock_flow / t_warehouse_location_stock，数据互通。
 * admin 列表行粒度 + 今日四量按全部人（不按 operator 过滤）；操作人 = 当前登录 admin。
 */

/** 行粒度待领产品行（VO = MatIssueItemVo） */
export interface MatPickItemVO {
  /** 领用篮子 ID（= location_stock.id，snowflake string；领用/退回/损耗提交时回传作 batchId，走精确篮扣减防串扣） */
  batchId?: string;
  /** 产品主键（snowflake，string 防截断） */
  productId: string;
  /** 产品业务码 */
  productCode: string;
  /** 产品名称 */
  productName: string;
  /** 单位 */
  productUnit: string;
  /** 缩略图 url（resolver 回填） */
  productThumb?: string;
  /** 归属类型 djs_belong_type */
  belongType?: string;
  /** 当前库存（BigDecimal→string） */
  currentStock: string;
  /** 默认库位 ID（= 该行库位，snowflake string） */
  defaultLocationId?: string;
  /** 库位名称 */
  locationName?: string;
  /** 耳号（猪肉分割原料行非空） */
  earNo?: string;
  /** 白条号（猪肉分割原料行非空） */
  whiteBarNo?: string;
  /** 地块 ID（自产果蔬行非空，snowflake string） */
  plotId?: string;
  /** 地块编号 */
  plotCode?: string;
  /** 今日已领（全部人） */
  todayPicked?: string;
  /** 今日退回（全部人） */
  todayReturned?: string;
  /** 今日损耗（全部人） */
  todayFeed?: string;
  /** 今日损耗（全部人） */
  todayLoss?: string;
}

/**
 * 猪肉篮明细（VO = MatIssueBasketVo，row24 弹框选源）。
 *
 * admin 猪肉列表收敛为一产品一行后，篮级信息（耳号 / 白条号 / 库位 / 各篮余量）下沉到弹框：
 * 用户手选一篮 + 填数量 → 用该篮 batchId 走既有 pickByBatch 精确扣减（防串扣）。
 */
export interface MatBasketVO {
  /** 篮子 ID（= location_stock.id，snowflake string；提交回传作 batchId 走精确篮扣减） */
  batchId: string;
  /** 业务码（篮次标题）：耳号，无耳号回退白条号 / 库位标识 */
  batchCode: string;
  /** 产品 ID（snowflake string） */
  productId: string;
  /** 产品名称 */
  productName: string;
  /** 单位 */
  productUnit: string;
  /** 该篮当前余量（BigDecimal→string） */
  currentStock: string;
  /** 该篮今日已领（全部人，BigDecimal→string） */
  todayPicked?: string;
  /** 该篮今日退回（全部人，BigDecimal→string） */
  todayReturned?: string;
  /** 该篮今日损耗（全部人，BigDecimal→string） */
  todayLoss?: string;
  /** 该篮所属库位 ID（snowflake string；提交回传作 locationId） */
  locationId?: string;
}

/** 领用出库入参 */
export interface MatPickBody {
  productId?: string;
  plotId?: string;
  batchId?: string;
  locationId?: string;
  quantity: number | string;
  stockOutDest: string;
  proofOssIds?: string;
  remark?: string;
  sourceScene?: string;
}

/** 退回入库入参 */
export interface MatReturnBody {
  productId: string;
  batchId?: string;
  locationId?: string;
  quantity: number | string;
  proofOssIds?: string;
  remark?: string;
  sourceScene?: string;
}

/** 损耗入参 */
export interface MatLossBody {
  productId: string;
  batchId?: string;
  locationId: string;
  quantity: number | string;
  proofOssIds?: string;
  remark?: string;
}

/** 饲料饲喂入参（果蔬专属） */
export interface MatFeedBody {
  productId: string;
  locationId: string;
  quantity: number | string;
  proofOssIds?: string;
  remark?: string;
}

/**
 * 列表（按业态 tab + 关键字过滤；今日四量按全部人）。
 *
 * 猪肉 tab 一产品一行（后端 selectAdminMatPorkProducts 聚合，篮明细进弹框选源）；
 * 其余业态维持行粒度。
 */
export const listMatPick = (params: { belongType: string; keyword?: string }): AxiosPromise<MatPickItemVO[]> => {
  return request({
    url: '/djs/warehouse/matPick/list',
    method: 'get',
    params
  });
};

/**
 * 猪肉产品行的篮明细（row24 弹框选源）。
 *
 * 含 ear_no IS NULL 的白条整只篮（放宽约束，保 admin 现在能领的 null-ear 篮）。
 */
export const listPorkBaskets = (params: { productId: string; keyword?: string }): AxiosPromise<MatBasketVO[]> => {
  return request({
    url: '/djs/warehouse/matPick/porkBaskets',
    method: 'get',
    params
  });
};

/** 领用出库 */
export const pickMat = (data: MatPickBody): AxiosPromise<number> => {
  return request({
    url: '/djs/warehouse/matPick/pick',
    method: 'post',
    data
  });
};

/** 退回入库 */
export const returnMat = (data: MatReturnBody): AxiosPromise<number> => {
  return request({
    url: '/djs/warehouse/matPick/return',
    method: 'post',
    data
  });
};

/** 当日损耗 */
export const lossMat = (data: MatLossBody): AxiosPromise<number> => {
  return request({
    url: '/djs/warehouse/matPick/loss',
    method: 'post',
    data
  });
};

/** 饲料饲喂（果蔬专属） */
export const feedMat = (data: MatFeedBody): AxiosPromise<number> => {
  return request({
    url: '/djs/warehouse/matPick/feed',
    method: 'post',
    data
  });
};
