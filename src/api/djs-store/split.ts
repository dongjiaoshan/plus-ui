import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { StoreSplitForm, StoreSplitQuery, StoreSplitVO } from './split/types';

/**
 * 门店白条分割 API（STR-SPLIT-001，admin only 无 mp）。
 *
 * 后端：org.dromara.djs.store.split.controller.StoreSplitController  /djs/store/split
 * 复用 warehouse 域 t_warehouse_product_inhouse 表，固定 source='store' 隔离仓库分割行。
 * 权限串 djs:store:split:{list,query,add,export}。
 */

/** 门店分割记录分页列表（固定 source='store'）。 */
export const listSplit = (query: StoreSplitQuery): AxiosPromise<StoreSplitVO[]> =>
  request({ url: '/djs/store/split/list', method: 'get', params: query });

/** 门店再分录入（选部位 + 录重量 + 库位 + 可选源白条 → INSERT source='store'，返回 inhouse id）。 */
export const addSplit = (data: StoreSplitForm): AxiosPromise<string> => request({ url: '/djs/store/split', method: 'post', data });
