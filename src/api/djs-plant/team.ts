import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  CandidateUserVO,
  PlantWorkPeopleBatchForm,
  PlantWorkPeopleVO,
  PlantWorkTeamForm,
  PlantWorkTeamQuery,
  PlantWorkTeamVO
} from './team/types';

/**
 * 班组 API（PLT-MD-002）。
 *
 * 后端：org.dromara.djs.plant.team.controller.PlantWorkTeamController  /djs/plant/team
 */

// ---------- 班组 CRUD ----------

/** 分页查询班组列表。 */
export const listTeam = (query: PlantWorkTeamQuery): AxiosPromise<PlantWorkTeamVO[]> => {
  return request({
    url: '/djs/plant/team/list',
    method: 'get',
    params: query
  });
};

/** 列表查询（不分页，给下游 PLT-PLAN-001 表单下拉用）。 */
export const listAllTeam = (params?: { teamStatus?: number }): AxiosPromise<PlantWorkTeamVO[]> => {
  return request({
    url: '/djs/plant/team/listAll',
    method: 'get',
    params
  });
};

/** 班组详情。 */
export const getTeam = (id: number | string): AxiosPromise<PlantWorkTeamVO> => {
  return request({
    url: '/djs/plant/team/getInfo/' + id,
    method: 'get'
  });
};

/** 新增班组。 */
export const addTeam = (data: PlantWorkTeamForm) => {
  return request({
    url: '/djs/plant/team/add',
    method: 'post',
    data
  });
};

/** 修改班组（leader_id 通过 setLeader 端点切换，不在此处更新）。 */
export const updateTeam = (data: PlantWorkTeamForm) => {
  return request({
    url: '/djs/plant/team/edit',
    method: 'put',
    data
  });
};

/** 软删班组（批量，逗号拼接；下有成员则后端 400）。 */
export const delTeam = (ids: number | string | (number | string)[]) => {
  const path = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: '/djs/plant/team/remove/' + path,
    method: 'delete'
  });
};

// ---------- 成员管理 ----------

/** 班组成员列表（含 nick_name / phonenumber 冗余）。 */
export const listMembers = (teamId: number | string): AxiosPromise<PlantWorkPeopleVO[]> => {
  return request({
    url: '/djs/plant/team/' + teamId + '/members',
    method: 'get'
  });
};

/** 批量加入班组成员。 */
export const addMembers = (data: PlantWorkPeopleBatchForm) => {
  return request({
    url: '/djs/plant/team/' + data.teamId + '/members',
    method: 'post',
    data
  });
};

/** 调出单个成员（软删；若是 leader 则同步清空 team.leader_id）。 */
export const removeMember = (teamId: number | string, userId: number | string) => {
  return request({
    url: '/djs/plant/team/' + teamId + '/members/' + userId,
    method: 'delete'
  });
};

/** 设置班组负责人（leader_id + is_leader 双写）。 */
export const setLeader = (teamId: number | string, userId: number | string) => {
  return request({
    url: '/djs/plant/team/' + teamId + '/leader/' + userId,
    method: 'put'
  });
};

/** 候选员工列表（种植部下未在任何班组的 sys_user）。 */
export const listCandidateUsers = (): AxiosPromise<CandidateUserVO[]> => {
  return request({
    url: '/djs/plant/team/candidate-users',
    method: 'get'
  });
};
