import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { TraceCodeConfigImageForm, TraceCodeConfigVO } from './traceCodeConfig/types';

/**
 * 追溯码配置管理 API（V6-R146）。
 *
 * 后端：org.dromara.djs.warehouse.trace.controller.TracePageConfigController
 * 路径前缀：/djs/common/traceCodeConfig
 *
 * 只有 list / 详情 / 换图三个端点 —— 猪肉、果蔬两行是迁移预置的配置项，没有新增与删除。
 */

/** 配置列表（固定两行，无搜索无分页） */
export const listTraceCodeConfig = (): AxiosPromise<TraceCodeConfigVO[]> => {
  return request({
    url: '/djs/common/traceCodeConfig/list',
    method: 'get'
  });
};

/** 单条配置详情（上传弹窗打开时取最新值回填） */
export const getTraceCodeConfig = (id: number | string): AxiosPromise<TraceCodeConfigVO> => {
  return request({
    url: '/djs/common/traceCodeConfig/' + id,
    method: 'get'
  });
};

/** 保存基地介绍页图片（ossId 传空 = 清空，追溯 H5 回落内置版式） */
export const updateTraceCodeConfigImage = (data: TraceCodeConfigImageForm) => {
  return request({
    url: '/djs/common/traceCodeConfig/image',
    method: 'put',
    data
  });
};
