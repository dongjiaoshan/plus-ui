import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  StoreMemberConsumptionForm,
  StoreMemberConsumptionVO,
  StoreMemberForm,
  StoreMemberQuery,
  StoreMemberStatsVO,
  StoreMemberVO
} from './member/types';

/**
 * 门店会员档案 + 手录消费 API（STR-MEMBER-001）。
 *
 * 后端：org.dromara.djs.store.member.controller.StoreMemberController  /djs/store/member
 * 权限串 djs:store:member:{list,query,add,edit,remove,export} + consume:{list,add}。
 * V1 会员只做「档案 + 手录消费」，不做 RFM / A-B-C 分类 / 营销分析（迁 V2）。
 */

/** 会员档案分页（按手机号 / 姓名 / 等级 / 门店筛选）。 */
export const listStoreMember = (query: StoreMemberQuery): AxiosPromise<StoreMemberVO[]> =>
  request({ url: '/djs/store/member/list', method: 'get', params: query });

/** 会员详情。 */
export const getStoreMember = (id: string): AxiosPromise<StoreMemberVO> => request({ url: '/djs/store/member/' + id, method: 'get' });

/** 新增会员（生成 member_no + 手机号查重）。返回新会员 ID（string）。 */
export const addStoreMember = (data: StoreMemberForm): AxiosPromise<string> => request({ url: '/djs/store/member', method: 'post', data });

/** 编辑会员。 */
export const updateStoreMember = (data: StoreMemberForm) => request({ url: '/djs/store/member', method: 'put', data });

/** 软删会员（可批量）。 */
export const delStoreMember = (ids: string | string[]) => request({ url: '/djs/store/member/' + ids, method: 'delete' });

/** 简单统计：本月会员数 + 本月录入消费记录数。 */
export const getStoreMemberStats = (): AxiosPromise<StoreMemberStatsVO> => request({ url: '/djs/store/member/stats', method: 'get' });

/** 某会员的手录消费记录列表（按 memberId 过滤）。 */
export const listStoreMemberConsume = (memberId: string): AxiosPromise<StoreMemberConsumptionVO[]> =>
  request({ url: '/djs/store/member/consume/list', method: 'get', params: { memberId } });

/** 手录一条消费记录（create_by 自动 fill，不强校验金额）。返回新记录 ID（string）。 */
export const addStoreMemberConsume = (data: StoreMemberConsumptionForm): AxiosPromise<string> =>
  request({ url: '/djs/store/member/consume', method: 'post', data });
