/**
 * 门店退回管理 admin API（STR-RETURN-001，admin only 无 mp）。
 *
 * 后端：org.dromara.djs.store.returns.controller.StoreReturnController  /djs/store/return
 * 权限串 djs:store:return:{list,query,add,edit,remove,export}。
 * 范围（决策 a）：三方向退回登记 + 会员/追溯码字段，不做库存联动 / 不做状态机。
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  StoreReturnBatchForm,
  StoreReturnConfirmForm,
  StoreReturnForm,
  StoreReturnPorkCandidateVO,
  StoreReturnVegCandidateVO,
  StoreReturnQuery,
  StoreReturnVO
} from './return/types';

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

/** 退回操作批量录入（原型「退回操作」，建 pending 待仓库确认，不入库） */
export const batchCreateStoreReturn = (data: StoreReturnBatchForm) => {
  return request<number>({
    url: '/djs/store/return/operation/batch',
    method: 'post',
    data
  });
};

/** 退回操作「猪肉产品」tab 固定候选（belong_type IN pork/white_bar，固定展示与门店无关） */
export const listPorkReturnCandidates = (): AxiosPromise<StoreReturnPorkCandidateVO[]> => {
  return request({
    url: '/djs/store/return/operation/pork-candidates',
    method: 'get'
  });
};

/** 退回操作「果蔬产品」tab 候选（= 该门店当天已确认到店的果蔬需求产品，按 product_id 去重） */
export const listVegReturnCandidates = (storeId: string): AxiosPromise<StoreReturnVegCandidateVO[]> => {
  return request({
    url: '/djs/store/return/operation/veg-candidates',
    method: 'get',
    params: { storeId }
  });
};

/** 仓库确认实收（原型「退回记录」仓库确认入库，pending→received 联动外购入库） */
export const confirmStoreReturn = (data: StoreReturnConfirmForm) => {
  return request({
    url: '/djs/store/return/confirm',
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
