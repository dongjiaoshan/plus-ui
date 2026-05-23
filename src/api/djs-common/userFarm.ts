import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 用户可访问的农场（V1 multi-farm disabled 时永远返单元素列表）。
 *
 * 后端：org.dromara.djs.common.controller.UserFarmController#listAccessible
 */
export interface FarmVO {
  /** 农场 ID（VARCHAR，跟 djs 业务表 tenant_id / farm_id 一致） */
  id: string;
  /** 农场名称 */
  name: string;
  /** 是否为当前激活农场 */
  current?: boolean;
}

/**
 * 查询当前用户可访问的农场列表（小程序登录后 + admin 头部农场切换器使用）。
 * V1：始终返单元素列表 [{ id: '1001', name: '东角山主农场', current: true }]
 */
export const listAccessibleFarms = (): AxiosPromise<FarmVO[]> => {
  return request({
    url: '/djs/user/farm/accessible',
    method: 'get'
  });
};

/**
 * 切换当前农场。
 * V1：无效操作，后端直接返 ok。
 * V2：UPDATE sys_user.current_farm_id 并刷 Sa-Token session extra "farmId"，前端切完后建议
 *     window.location.reload() 强制刷新整个 SPA。
 */
export const switchFarm = (farmId: string): AxiosPromise<void> => {
  return request({
    url: '/djs/user/farm/switch',
    method: 'post',
    params: { farmId }
  });
};
