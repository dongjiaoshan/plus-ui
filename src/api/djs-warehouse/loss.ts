import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 统一损耗流水查询 API（库存查询详情「损耗记录」tab，行57）。
 *
 * 后端：org.dromara.djs.warehouse.loss.controller.LossFlowController  /djs/warehouse/loss
 */

/** 损耗明细行（库存详情损耗 tab） */
export interface LossFlowVO {
  id: number | string;
  /** 损耗时间 yyyy-MM-dd HH:mm:ss */
  lossDate?: string;
  productId?: number | string;
  productCode?: string;
  productName?: string;
  productUnit?: string;
  /** 损耗类型（djs_loss_type） */
  lossType?: string;
  lossWeight?: number | string;
  locationId?: number | string;
  /** 损耗位置名称 */
  locationName?: string;
  operatorId?: number | string;
  /** ruoyi Translation user_id_to_nickname 回填 */
  operatorName?: string;
  remark?: string;
}

/** 按产品取损耗明细 */
export const lossByProduct = (params: { productId: number | string; dateFrom?: string; dateTo?: string }): AxiosPromise<LossFlowVO[]> => {
  return request({
    url: '/djs/warehouse/loss/byProduct',
    method: 'get',
    params
  });
};
