import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 去皮规格 API（V7-R2 维护 / V7-R4 称重页取用）。
 *
 * 后端：org.dromara.djs.warehouse.tare.controller.TareSpecController
 */

/** 可选位置 = 字典 djs_tare_position 值，与六个称重页一一对应 */
export type TarePosition = 'pig_in' | 'cut_out' | 'veg_out' | 'veg_in' | 'bar_pickup' | 'bar_cut';

export interface TareSpecVO {
  id: string;
  specName: string;
  tareWeight: number;
  /** 1=是 / 0=否 */
  isDefault: number;
  /** 可选位置 CSV */
  positions: string;
  createByName?: string;
  createTime?: string;
  updateTime?: string;
}

export interface TareSpecForm {
  id?: string;
  specName: string;
  tareWeight: number | undefined;
  isDefault: number;
  positions: TarePosition[];
}

export interface TareSpecQuery extends PageQuery {
  specName?: string;
}

export interface TareOption {
  id: string;
  specName: string;
  /** kg */
  tareWeight: number;
  /** 本页实际默认项 */
  selected: boolean;
}

export const listTareSpec = (query: TareSpecQuery): AxiosPromise<TareSpecVO[]> =>
  request({ url: '/djs/warehouse/tareSpec/list', method: 'get', params: query });

export const getTareSpec = (id: string): AxiosPromise<TareSpecVO> => request({ url: `/djs/warehouse/tareSpec/${id}`, method: 'get' });

export const addTareSpec = (data: TareSpecForm) => request({ url: '/djs/warehouse/tareSpec', method: 'post', data });

export const updateTareSpec = (data: TareSpecForm) => request({ url: '/djs/warehouse/tareSpec', method: 'put', data });

export const delTareSpec = (ids: string[]) => request({ url: `/djs/warehouse/tareSpec/${ids.join(',')}`, method: 'delete' });

/** 称重页可选去皮规格（首项为本页实际默认项） */
export const listTareOptions = (position: TarePosition): AxiosPromise<TareOption[]> =>
  request({ url: '/djs/warehouse/tareSpec/options', method: 'get', params: { position } });
