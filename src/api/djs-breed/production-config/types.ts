/**
 * 生产配置类型定义（A1 育肥日龄阶段）。
 *
 * 后端：org.dromara.djs.breed.production.*
 *  - ProductionCycleConfigController  /djs/breed/production/cycle/sow|slaughter/*  母猪生产 / 出栏配置（Record<string, number> 表单，无独立 VO）
 *  - FattenAgeStageController          /djs/breed/production/fatten-stage/*         育肥日龄阶段
 *
 * v1.2 重要：无定时任务 / 无自动流转 —— 本配置只决定"建议时间"，
 * 状态转换全靠 BRD-EVENT-* 业务事件触发。
 */

// ============= A1 FattenAgeStage（育肥日龄阶段） =============

export interface FattenAgeStageVO extends BaseEntity {
  id: number | string;
  startAge: number;
  endAge: number;
  recordGrowth: number;
  remark?: string;
}

export interface FattenAgeStageForm {
  id?: number | string;
  startAge: number | null;
  endAge: number | null;
  recordGrowth: number;
  remark?: string;
}
