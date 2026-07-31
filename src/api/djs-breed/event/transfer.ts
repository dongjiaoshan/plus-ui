import type { AxiosPromise } from 'axios';
import request from '@/utils/request';

/** 后备种母猪「转为育肥猪」入参（admin row162） */
export interface ToFattenForm {
  /** 猪只 ID */
  pigId: number | string;
  /** 转移日期（yyyy-MM-dd HH:mm:ss） */
  transferDate: string;
  /** 转移栋舍 ID（空则沿用当前栋舍） */
  newBarnId?: number | string;
  /** 转移栏位 ID（空则沿用当前栏位） */
  newPenId?: number | string;
  /** 转移负责人 userId（养殖部人员；空则回落登录用户） */
  operator?: string;
  remark?: string;
}

/**
 * 后备种母猪转为育肥猪：状态 后备(HB) → 育肥(YF)、类型 种母猪 → 育肥猪，
 * 并写一条转移记录 + 一条 TO_FATTEN 事件台账。
 */
export function toFatten(data: ToFattenForm): AxiosPromise<any> {
  return request({
    url: '/djs/breed/event/transfer/to-fatten',
    method: 'post',
    data
  });
}

/** 员工项（人员下拉，userId 为 string 防雪花精度截断） */
export interface EmployeeItem {
  userId: string;
  userName?: string;
  nickName?: string;
  deptName?: string;
}

/**
 * 员工下拉（复用 mp EmployeePicker 端点，@SaCheckLogin 即可，admin 登录态同样可调）。
 * @param deptId 部门 id（养殖部 = 200）
 */
export function listEmployee(deptId?: number | string, keyword?: string): AxiosPromise<EmployeeItem[]> {
  return request({
    url: '/djs/applet/common/employee/list',
    method: 'get',
    params: { deptId, keyword }
  });
}
