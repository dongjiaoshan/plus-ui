import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  AssignPigForm,
  AuditHistoryEntryVO,
  DemandGroupVO,
  DemandManageForm,
  DemandManageQuery,
  DemandManageVO,
  DemandPigVO,
  DemandProductType,
  DemandProductStoreDetailVO,
  DemandSummaryVO,
  DemandTodayKpiVO,
  PigAvailableVO
} from './demand/types';

/**
 * 需求管理 API（WMS-DEMAND-001）。
 *
 * 后端：org.dromara.djs.warehouse.demand.controller.DemandManageController  /djs/warehouse/demand
 */

/** 分页查询（明细：每条需求单一行）。 */
export const listDemand = (query: DemandManageQuery): AxiosPromise<DemandManageVO[]> =>
  request({ url: '/djs/warehouse/demand/list', method: 'get', params: query });

/**
 * 需求汇总分组列表（0613-10）：按「需求日期 + 需求产品」聚合，同日同产品 N 门店合并一行。
 *
 * 后端 GET /djs/warehouse/demand/group-list（仅按 productName / beginDate / endDate 过滤）。
 */
export const listDemandGroup = (query: DemandManageQuery): AxiosPromise<DemandGroupVO[]> =>
  request({ url: '/djs/warehouse/demand/group-list', method: 'get', params: query });

/** 详情。 */
export const getDemand = (id: string | number): AxiosPromise<DemandManageVO> =>
  request({ url: '/djs/warehouse/demand/getInfo/' + id, method: 'get' });

/** 新增草稿。 */
export const addDemand = (data: DemandManageForm) => request({ url: '/djs/warehouse/demand/add', method: 'post', data });

/** 修改。 */
export const updateDemand = (data: DemandManageForm) => request({ url: '/djs/warehouse/demand/edit', method: 'put', data });

/** 批量删除。 */
export const delDemand = (ids: string | number | (string | number)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({ url: '/djs/warehouse/demand/' + path, method: 'delete' });
};

/** 删除路径修正：后端 @DeleteMapping("/remove/{ids}") */
export const removeDemand = (ids: string | number | (string | number)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({ url: '/djs/warehouse/demand/remove/' + path, method: 'delete' });
};

// =========== 状态机操作 ===========

export const submitDemand = (id: string | number, remark?: string) =>
  request({ url: `/djs/warehouse/demand/${id}/submit`, method: 'post', params: { remark } });

export const confirmDemand = (id: string | number, remark?: string) =>
  request({ url: `/djs/warehouse/demand/${id}/confirm`, method: 'post', params: { remark } });

export const cancelDemand = (id: string | number, remark?: string) =>
  request({ url: `/djs/warehouse/demand/${id}/cancel`, method: 'post', params: { remark } });

// =========== 指定猪只（白条业态）===========

export const assignPigs = (id: string | number, data: AssignPigForm) => request({ url: `/djs/warehouse/demand/${id}/pigs`, method: 'post', data });

export const removeAssignedPig = (id: string | number, earNo: string) =>
  request({ url: `/djs/warehouse/demand/${id}/pigs/${encodeURIComponent(earNo)}`, method: 'delete' });

export const listAssignedPigs = (id: string | number): AxiosPromise<DemandPigVO[]> =>
  request({ url: `/djs/warehouse/demand/${id}/pigs`, method: 'get' });

/** 「可出栏」育肥猪分页（DJS-FIX-ADMIN-W22-001）。 */
export const listAvailablePigs = (params: { pageNum?: number; pageSize?: number }): AxiosPromise<PigAvailableVO[]> =>
  request({ url: '/djs/warehouse/demand/pigs/available', method: 'get', params });

// =========== 状态历史 ===========

export const getDemandHistory = (id: string | number): AxiosPromise<AuditHistoryEntryVO[]> =>
  request({ url: `/djs/warehouse/demand/${id}/history`, method: 'get' });

// =========== 产品需求详情（按产品聚合各门店需求）===========

/** 某产品下各门店需求明细（门店名 / 需求量 / 需求单数）。 */
export const getProductStoreDetail = (productId: string | number): AxiosPromise<DemandProductStoreDetailVO[]> =>
  request({ url: '/djs/warehouse/demand/product-store-detail', method: 'get', params: { productId } });

// =========== 业态摘要（DJS-FIX-ADMIN-W22-003）===========

/** 业态 SummaryBar 摘要（4 业态 union DTO；按 productType 填字段）。 */
export const getDemandSummary = (productType: DemandProductType): AxiosPromise<DemandSummaryVO> =>
  request({ url: '/djs/warehouse/demand/summary', method: 'get', params: { productType } });

// =========== 今日 KPI 横条（DJS-FIX-ADMIN-W22-007）===========

/** 需求管理页顶部「今日全局」KPI 横条（一次返 6 数；渲染在 SummaryBar 上方）。 */
export const getDemandTodayKpi = (): AxiosPromise<DemandTodayKpiVO> => request({ url: '/djs/warehouse/demand/kpi/today', method: 'get' });
