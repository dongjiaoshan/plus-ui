import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type {
  StoreReturnQuery,
  StoreReturnConfirmForm,
  StoreReturnOpsItemVO,
  StoreReturnOwnerOptionVO,
  StoreReturnUnitCandidateVO,
  StoreReturnUnitForm
} from '@/api/djs-store/return/types';
import type { ReturnProductQuery, ReturnStoreDailyVO } from '@/api/djs-warehouse/return/types';

/** 仓库跨店操作使用仓库域入口，不附带门店业务域上下文限制。 */
const base = '/djs/warehouse/storeReturn';
export const listReturnStoreDaily = (params?: ReturnProductQuery): AxiosPromise<ReturnStoreDailyVO[]> =>
  request({ url: `${base}/store-daily`, method: 'get', params });
export const listReturnOpsItems = (params?: StoreReturnQuery): AxiosPromise<StoreReturnOpsItemVO[]> =>
  request({ url: `${base}/operation/items`, method: 'get', params });
export const listReturnOwnerOptions = (): AxiosPromise<StoreReturnOwnerOptionVO[]> =>
  request({ url: `${base}/operation/owner-options`, method: 'get' });
export const listReturnUnitCandidates = (): AxiosPromise<StoreReturnUnitCandidateVO[]> =>
  request({ url: `${base}/operation/unit-candidates`, method: 'get' });
/** 仓库补录按显式退回清单选品，门店端继续使用自己的候选规则。 */
export const listWarehouseSupplementCandidates = (): AxiosPromise<StoreReturnUnitCandidateVO[]> =>
  request({ url: `${base}/operation/supplement-candidates`, method: 'get' });
export const confirmStoreReturn = (data: StoreReturnConfirmForm) => request({ url: `${base}/confirm`, method: 'put', data });
export const createUnitReturn = (data: StoreReturnUnitForm) => request({ url: `${base}/unit`, method: 'post', data });

export interface WarehouseReturnAmounts {
  receivedQty: number;
  discardQty: number;
  locationId?: string;
  warehouseRemark?: string;
}
export const confirmWarehouseReturn = (data: WarehouseReturnAmounts & { id: string }) =>
  request({ url: `${base}/operation/confirm`, method: 'put', data });
export const addWarehouseReturnProducts = (data: { anchorId: string; productIds: string[] }) =>
  request({ url: `${base}/operation/products`, method: 'post', data });
export const listRawReturnCandidates = (): AxiosPromise<StoreReturnUnitCandidateVO[]> =>
  request({ url: `${base}/operation/raw-candidates`, method: 'get' });
export const createWarehouseUnitReturn = (data: {
  returnDate: string;
  returnUnit: string;
  items: Array<WarehouseReturnAmounts & { productId: string }>;
}) => request({ url: `${base}/operation/unit`, method: 'post', data });
