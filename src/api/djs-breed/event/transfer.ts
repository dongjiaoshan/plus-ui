import type { AxiosPromise } from 'axios';
import request from '@/utils/request';

/** 种母猪永久「转育肥猪」入参（D-0150，复用admin row162端点） */
export interface ToFattenForm {
  /** 猪只 ID */
  pigId: number | string;
  /** 转移日期（yyyy-MM-dd HH:mm:ss） */
  transferDate: string;
  /** 转移栋舍 ID（空则沿用当前栋舍） */
  newBarnId?: number | string;
  /** 转移栏位 ID（空则沿用当前栏位） */
  newPenId?: number | string;
  /** 转移负责人 userId（空则使用登录用户） */
  operator?: string;
  remark?: string;
}

/**
 * 繁殖已结束且无未断奶仔猪的种母猪永久转为育肥猪，历史繁殖记录保留。
 * 复用转移记录及 TRANSFER + TO_FATTEN 两条事件台账。
 */
export function toFatten(data: ToFattenForm): AxiosPromise<unknown> {
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
