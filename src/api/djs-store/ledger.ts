import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  StoreLedgerBatchForm,
  StoreLedgerCandidateVO,
  StoreLedgerHeaderVO,
  StoreLedgerLineVO,
  StoreLedgerQuery
} from './ledger/types';

/**
 * 门店经营流水盘点台账 API（STORE-LEDGER-001，原型「门店管理>门店盘点」重建，admin only）。
 *
 * 后端：org.dromara.djs.store.ledger.controller.StoreDailyLedgerController  /djs/store/ledger
 * 权限串复用门店盘点 djs:store:check:{list,query,add}。
 */

/** 盘点单列表（按 门店 + 盘点日期 分组，分页）。 */
export const listStoreLedger = (query: StoreLedgerQuery): AxiosPromise<StoreLedgerHeaderVO[]> =>
  request({ url: '/djs/store/ledger/list', method: 'get', params: query });

/** 新增当日盘点候选（门店关联产品全 SKU + 预填 saleQty/returnQty）。 */
export const listStoreLedgerCandidates = (storeId: string, ledgerDate?: string): AxiosPromise<StoreLedgerCandidateVO[]> =>
  request({ url: '/djs/store/ledger/candidates', method: 'get', params: { storeId, ledgerDate } });

/** 当日盘点整表批量提交。 */
export const batchSaveStoreLedger = (data: StoreLedgerBatchForm): AxiosPromise<number> =>
  request({ url: '/djs/store/ledger/batch', method: 'post', data });

/** 盘点详情（按 storeId + ledgerDate 取一组明细行）。 */
export const getStoreLedgerDetail = (storeId: string, ledgerDate: string): AxiosPromise<StoreLedgerLineVO[]> =>
  request({ url: '/djs/store/ledger/detail', method: 'get', params: { storeId, ledgerDate } });

/** 产品盘点历史（按 productId + 日期范围，给产品详情用）。 */
export const listStoreLedgerHistory = (query: StoreLedgerQuery): AxiosPromise<StoreLedgerLineVO[]> =>
  request({ url: '/djs/store/ledger/history', method: 'get', params: query });
