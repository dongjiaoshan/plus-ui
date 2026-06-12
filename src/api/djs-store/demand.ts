import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  StoreAssignPigForm,
  StoreDemandBatchForm,
  StoreDemandForm,
  StoreDemandPigVO,
  StoreDemandQuery,
  StoreDemandVO,
  StorePigAvailableVO
} from './demand/types';

/**
 * 门店端需求 API（STR-DEMAND-001）。
 *
 * 后端：org.dromara.djs.store.demand.controller.StoreDemandController  /djs/store/demand
 * 复用 WMS demand 表 + service；门店发起需求创建即 SUBMITTED（跳过 DRAFT）。
 */

/** 分页查询（门店视角：query.storeId 由 UI 门店下拉显式传）。 */
export const listStoreDemand = (query: StoreDemandQuery): AxiosPromise<StoreDemandVO[]> =>
  request({ url: '/djs/store/demand/list', method: 'get', params: query });

/** 详情。 */
export const getStoreDemand = (id: string): AxiosPromise<StoreDemandVO> => request({ url: '/djs/store/demand/getInfo/' + id, method: 'get' });

/** 门店发起需求（创建即 SUBMITTED）。 */
export const addStoreDemand = (data: StoreDemandForm) => request({ url: '/djs/store/demand/add', method: 'post', data });

/** 购物车整单发起需求（原型「新增需求」多产品整页，一次提交多条）。 */
export const batchCreateStoreDemand = (data: StoreDemandBatchForm): AxiosPromise<number> =>
  request({ url: '/djs/store/demand/operation/batch', method: 'post', data });

/** 门店收货确认（CONFIRMED 态，原型列表「确认收货」）。 */
export const receiveStoreDemand = (id: string) => request({ url: `/djs/store/demand/${id}/receive`, method: 'put' });

/** 编辑需求。 */
export const updateStoreDemand = (data: StoreDemandForm) => request({ url: '/djs/store/demand/edit', method: 'put', data });

/** 批量删除（仅 DRAFT/CANCELLED 态可删）。 */
export const removeStoreDemand = (ids: string | string[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({ url: '/djs/store/demand/remove/' + path, method: 'delete' });
};

/** 取消（撤回未确认需求）。 */
export const cancelStoreDemand = (id: string, remark?: string) =>
  request({ url: `/djs/store/demand/${id}/cancel`, method: 'post', params: { remark } });

/** 白条业态：批量指定猪只。 */
export const assignStoreDemandPigs = (id: string, data: StoreAssignPigForm) => request({ url: `/djs/store/demand/${id}/pigs`, method: 'post', data });

/** 白条业态：查询已指定猪只。 */
export const listStoreDemandAssignedPigs = (id: string): AxiosPromise<StoreDemandPigVO[]> =>
  request({ url: `/djs/store/demand/${id}/pigs`, method: 'get' });

/** 白条业态：可出栏育肥猪分页。 */
export const listStoreDemandAvailablePigs = (params: { pageNum?: number; pageSize?: number }): AxiosPromise<StorePigAvailableVO[]> =>
  request({ url: '/djs/store/demand/pigs/available', method: 'get', params });
