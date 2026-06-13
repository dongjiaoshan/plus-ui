import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { TraceablePigVO, StoreTraceOnsiteForm } from './trace/types';
import type { TraceCodeDetailVO, TraceCodeQuery, TraceCodeVO } from '@/api/warehouse/trace/types';

/**
 * 门店追溯码（猪肉现场生码 + 已生码管理）API（STORE-TRACE-ONSITE-001，ADR-0015，admin only）。
 *
 * 后端：org.dromara.djs.store.trace.controller.StoreTraceController  /djs/store/trace
 *   - GET  /pig/list     可追溯猪只 picker（已出栏育肥猪）
 *   - POST /gen          现场按需生码（猪只 + 部位 + 重量 → produce_code）
 *   - GET  /code/list    已生成猪肉追溯码列表（恒 codeType=pork，只读）
 *   - GET  /code/{id}    已生成猪肉追溯码详情（主表 + 事件链）
 *   - POST /code/batch   补打取数（按 ID 批量拉详情）
 * 权限串 djs:store:trace:{gen,print}。果蔬追溯码列表复用 warehouse /djs/warehouse/trace/list。
 */

/** 可追溯猪只 picker 分页列表。 */
export const listTraceablePig = (query?: Record<string, unknown>): AxiosPromise<TraceablePigVO[]> =>
  request({ url: '/djs/store/trace/pig/list', method: 'get', params: query });

/** 现场生码（返回 produce_code 供打印）。 */
export const genStoreTraceCode = (data: StoreTraceOnsiteForm) =>
  request<string>({ url: '/djs/store/trace/gen', method: 'post', data });

/** 已生成猪肉追溯码分页列表（恒 codeType=pork，只读，对齐果蔬追溯码管理）。 */
export const listStorePorkTrace = (query: TraceCodeQuery): AxiosPromise<TraceCodeVO[]> =>
  request({ url: '/djs/store/trace/code/list', method: 'get', params: query });

/** 已生成猪肉追溯码详情（主表 + 关联 + 完整事件时间轴，只读）。 */
export const getStorePorkTraceDetail = (id: string): AxiosPromise<TraceCodeDetailVO> =>
  request({ url: '/djs/store/trace/code/' + id, method: 'get' });

/** 补打取数：按勾选 ID 批量拉详情（含事件链），供前端复用打印逻辑批量补打。 */
export const batchStorePorkTraceDetail = (ids: string[]): AxiosPromise<TraceCodeDetailVO[]> =>
  request({ url: '/djs/store/trace/code/batch', method: 'post', data: ids });
