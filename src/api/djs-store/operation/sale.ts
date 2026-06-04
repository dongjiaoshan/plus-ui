import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { StoreSaleRecordForm, StoreSaleRecordQuery, StoreSaleRecordVO } from './types';

/**
 * 门店销售流水 API（STR-OP-001）。
 *
 * 后端：org.dromara.djs.store.operation.controller.StoreSaleRecordController  /djs/store/sale
 * V1 不做交易：数据来源仅手录（source='manual'）+ Excel 导入（source='excel_import'）。
 */

/** 分页查询销售流水。 */
export const listStoreSale = (query: StoreSaleRecordQuery): AxiosPromise<StoreSaleRecordVO[]> =>
  request({ url: '/djs/store/sale/list', method: 'get', params: query });

/** 详情。 */
export const getStoreSale = (id: string): AxiosPromise<StoreSaleRecordVO> => request({ url: '/djs/store/sale/getInfo/' + id, method: 'get' });

/** 手录单条销售（source='manual'）。 */
export const addStoreSale = (data: StoreSaleRecordForm) => request({ url: '/djs/store/sale/add', method: 'post', data });

/** 批量软删。 */
export const removeStoreSale = (ids: string | string[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({ url: '/djs/store/sale/remove/' + path, method: 'delete' });
};

/** Excel 导入端点 URL（前端 upload action 用）。 */
export const storeSaleImportUrl = import.meta.env.VITE_APP_BASE_API + '/djs/store/sale/importData';

/** 下载导入模板。 */
export const downloadStoreSaleTemplate = (): AxiosPromise<Blob> =>
  request({ url: '/djs/store/sale/importTemplate', method: 'post', responseType: 'blob' });
