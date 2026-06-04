/**
 * 门店退回管理 admin API（STR-RETURN-001，admin only 无 mp）。
 *
 * 后端：org.dromara.djs.store.returns.controller.StoreReturnController  /djs/store/return
 * 权限串 djs:store:return:{list,query,add,edit,remove,export}。
 * 范围（决策 a）：三方向退回登记 + 会员/追溯码字段，不做库存联动 / 不做状态机。
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { StoreReturnForm, StoreReturnQuery, StoreReturnVO } from './return/types';

/** 列表（分页） */
export const listStoreReturn = (query?: StoreReturnQuery): AxiosPromise<StoreReturnVO[]> => {
  return request({
    url: '/djs/store/return/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getStoreReturn = (id: string) => {
  return request<StoreReturnVO>({
    url: `/djs/store/return/${id}`,
    method: 'get'
  });
};

/** 新增（returnNo 服务端生成） */
export const addStoreReturn = (data: StoreReturnForm) => {
  return request<string>({
    url: '/djs/store/return',
    method: 'post',
    data
  });
};

/** 编辑（不允许改 returnNo） */
export const updateStoreReturn = (data: StoreReturnForm) => {
  return request({
    url: '/djs/store/return',
    method: 'put',
    data
  });
};

/** 软删 */
export const delStoreReturn = (ids: string | string[]) => {
  return request({
    url: `/djs/store/return/${Array.isArray(ids) ? ids.join(',') : ids}`,
    method: 'delete'
  });
};

/** 导出 */
export const exportStoreReturn = (query?: StoreReturnQuery) => {
  return request({
    url: '/djs/store/return/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};
