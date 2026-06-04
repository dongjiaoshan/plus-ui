import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { StoreProductCandidateVO, StoreProductRelationSyncForm, StoreProductRelationVO } from './types';

/**
 * 门店产品关联 API（STR-OP-001）。
 *
 * 后端：org.dromara.djs.store.operation.controller.StoreProductRelationController  /djs/store/relation
 */

/** el-transfer 右侧：某门店已关联产品。 */
export const listStoreRelation = (storeId: string): AxiosPromise<StoreProductRelationVO[]> =>
  request({ url: '/djs/store/relation/list', method: 'get', params: { storeId } });

/** el-transfer 左侧：全部候选 SKU。 */
export const listStoreRelationCandidates = (): AxiosPromise<StoreProductCandidateVO[]> =>
  request({ url: '/djs/store/relation/candidates', method: 'get' });

/** 保存：按门店全量 diff 同步关联。 */
export const syncStoreRelation = (data: StoreProductRelationSyncForm): AxiosPromise<number> =>
  request({ url: '/djs/store/relation/sync', method: 'put', data });
