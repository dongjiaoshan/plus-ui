import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { ProductFlowRecordVO, ProductInboundForm, ProductInfoForm, ProductInfoQuery, ProductInfoVO, ProductionRecordVO } from './product/types';

/**
 * 产品 / 商品 API（WMS-MD-002）。
 *
 * 后端：org.dromara.djs.warehouse.product.controller.ProductInfoController  /djs/warehouse/product
 */

/**
 * 分页查询产品列表。
 *
 * productTypes 数组（产品配置入口 {1}=自产含礼盒 / 商品配置 {2}=外购）以 CSV 传给后端（Spring 自动绑定 List<Integer>）。
 */
export const listProduct = (query: ProductInfoQuery): AxiosPromise<ProductInfoVO[]> => {
  const { productTypes, ...rest } = query;
  const params: Record<string, any> = { ...rest };
  if (productTypes && productTypes.length > 0) {
    params.productTypes = productTypes.join(',');
  }
  return request({
    url: '/djs/warehouse/product/list',
    method: 'get',
    params
  });
};

/** 查询产品详情 */
export const getProduct = (id: number | string): AxiosPromise<ProductInfoVO> => {
  return request({
    url: '/djs/warehouse/product/getInfo/' + id,
    method: 'get'
  });
};

/** 新增产品（productId 用户手填业务码） */
export const addProduct = (data: ProductInfoForm) => {
  return request({
    url: '/djs/warehouse/product/add',
    method: 'post',
    data
  });
};

/** 修改产品（productId / productType 后端强制锁回旧值，前端 disabled） */
export const updateProduct = (data: ProductInfoForm) => {
  return request({
    url: '/djs/warehouse/product/edit',
    method: 'put',
    data
  });
};

/** 删除产品（批量；若仍有库存 / 被原材料引用，后端抛业务异常） */
export const delProduct = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/warehouse/product/remove/' + path,
    method: 'delete'
  });
};

/** 行内切换产品状态（productStatus：sys_normal_disable 0=正常 / 1=停用；仅改单字段，复用 product:edit 权限） */
export const changeProductStatus = (id: number | string, productStatus: number) => {
  return request({
    url: '/djs/warehouse/product/changeStatus',
    method: 'put',
    data: { id, productStatus }
  });
};

/** 产品详情「生产记录」子表：按 productId 查生产 + 退货记录（可选 produceDate / produceType 筛选） */
export const listProductionRecords = (
  productId: number | string,
  params?: { produceDate?: string; produceType?: string }
): AxiosPromise<ProductionRecordVO[]> => {
  return request({
    url: '/djs/warehouse/product/production/' + productId,
    method: 'get',
    params
  });
};

/** 商品详情「业务流水」子表：按 productId 查 stock_flow（入库 / 领用出库 / 后台出库；可选 bizDate 区间筛选） */
export const listProductFlowRecords = (
  productId: number | string,
  params?: { bizDateFrom?: string; bizDateTo?: string }
): AxiosPromise<ProductFlowRecordVO[]> => {
  return request({
    url: '/djs/warehouse/product/flow/' + productId,
    method: 'get',
    params
  });
};

/** 产品入库：录入 产品 / 库位 / 数量 → 写入库流水 + 增库存（复用 product:edit 权限） */
export const inboundProduct = (data: ProductInboundForm): AxiosPromise<number> => {
  return request({
    url: '/djs/warehouse/product/inbound',
    method: 'post',
    data
  });
};
