import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { StoreTraceOnsiteForm, TraceablePigVO } from './types';

/**
 * 门店追溯码（猪肉现场生码）API（STORE-TRACE-ONSITE-001，ADR-0015）。
 *
 * 后端：org.dromara.djs.store.trace.controller.StoreTraceController  /djs/store/trace
 * 卡片式现场生码：选已出栏猪只 → 选零售部位 → 录重量 → 生码打印。
 * 权限串 djs:store:trace:{gen,print}（picker/生码走 gen，打印按钮门控走 print）。
 */

/** 可追溯猪只 picker 分页列表（已出栏育肥猪：耳号 / 性别 / 品种 / 日龄）。 */
export const listTraceablePig = (query: { pageNum: number; pageSize: number }): AxiosPromise<TraceablePigVO[]> =>
  request({ url: '/djs/store/trace/pig/list', method: 'get', params: query });

/** 现场按需生码（猪只 + 部位 + 重量 → 生成 pork 追溯码，返回 produce_code 供前端打印）。 */
export const genStoreTraceCode = (data: StoreTraceOnsiteForm): AxiosPromise<string> =>
  request({ url: '/djs/store/trace/gen', method: 'post', data });
