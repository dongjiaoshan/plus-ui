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
  /** 产品名称（row54；取 feed_log.product_id → product_name。仓库来源行与 cropName 同名，那类流水没有作物维度） */
  productName?: string;
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

/** 有机饲喂**按日汇总**行（一天一条；admin 行199 主列表 / mp 行268 卡片共用后端） */
export interface FeedDailyVO {
  /** 饲喂日期（yyyy-MM-dd，仅日期） */
  feedDate: string;
  /** 当日总重量(kg)，三位小数 */
  totalWeight?: number | string;
  /** 当日明细条数 */
  detailCount?: number;
  /** 仓库确认框数（整数；列是 DECIMAL 会序列化成 "5.00"，展示层取整。未确认为 null → 展示 '—'） */
  boxCount?: number | string | null;
  /** 仓库确认人 user_id */
  confirmUserId?: number | string;
  /** 仓库确认人姓名（后端翻译 sys_user.nick_name） */
  confirmUserName?: string;
  /** 仓库确认（处理）日期 yyyy-MM-dd（未确认为 null；mp 卡片用，admin 列表暂不展示） */
  confirmTime?: string | null;
}

/** 日汇总查询参数（只吃日期范围；作物名/提供位置是明细维度不参与汇总筛选） */
export interface FeedDailyQuery {
  dateFrom?: string;
  dateTo?: string;
  pageNum?: number;
  pageSize?: number;
}

/** 有机饲喂按日汇总分页（按日期倒序） */
export const listFeedDaily = (query: FeedDailyQuery): AxiosPromise<FeedDailyVO[]> => {
  return request({
    url: '/djs/warehouse/feedRecord/daily',
    method: 'get',
    params: query
  });
};
