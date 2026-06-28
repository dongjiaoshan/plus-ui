import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 有机饲喂记录 API（WMS-FEED-RECORD-001，仓库-admin 行21「有机饲喂记录」只读菜单）。
 *
 * 后端：org.dromara.djs.warehouse.veg.controller.FeedRecordController
 *       /djs/warehouse/feedRecord/list
 * over t_warehouse_feed_log 分页列表，覆盖毛菜处理间（veg_handle）+ 仓库领用（warehouse）两类来源。
 */

/** 有机饲喂记录行 */
export interface FeedRecordVO {
  /** 饲喂时间（精确到时分秒，yyyy-MM-dd HH:mm:ss） */
  feedDate: string;
  /** 作物 ID（仓库来源行为空） */
  cropId?: number | string;
  /** 作物名称（仓库来源行为空） */
  cropName?: string;
  /** 作物图 ossId（仓库来源行为空，前端走 oss listByIds 转 url） */
  cropImageOssId?: string;
  /** 饲喂饲料量(kg) */
  feedWeight?: number | string;
  /** 饲喂来源 djs_feed_type 原始值（veg_handle / warehouse） */
  feedType?: string;
  /** 饲喂位置 ID */
  locationId?: number | string;
  /** 饲喂位置名称 */
  locationName?: string;
  /** 操作人 user_id */
  operatorId?: number | string;
  /** 操作人姓名（后端翻译 sys_user.nick_name） */
  operatorName?: string;
}

/** 列表查询参数 */
export interface FeedRecordQuery {
  /** 作物名称模糊 */
  cropName?: string;
  /** 提供位置 djs_feed_type（veg_handle / warehouse） */
  feedType?: string;
  /** 起始日期 yyyy-MM-dd */
  dateFrom?: string;
  /** 截止日期 yyyy-MM-dd */
  dateTo?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 有机饲喂记录分页列表（按饲喂时间倒序） */
export const listFeedRecord = (query: FeedRecordQuery): AxiosPromise<FeedRecordVO[]> => {
  return request({
    url: '/djs/warehouse/feedRecord/list',
    method: 'get',
    params: query
  });
};
