import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { StoreForm, StoreQuery, StoreVO } from './store/types';

/**
 * 门店主数据 API（SYS-MD-002 + SYS-MD-FIX-002）。
 *
 * 后端：org.dromara.djs.common.store.controller.StoreController
 * 路径前缀：/djs/common/store
 */

/** 查询门店列表（分页） */
export const listStore = (query: StoreQuery): AxiosPromise<StoreVO[]> => {
  return request({
    url: '/djs/common/store/list',
    method: 'get',
    params: query
  });
};

/** 查询门店详情 */
export const getStore = (id: number | string): AxiosPromise<StoreVO> => {
  return request({
    url: '/djs/common/store/getInfo/' + id,
    method: 'get'
  });
};

/** 新增门店（storeCode 由后端生成） */
export const addStore = (data: StoreForm) => {
  return request({
    url: '/djs/common/store/add',
    method: 'post',
    data
  });
};

/** 修改门店（manager_user_id 不通过此端点改） */
export const updateStore = (data: StoreForm) => {
  return request({
    url: '/djs/common/store/edit',
    method: 'put',
    data
  });
};

/** 删除门店（支持批量，逗号拼接） */
export const delStore = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/common/store/remove/' + path,
    method: 'delete'
  });
};

/** 设置店长（SYS-MD-FIX-002）；userId=null/0 表示清空 */
export const setStoreManager = (storeId: number | string, userId: number | null) => {
  return request({
    url: `/djs/common/store/${storeId}/manager`,
    method: 'put',
    params: { userId: userId ?? 0 }
  });
};

/** 导出门店（POST 表单，下载流由后端处理） */
export const exportStore = (query: StoreQuery) => {
  return request({
    url: '/djs/common/store/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  });
};
