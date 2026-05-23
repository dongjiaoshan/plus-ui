import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PersonForm, PersonQuery, PersonVO } from './person/types';

/**
 * 人员主数据 API（SYS-MD-001）。
 *
 * 后端：org.dromara.djs.common.person.controller.PersonController
 * 路径前缀：/djs/common/person
 */

/** 查询人员列表（分页） */
export const listPerson = (query: PersonQuery): AxiosPromise<PersonVO[]> => {
  return request({
    url: '/djs/common/person/list',
    method: 'get',
    params: query
  });
};

/** 查询人员详情 */
export const getPerson = (id: number | string): AxiosPromise<PersonVO> => {
  return request({
    url: '/djs/common/person/getInfo/' + id,
    method: 'get'
  });
};

/** 新增人员（personCode 由后端生成） */
export const addPerson = (data: PersonForm) => {
  return request({
    url: '/djs/common/person/add',
    method: 'post',
    data
  });
};

/** 修改人员 */
export const updatePerson = (data: PersonForm) => {
  return request({
    url: '/djs/common/person/edit',
    method: 'put',
    data
  });
};

/** 删除人员（支持批量，逗号拼接） */
export const delPerson = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/common/person/remove/' + path,
    method: 'delete'
  });
};

/** 导出人员（POST 表单，下载流由后端处理） */
export const exportPerson = (query: PersonQuery) => {
  return request({
    url: '/djs/common/person/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  });
};
