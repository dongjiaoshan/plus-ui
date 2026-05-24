import type { AxiosPromise } from 'axios';
import request from '@/utils/request';

export interface PigIntroduceVO {
  id: number | string;
  introduceNo: string;
  introduceType: 'external' | 'internal';
  introduceDate: string;
  supplierId?: number | string;
  pigCount: number;
  startEarNo?: string;
  pigBreedCode?: string;
  pigStrainCode?: string;
  pigSex?: 'F' | 'M';
  proofOssIds?: string;
  barnId?: number | string;
  penId?: number | string;
  remark?: string;
  createTime?: string;
}

export interface PigIntroQuery {
  pageNum?: number;
  pageSize?: number;
  introduceNo?: string;
  introduceType?: 'external' | 'internal';
  supplierId?: number | string;
  pigSex?: 'F' | 'M';
  beginDate?: string;
  endDate?: string;
}

/** admin 只读：引种历史分页查询（BRD-EVENT-001） */
export function listPigIntro(query: PigIntroQuery): AxiosPromise<any> {
  return request({
    url: '/djs/breed/event/intro/list',
    method: 'get',
    params: query
  });
}
