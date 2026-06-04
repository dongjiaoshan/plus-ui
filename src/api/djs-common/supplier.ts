import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { SupplierDealVO, SupplierForm, SupplierQuery, SupplierVO } from './supplier/types';

/**
 * 供应商主数据 API（SYS-MD-003）。
 *
 * 后端：org.dromara.djs.common.supplier.controller.SupplierController
 * 路径前缀：/djs/common/supplier
 */

/** 查询供应商列表（分页） */
export const listSupplier = (query: SupplierQuery): AxiosPromise<SupplierVO[]> => {
  return request({
    url: '/djs/common/supplier/list',
    method: 'get',
    params: query
  });
};

/** 查询供应商详情 */
export const getSupplier = (id: number | string): AxiosPromise<SupplierVO> => {
  return request({
    url: '/djs/common/supplier/getInfo/' + id,
    method: 'get'
  });
};

/**
 * 查询供应商交易明细（分页，DJS-FIX-ADMIN-W22-005）。
 *
 * 后端跨模块聚合 breed 药品入库批次 + warehouse 物资入库流水，按交易日期倒序假分页。
 * 返回 TableDataInfo：rows = SupplierDealVO[]，total = 全量条数。
 */
export const listSupplierDeals = (id: number | string, query: { pageNum: number; pageSize: number }): AxiosPromise<SupplierDealVO[]> => {
  return request({
    url: `/djs/common/supplier/${id}/deals`,
    method: 'get',
    params: query
  });
};

/** 新增供应商（supplierCode 由后端生成） */
export const addSupplier = (data: SupplierForm) => {
  return request({
    url: '/djs/common/supplier/add',
    method: 'post',
    data
  });
};

/** 修改供应商 */
export const updateSupplier = (data: SupplierForm) => {
  return request({
    url: '/djs/common/supplier/edit',
    method: 'put',
    data
  });
};

/** 删除供应商（支持批量，逗号拼接） */
export const delSupplier = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/common/supplier/remove/' + path,
    method: 'delete'
  });
};

/** 导出供应商（POST 表单，下载流由后端处理） */
export const exportSupplier = (query: SupplierQuery) => {
  return request({
    url: '/djs/common/supplier/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  });
};
