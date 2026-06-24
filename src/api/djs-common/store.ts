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

// ====================== STORE-PERM-001 门店数据权限 ======================

/** 我有权限的门店（精简下拉项） */
export interface StoreOptionVO {
  id: number | string;
  storeName: string;
}

/** 门店-人员关联出参（已绑人员） */
export interface StoreUserVO {
  userId: number | string;
  userName?: string;
  nickName?: string;
  phonenumber?: string;
}

/** 当前登录人有权限的门店列表（驱动全局门店选择器；超管/租管返全部） */
export const listMyStores = (): AxiosPromise<StoreOptionVO[]> => {
  return request({
    url: '/djs/common/store/my-stores',
    method: 'get'
  });
};

/** 查询某门店已绑定的人员 */
export const listStoreUsers = (storeId: number | string): AxiosPromise<StoreUserVO[]> => {
  return request({
    url: `/djs/common/store/${storeId}/users`,
    method: 'get'
  });
};

/** 全量覆盖某门店的绑定人员（body = 人员 id 数组，对齐后端 @RequestBody List<Long>） */
export const bindStoreUsers = (storeId: number | string, userIds: (number | string)[]) => {
  return request({
    url: `/djs/common/store/${storeId}/users`,
    method: 'put',
    data: userIds
  });
};

/** 解除某门店与某人员的绑定 */
export const unbindStoreUser = (storeId: number | string, userId: number | string) => {
  return request({
    url: `/djs/common/store/${storeId}/users/${userId}`,
    method: 'delete'
  });
};
