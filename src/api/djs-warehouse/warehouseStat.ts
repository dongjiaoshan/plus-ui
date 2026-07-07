import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 仓库统计报表 API（WMS-STAT-001，邓博 admin 行16/17/18：仓库日报表 / 作物日报表 / 仓库月报表）。
 *
 * 后端：org.dromara.djs.warehouse.stat.controller.WarehouseStatController
 *       GET /djs/warehouse/stat/{daily,crop,monthly}（只读，权限 djs:warehouse:stat:list）
 * 数据由 WarehouseStatJob 每晚跑批落盘 T-1（compute-once-write），前端客户端分页。
 */

/** 仓库日报表行（row16，~24 指标） */
export interface WarehouseDailyVO {
  statDate: string;
  slaughterCount?: number;
  slaughterWeight?: number | string;
  avgSlaughterWeight?: number | string;
  arriveWeight?: number | string;
  slaughterRate?: number | string;
  barTotalWeight?: number | string;
  avgBarWeight?: number | string;
  barYieldRate?: number | string;
  cutBarCount?: number;
  precoolLoss?: number | string;
  cutProductWeight?: number | string;
  cutBarWeight?: number | string;
  cutRate?: number | string;
  cutLoss?: number | string;
  vegWeighWeight?: number | string;
  vegLoss?: number | string;
  vegLossRate?: number | string;
  sendPlatformWeight?: number | string;
  receivePlatformWeight?: number | string;
  transportLossRate?: number | string;
  prodPickWeight?: number | string;
  prodLossWeight?: number | string;
  netVegLossRate?: number | string;
}

/** 作物日报表行（row17，按作物） */
export interface WarehouseCropVO {
  statDate: string;
  cropId?: string;
  cropCode?: string;
  cropName?: string;
  imageOssId?: string;
  pickWeight?: number | string;
  feedWeight?: number | string;
  vegHandleRate?: number | string;
  receiveWeight?: number | string;
  sendPlatformWeight?: number | string;
  transportLossRate?: number | string;
  outWeight?: number | string;
  netVegLossRate?: number | string;
}

/** 仓库月报表行（row18） */
export interface WarehouseMonthlyVO {
  statMonth: string;
  slaughterCount?: number;
  slaughterRate?: number | string;
  barYieldRate?: number | string;
  cutYieldRate?: number | string;
}

/** 仓库日报表（按日期范围，全量返回客户端分页） */
export const listWarehouseDaily = (params?: { dateFrom?: string; dateTo?: string }): AxiosPromise<WarehouseDailyVO[]> =>
  request({ url: '/djs/warehouse/stat/daily', method: 'get', params });

/** 作物日报表 */
export const listWarehouseCrop = (params?: { dateFrom?: string; dateTo?: string }): AxiosPromise<WarehouseCropVO[]> =>
  request({ url: '/djs/warehouse/stat/crop', method: 'get', params });

/** 仓库月报表（按月份范围 yyyy-MM） */
export const listWarehouseMonthly = (params?: { monthFrom?: string; monthTo?: string }): AxiosPromise<WarehouseMonthlyVO[]> =>
  request({ url: '/djs/warehouse/stat/monthly', method: 'get', params });
