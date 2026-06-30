import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { ProductProductionGroupVO, ProductProductionVO, ProductProductionQuery, MarkDamageForm } from './production/types';

/**
 * 发货产品生产记录 API（WMS-PACK-001 admin 只读）。
 *
 * 后端：org.dromara.djs.warehouse.pack.controller.ProductProductionController  /djs/warehouse/production
 *
 * 写入由 mp 端 /applet/warehouse/pack/{veg,gift,dry,celery}；admin 只 list / 详情 / 导出。
 */

/** 产品维度聚合分页查询（主列表概览：生产日期 + 产品分组） */
export const listProduction = (query: ProductProductionQuery): AxiosPromise<ProductProductionGroupVO[]> => {
  return request({
    url: '/djs/warehouse/production/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getProduction = (id: number | string): AxiosPromise<ProductProductionVO> => {
  return request({
    url: '/djs/warehouse/production/' + id,
    method: 'get'
  });
};

/** 产品列表下钻：按"生产日期 + 产品"锁定一个生产批次，分页列出逐件产品 */
export const listProductionItems = (query: ProductProductionQuery): AxiosPromise<ProductProductionVO[]> => {
  return request({
    url: '/djs/warehouse/production/items',
    method: 'get',
    params: query
  });
};

/** 导出 */
export const exportProduction = (query: ProductProductionQuery) => {
  return request({
    url: '/djs/warehouse/production/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 标记/修改产品损坏（契约 b）。
 *
 * 后端：POST /djs/warehouse/production/mark-damage → UPDATE is_damaged=1 + 凭证 + 备注 + damage_time=now。
 * 门店需求页「产品明细」弹框对单件产品标损 / 修改损坏凭证用。
 */
export const markProductionDamage = (data: MarkDamageForm): AxiosPromise<void> => {
  return request({
    url: '/djs/warehouse/production/mark-damage',
    method: 'post',
    data
  });
};
