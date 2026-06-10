import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * sys_user 微信绑定状态。
 *
 * 后端：org.dromara.djs.common.controller.DjsWxBindController
 */
export interface WxBindStatusVO {
  /** 用户 ID（snowflake，Jackson Long→String 序列化，前端为 string） */
  userId: number | string;
  /** 是否已绑定微信 */
  bound: boolean;
  /** 脱敏 openid 尾号（未绑定为 null） */
  openidTail: string | null;
}

/**
 * 批量查询用户微信绑定状态（用户列表渲染「微信」列）。
 */
export const getWxBindStatus = (userIds: Array<number | string>): AxiosPromise<WxBindStatusVO[]> => {
  return request({
    url: '/djs/system/wx-bind/status',
    method: 'post',
    data: userIds
  });
};

/**
 * 解绑指定用户的微信（清空 wx_openid）。换人 / 误绑时用。
 */
export const unbindWx = (userId: number | string): AxiosPromise<void> => {
  return request({
    url: `/djs/system/wx-bind/${userId}`,
    method: 'delete'
  });
};
