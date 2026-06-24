import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 饲料饲喂明细查询 API（库存查询详情「饲料饲喂记录」tab，行57）。
 *
 * 后端：org.dromara.djs.warehouse.veg.controller.FeedLogQueryController  /djs/warehouse/feedLog
 * 仅当库存行产品是【果蔬且原材料】时前端才显示该 tab 并调本接口。
 */

/** 饲喂明细行（库存详情饲料 tab） */
export interface FeedLogVO {
  id: number | string;
  /** 饲喂时间 yyyy-MM-dd HH:mm:ss */
  feedDate?: string;
  productId?: number | string;
  locationId?: number | string;
  /** 饲喂位置名称 */
  locationName?: string;
  feedWeight?: number | string;
  operatorId?: number | string;
  /** ruoyi Translation user_id_to_nickname 回填 */
  operatorName?: string;
  remark?: string;
}

/** 按产品取饲喂明细 */
export const feedLogByProduct = (params: { productId: number | string; dateFrom?: string; dateTo?: string }): AxiosPromise<FeedLogVO[]> => {
  return request({
    url: '/djs/warehouse/feedLog/byProduct',
    method: 'get',
    params
  });
};
