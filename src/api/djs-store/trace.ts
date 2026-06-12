import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { TraceablePigVO, StoreTraceOnsiteForm } from './trace/types';

/**
 * 门店追溯码（猪肉现场生码）API（STORE-TRACE-ONSITE-001，ADR-0015，admin only）。
 *
 * 后端：org.dromara.djs.store.trace.controller.StoreTraceController  /djs/store/trace
 *   - GET  /pig/list  可追溯猪只 picker（已出栏育肥猪）
 *   - POST /gen       现场按需生码（猪只 + 部位 + 重量 → produce_code）
 * 权限串 djs:store:trace:{gen,print}。果蔬追溯码列表复用 warehouse /djs/warehouse/trace/list。
 */

/** 可追溯猪只 picker 分页列表。 */
export const listTraceablePig = (query?: Record<string, unknown>): AxiosPromise<TraceablePigVO[]> =>
  request({ url: '/djs/store/trace/pig/list', method: 'get', params: query });

/** 现场生码（返回 produce_code 供打印）。 */
export const genStoreTraceCode = (data: StoreTraceOnsiteForm) =>
  request<string>({ url: '/djs/store/trace/gen', method: 'post', data });
