/**
 * 班组类型定义（PLT-MD-002）。
 *
 * 跨层契约：所有 ID 字段全 `number | string`（snowflake long 序列化）。
 */

export interface PlantWorkTeamVO {
  id: number | string;
  teamName: string;
  leaderId?: number | string;
  /** 负责人显示名（后端 enrich：LEFT JOIN sys_user.nick_name） */
  leaderName?: string;
  /** 字典 djs_common_status：1=启用 / 2=停用 */
  teamStatus: number;
  /** 当前成员数（后端 enrich：子查询 count） */
  memberCount?: number;
  remark?: string;
  createTime?: string;
}

export interface PlantWorkTeamForm {
  id?: number | string;
  teamName: string;
  teamStatus: number;
  remark?: string;
  // leader_id 不在表单中，统一通过"成员管理 → 设为负责人"切换
}

export interface PlantWorkTeamQuery extends PageQuery {
  teamName?: string;
  teamStatus?: number;
  leaderId?: number | string;
}

export interface PlantWorkPeopleVO {
  id: number | string;
  teamId: number | string;
  userId: number | string;
  /** sys_user.user_name 登录账号 */
  userName?: string;
  /** sys_user.nick_name 显示名 */
  nickName?: string;
  /** sys_user.phonenumber */
  phonenumber?: string;
  /** 是否班组负责人：1=是 / 2=否 */
  isLeader: number;
  joinDate?: string;
}

export interface CandidateUserVO {
  userId: number | string;
  userName: string;
  nickName: string;
  phonenumber?: string;
  deptName?: string;
}

export interface PlantWorkPeopleBatchForm {
  teamId: number | string;
  /** 候选员工 user_id 列表 */
  userIds: (number | string)[];
}
