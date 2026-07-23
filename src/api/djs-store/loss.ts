import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { StoreLossQuery, StoreLossRecordVO, WhiteBarSplitLossVO } from './loss/types';

/**
 * 门店损耗记录 API（DENGBO-R30，admin only 无 mp）。
 *
 * 后端：org.dromara.djs.store.loss.controller.StoreLossController  /djs/store/loss
 * 门店维度由请求头 Current-Store-Id 后端行级过滤。权限串 djs:storeLoss:list。
 */

/** 门店损耗记录分页列表（按当前门店过滤）。 */
export const listStoreLoss = (query: StoreLossQuery): AxiosPromise<StoreLossRecordVO[]> =>
  request({ url: '/djs/store/loss/list', method: 'get', params: query });

/**
 * 当日某门店白条分割损耗（门店盘点「当日白条分割损耗」展示，口径同定时任务）。
 * splitLoss = max(0, 白条到店重 + 材料外售同产品到店重 − 白条退回产品入库重)；退回入库重来自门店退货入库流水 t_store_return。
 * arriveWeight=0（无白条到店）时前端不显示该块。
 */
export const getWhiteBarSplitLoss = (storeId: string, date?: string): AxiosPromise<WhiteBarSplitLossVO> =>
  request({ url: '/djs/store/loss/white-bar-split-loss', method: 'get', params: { storeId, date } });
