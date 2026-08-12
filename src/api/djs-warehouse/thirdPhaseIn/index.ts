import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { ThirdPhaseInForm, ThirdPhaseInQuery, ThirdPhaseInVO, ThirdPhaseSummaryVO } from './types';

/**
 * 三期作物入库 API（V6 row88，仓库-库存管理「三期作物入库管理」）。
 *
 * 后端：org.dromara.djs.warehouse.thirdphase.controller.ThirdPhaseInController  /djs/warehouse/thirdPhaseIn
 */

/** 三期作物入库分页列表（按入库时间倒序） */
export const listThirdPhaseIn = (query: ThirdPhaseInQuery): AxiosPromise<ThirdPhaseInVO[]> => {
  return request({
    url: '/djs/warehouse/thirdPhaseIn/list',
    method: 'get',
    params: query
  });
};

/**
 * 三期合计（总入库 / 总出库，kg）。
 *
 * 甲方 row92「通过三期标识可以统计三期的总入库和总出库」：按流水行的 third_phase 标记聚合，全量口径、不带筛选。
 */
export const getThirdPhaseSummary = (): AxiosPromise<ThirdPhaseSummaryVO> => {
  return request({
    url: '/djs/warehouse/thirdPhaseIn/summary',
    method: 'get'
  });
};

/** 新增三期作物入库（产品入库 + 入库记录 + 打三期标识由后端一次事务完成） */
export const addThirdPhaseIn = (data: ThirdPhaseInForm) => {
  return request({
    url: '/djs/warehouse/thirdPhaseIn',
    method: 'post',
    data
  });
};

/**
 * 导出 URL（POST，form-urlencoded）。
 * 页面用全局 `proxy.download(THIRD_PHASE_IN_EXPORT_URL, filter, fileName)` 触发，与仓库域其他列表页一致。
 */
export const THIRD_PHASE_IN_EXPORT_URL = 'djs/warehouse/thirdPhaseIn/export';
