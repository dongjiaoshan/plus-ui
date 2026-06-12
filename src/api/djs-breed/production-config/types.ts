/**
 * 生产配置类型定义（BRD-MD-003）。
 *
 * 后端：org.dromara.djs.breed.production.*
 *  - ProductionCycleConfigController  /djs/breed/production/cycle/*    Tab1 生产周期
 *  - BoarConfigController             /djs/breed/production/boar/*     Tab2 精液公猪
 *  - MedScheduleConfigController      /djs/breed/production/med/*      Tab3 药品疫苗周期
 *
 * v1.2 重要：无定时任务 / 无自动流转 —— 本配置只决定"建议时间"，
 * 状态转换全靠 BRD-EVENT-* 业务事件触发。
 */

// ============= ProductionCycleConfig（Tab1 生产周期） =============

export interface ProductionCycleConfigVO extends BaseEntity {
  id: number | string;
  configKey: string;
  defaultValue: number;
  customValue?: number | null;
  unit: string;
  description?: string;
  remark?: string;
}

export interface ProductionCycleConfigForm {
  id?: number | string;
  configKey: string;
  defaultValue: number;
  customValue?: number | null;
  unit?: string;
  description?: string;
  remark?: string;
}

export interface ProductionCycleConfigQuery extends PageQuery {
  configKey?: string;
  description?: string;
}

// ============= BoarConfig（Tab2 精液公猪） =============

export interface BoarConfigVO extends BaseEntity {
  id: number | string;
  boarId?: number | null;
  spermQualityThreshold: number | string;
  breedingIntervalDays: number;
  remark?: string;
}

export interface BoarConfigForm {
  id?: number | string;
  boarId?: number | null;
  spermQualityThreshold: number | string;
  breedingIntervalDays: number;
  remark?: string;
}

export interface BoarConfigQuery extends PageQuery {
  boarId?: number;
}

// ============= MedScheduleConfig（Tab3 药品疫苗周期） =============

export interface MedScheduleConfigVO extends BaseEntity {
  id: number | string;
  medType: string;
  eventTrigger: string;
  daysOffset: number;
  description?: string;
  remark?: string;
}

export interface MedScheduleConfigForm {
  id?: number | string;
  medType: string;
  eventTrigger: string;
  daysOffset: number;
  description?: string;
  remark?: string;
}

export interface MedScheduleConfigQuery extends PageQuery {
  medType?: string;
  eventTrigger?: string;
}

// ============= A1 FattenAgeStage（Tab2 育肥日龄阶段） =============

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
