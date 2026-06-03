import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { OssNotifyBO, OssStsCredentialVO } from './oss/types';

/**
 * 申请 OSS 上传凭证（admin 直传用，SYS-INFRA-002）。
 *
 * 后端：GET /djs/oss/sts/credential?bizType=<bizType>
 *   权限：djs:common:oss:sts
 */
export const getOssStsCredential = (bizType: string): AxiosPromise<OssStsCredentialVO> => {
  return request({
    url: '/djs/oss/sts/credential',
    method: 'get',
    params: { bizType }
  });
};

/**
 * 上传成功回写 sys_oss 表（前端 PUT 成功后调）。
 *
 * 后端：POST /djs/oss/sts/notify
 *   权限：djs:common:oss:sts
 *
 * @returns 返回新 ossId（雪花 string，业务字段保存此值；后端 R<Long> 经全局 Jackson 序列化为 string）
 */
export const notifyOssUploaded = (body: OssNotifyBO): AxiosPromise<string> => {
  return request({
    url: '/djs/oss/sts/notify',
    method: 'post',
    data: body
  });
};
