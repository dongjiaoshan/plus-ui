import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  DefaultImageForm,
  DefaultImageVO,
  ImageBatchImportResult,
  ImageBatchItem,
  ImageLibraryForm,
  ImageLibraryQuery,
  ImageLibraryVO,
  RematchResult
} from './image/types';

/**
 * 公共图片库 + 分类默认图 API（IMG-LIB-001）。
 *
 * 后端：org.dromara.djs.common.image.controller.*
 * 路径前缀：/djs/common/image · /djs/common/defaultImage
 */

/** 图库列表（分页） */
export const listImage = (query: ImageLibraryQuery): AxiosPromise<ImageLibraryVO[]> => {
  return request({
    url: '/djs/common/image/list',
    method: 'get',
    params: query
  });
};

/** 图库详情 */
export const getImage = (id: number | string): AxiosPromise<ImageLibraryVO> => {
  return request({
    url: '/djs/common/image/getInfo/' + id,
    method: 'get'
  });
};

/** 新增图库 */
export const addImage = (data: ImageLibraryForm) => {
  return request({
    url: '/djs/common/image/add',
    method: 'post',
    data
  });
};

/** 修改图库 */
export const updateImage = (data: ImageLibraryForm) => {
  return request({
    url: '/djs/common/image/edit',
    method: 'put',
    data
  });
};

/** 删除图库（支持批量，逗号拼接） */
export const delImage = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/common/image/remove/' + path,
    method: 'delete'
  });
};

/** 批量重新匹配（对 image_source=0 的作物 / 商品按 name 重跑匹配，返回各域更新条数） */
export const rematchImage = (): AxiosPromise<RematchResult> => {
  return request({
    url: '/djs/common/image/rematch',
    method: 'post'
  });
};

/**
 * 批量上传 + 按文件名自动归档：每张图先走 OSS STS 直传拿 ossId，
 * 文件名去扩展名当 imageName，整批 POST；后端按 image_name upsert 后自动触发重新匹配。
 */
export const batchImportImage = (items: ImageBatchItem[]): AxiosPromise<ImageBatchImportResult> => {
  return request({
    url: '/djs/common/image/batchImport',
    method: 'post',
    data: items
  });
};

/** 分类默认图全量（7 行：6 belong_type + global） */
export const listDefaultImage = (): AxiosPromise<DefaultImageVO[]> => {
  return request({
    url: '/djs/common/defaultImage/list',
    method: 'get'
  });
};

/** 配置某分类默认图 ossId */
export const updateDefaultImage = (data: DefaultImageForm) => {
  return request({
    url: '/djs/common/defaultImage/edit',
    method: 'put',
    data
  });
};
