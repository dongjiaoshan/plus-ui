import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { ProductInfoForm, ProductInfoQuery, ProductInfoVO } from './product/types';

/**
 * 产品 / 商品 / 礼盒 API（WMS-MD-002）。
 *
 * 后端：org.dromara.djs.warehouse.product.controller.ProductInfoController  /djs/warehouse/product
 */

/** 分页查询产品列表（不带礼盒组件清单） */
export const listProduct = (query: ProductInfoQuery): AxiosPromise<ProductInfoVO[]> => {
  return request({
    url: '/djs/warehouse/product/list',
    method: 'get',
    params: query
  });
};

/** 查询产品详情（productType=3 礼盒时附带 giftComponents） */
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
