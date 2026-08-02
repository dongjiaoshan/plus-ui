import type { AxiosPromise } from 'axios';
import request from '@/utils/request';
import type { VegOutSubmitForm } from '@/api/djs-warehouse/stock/types';
import type { VegOutBatchVO, VegOutCandidateVO, VegOutDetailVO, VegOutQuery } from './types';

/** row187 新增抽屉左侧可选产品：毛菜鲜品库里库存 > 0 的果蔬行 */
export const listVegOutCandidates = (productName?: string): AxiosPromise<VegOutCandidateVO[]> =>
  request({ url: '/djs/warehouse/veg-out/candidates', method: 'get', params: { productName } });

/** row187 批量出库（多产品一单，生成出库单号进列表） */
export const submitVegOutBatch = (data: VegOutSubmitForm): AxiosPromise<string> =>
  request({ url: '/djs/warehouse/veg-out/batch', method: 'post', data });

/** row185 单条内部处理（从库存查询行发起，去向限果蔬月台/饲料饲喂，不进出库单列表） */
export const submitInternalHandle = (data: VegOutSubmitForm) =>
  request({ url: '/djs/warehouse/veg-out/internal-handle', method: 'post', data });

/** row187 出库单列表 */
export const listVegOutBatch = (query: VegOutQuery): AxiosPromise<any> =>
  request({ url: '/djs/warehouse/veg-out/list', method: 'get', params: query });

/** row187 出库单明细 */
export const getVegOutDetail = (batchNo: string, productName?: string): AxiosPromise<VegOutDetailVO[]> =>
  request({ url: '/djs/warehouse/veg-out/detail', method: 'get', params: { batchNo, productName } });
