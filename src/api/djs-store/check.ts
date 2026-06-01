import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  StoreCheckCreateForm,
  StoreCheckHeaderVO,
  StoreCheckLineForm,
  StoreCheckLineQuery,
  StoreCheckQuery,
  StoreCheckRecordVO
} from './check/types';

/**
 * 门店盘点 API（STR-STOCK-001，admin only 无 mp）。
 *
 * 后端：org.dromara.djs.store.check.controller.StoreCheckController  /djs/store/check
 * 流程：新建（锁门店）→ 录实盘明细 → 完成（落差异 + 解锁）/ 取消（仅解锁不回写）。
 * 权限串 djs:store:check:{list,query,add,complete,cancel,export}。
 */

/** 盘点单列表（盘点单维度，header 聚合 + 盈亏计）。 */
export const listStoreCheck = (query: StoreCheckQuery): AxiosPromise<StoreCheckHeaderVO[]> =>
  request({ url: '/djs/store/check/list', method: 'get', params: query });

/** 盘点明细 line 列表（按 checkId / storeId 查某盘点单逐项核对明细）。 */
export const listStoreCheckLines = (query: StoreCheckLineQuery): AxiosPromise<StoreCheckRecordVO[]> =>
  request({ url: '/djs/store/check/lines', method: 'get', params: query });

/** 新建盘点单（建 header status='in_progress' → 锁门店；返回 header id）。 */
export const addStoreCheck = (data: StoreCheckCreateForm): AxiosPromise<string> => request({ url: '/djs/store/check', method: 'post', data });

/** 录入 / 修改实盘明细 line（admin 详情页选产品 + 录实盘量）。 */
export const submitStoreCheckLine = (data: StoreCheckLineForm): AxiosPromise<string> =>
  request({ url: '/djs/store/check/line', method: 'post', data });

/** 删除实盘明细 line（仅进行中盘点单可删）。 */
export const removeStoreCheckLine = (id: string) => request({ url: '/djs/store/check/line/' + id, method: 'delete' });

/** 完成盘点（落差异 + 解锁门店）。 */
export const completeStoreCheck = (id: string) => request({ url: '/djs/store/check/complete/' + id, method: 'put' });

/** 取消盘点（解锁门店，不回写库存）。 */
export const cancelStoreCheck = (id: string) => request({ url: '/djs/store/check/cancel/' + id, method: 'put' });
