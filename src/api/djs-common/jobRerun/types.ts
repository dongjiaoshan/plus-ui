/**
 * 定时任务重跑类型定义（DENGBO row7）。
 *
 * 后端：org.dromara.djs.common.job.controller.DjsJobRerunController
 */

/** 后端 DjsJobLogVo 出参 */
export interface JobLogVO {
  id: number | string;
  /** job 名（breed-aggregate / warehouse-stat / organic-warning） */
  jobName: string;
  /** 重算目标日 yyyy-MM-dd；null = 默认 / 无日期 job */
  targetDate?: string | null;
  /** running / success / fail */
  status: string;
  /** 失败信息 */
  errorMsg?: string | null;
  /** 耗时毫秒 */
  costMs?: number | null;
  /** 触发时间 yyyy-MM-dd HH:mm:ss */
  runTime: string;
  /** schedule / manual */
  triggerType: string;
}

/** 日志列表查询入参 */
export interface JobLogQuery {
  pageNum: number;
  pageSize: number;
  jobName?: string;
  status?: string;
  triggerType?: string;
}

/** 手动重跑入参 */
export interface JobRerunForm {
  jobName: string;
  /** yyyy-MM-dd；无日期 job 不传 */
  begin?: string | null;
  /** yyyy-MM-dd；无日期 job 不传 */
  end?: string | null;
}
