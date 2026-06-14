import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PublicTraceVo } from './types';

/**
 * 公开追溯 H5 API（C 端顾客扫码落地页消费）。
 *
 * 后端：org.dromara.djs.warehouse.trace.pub.controller.TracePublicController  /djs/public/trace
 *   - GET /{traceCode}   @SaIgnore 无登录（顾客扫码访问），按 produce_code 一次性聚合全链路。
 *     码不存在返 code=200 + data=null（友好响应，前端空判提示）。
 *
 * 无需 token：request 拦截器仅在有 token 时注入 Authorization（公开页无 token 不阻断）。
 * traceCode = produce_code 业务码 string（禁 Number()，原样传值防截断）。
 */
export const getPublicTrace = (traceCode: string): AxiosPromise<PublicTraceVo> => request({ url: `/djs/public/trace/${traceCode}`, method: 'get' });
