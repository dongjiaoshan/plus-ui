import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 作物关联产品配置 API（V6 row16「产品配置」页签）。
 *
 * 后端：org.dromara.djs.plant.crop.controller.CropProductController  /djs/plant/cropProduct
 * 权限沿用作物主数据 djs:plant:crop:list / djs:plant:crop:edit（产品配置不是独立菜单）。
 */

export interface CropProductVO {
  id: string;
  cropId: string;
  productId: string;
  /** 产品名称（后端 JOIN 反查） */
  productName?: string;
  /** 产品单位（展示用） */
  productUnit?: string;
  /** 作物绩效（元/公斤） */
  perfPrice?: number | string;
}

export interface CropProductForm {
  id?: string;
  cropId?: string;
  productId?: string;
  perfPrice?: number;
}

export const listCropProduct = (cropId: number | string): AxiosPromise<CropProductVO[]> => {
  return request({
    url: '/djs/plant/cropProduct/list',
    method: 'get',
    params: { cropId }
  });
};

export const addCropProduct = (data: CropProductForm) => {
  return request({
    url: '/djs/plant/cropProduct',
    method: 'post',
    data
  });
};

export const updateCropProduct = (data: CropProductForm) => {
  return request({
    url: '/djs/plant/cropProduct',
    method: 'put',
    data
  });
};

export const delCropProduct = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/plant/cropProduct/' + path,
    method: 'delete'
  });
};
