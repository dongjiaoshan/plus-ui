import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { TraceCodeDetailVO, TraceCodeQuery, TraceCodeVO, TraceEventVO } from './types';

/**
 * 追溯码管理 API（TRC-ADMIN-001，admin only 无 mp）。
 *
 * 后端：org.dromara.djs.warehouse.trace.controller.TraceCodeAdminController  /djs/warehouse/trace
 * 纯只读：列表 / 详情 / 事件链 / 导出 / 批量取数（追溯链不可篡改，无任何写端点）。
 * 权限串 djs:warehouse:trace:{list,query,export,print}。
 */

/** 追溯码分页列表（按 codeType=pork/veg/gift 等过滤）。 */
export const listTrace = (query: TraceCodeQuery): AxiosPromise<TraceCodeVO[]> =>
  request({ url: '/djs/warehouse/trace/list', method: 'get', params: query });

/** 追溯码详情（主表 + 关联 + 完整事件时间轴）。 */
export const getTraceDetail = (id: string): AxiosPromise<TraceCodeDetailVO> => request({ url: '/djs/warehouse/trace/' + id, method: 'get' });

/** 按 produceCode 查事件流水（trace_time 升序，供单独刷新时间轴）。 */
export const getTraceEvents = (produceCode: string): AxiosPromise<TraceEventVO[]> =>
  request({ url: '/djs/warehouse/trace/events/' + encodeURIComponent(produceCode), method: 'get' });

/** 批量拉详情（含事件链），供前端 jsPDF 批量打印一次取数。 */
export const batchTraceDetail = (ids: string[]): AxiosPromise<TraceCodeDetailVO[]> =>
  request({ url: '/djs/warehouse/trace/batch', method: 'post', data: ids });
