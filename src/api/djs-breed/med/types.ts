/**
 * 药品库 / 药品批次类型定义（BRD-MED-001）。
 */

// ============= Medicine（药品库 t_breed_medicine_info） =============

export interface MedicineVO extends BaseEntity {
  id: number | string;
  medicineCode: string;
  medicineName: string;
  medicineType: string;
  supplierId?: number | string;
  approvalNo?: string;
  batchNo?: string;
  expireDate?: string;
  withdrawDays?: number;
  unit?: string;
  currentStock?: number | string;
  spec?: string;
  manufacturer?: string;
  storageCondition?: string;
  medStatus: number;
  remark?: string;
}

/**
 * 新增 / 编辑表单。
 *
 * `medicineCode` 新增时必填，编辑时后端强制锁回旧值（form 仍保留显示，disabled）。
 */
export interface MedicineForm {
  id?: number | string;
  medicineCode: string;
  medicineName: string;
  medicineType: string;
  supplierId?: number | string;
  approvalNo?: string;
  batchNo?: string;
  expireDate?: string;
  withdrawDays?: number;
  unit?: string;
  currentStock?: number | string;
  spec?: string;
  manufacturer?: string;
  storageCondition?: string;
  medStatus: number;
  remark?: string;
}

export interface MedicineQuery extends PageQuery {
  medicineName?: string;
  medicineCode?: string;
  medicineType?: string;
  supplierId?: number | string;
  medStatus?: number;
}

// ============= MedBatch（药品批次 t_breed_medicine_batch） =============

export interface MedBatchVO extends BaseEntity {
  id: number | string;
  medicineId: number | string;
  /** enrich：药品名称（替代裸 medicineId） */
  medicineName?: string;
  batchNo: string;
  productionDate?: string;
  expiryDate?: string;
  quantity: number | string;
  unitPrice?: number | string;
  remark?: string;
}

export interface MedBatchForm {
  id?: number | string;
  medicineId: number | string;
  batchNo: string;
  productionDate?: string;
  expiryDate?: string;
  quantity: number | string;
  unitPrice?: number | string;
  remark?: string;
}

export interface MedBatchQuery extends PageQuery {
  medicineId?: number | string;
  batchNo?: string;
}

// ============= MedUsage（药品领用台账 t_breed_medicine_usage） =============

export type MedUsageType = 'use' | 'return' | 'loss';

export interface MedUsageVO extends BaseEntity {
  id: number | string;
  batchId: number | string;
  /** enrich：批号（替代裸 batchId） */
  batchNo?: string;
  medicineId: number | string;
  /** enrich：药品名称（替代裸 medicineId） */
  medicineName?: string;
  usageType: MedUsageType;
  usageQty: number | string;
  useDate: string;
  relatedPenId?: number | string;
  /** enrich：栏位编码（替代裸 relatedPenId） */
  penCode?: string;
  pigId?: number | string;
  /** enrich：耳号（替代裸 pigId） */
  earNo?: string;
  scheduleId?: number | string;
  remark?: string;
}

export interface MedUsageForm {
  batchId: number | string;
  medicineId: number | string;
  usageType: MedUsageType;
  usageQty: number | string;
  useDate: string;
  relatedPenId?: number | string;
  pigId?: number | string;
  scheduleId?: number | string;
  remark?: string;
}

export interface MedUsageQuery extends PageQuery {
  medicineId?: number | string;
  batchId?: number | string;
  usageType?: MedUsageType | string;
  useDateFrom?: string;
  useDateTo?: string;
  pigId?: number | string;
}

export interface MedUsageTodayStat {
  use: number | string;
  return: number | string;
  loss: number | string;
}

// ============= MedRecord（用药治疗流水 t_breed_medicine_record，BRD-MED-003） =============

/** 1=单只 / 2=批量 master / 3=批量 detail */
export type MedRecordDrugType = 1 | 2 | 3;

export interface MedRecordVO extends BaseEntity {
  id: number | string;
  useDate: string;
  pigId?: number | string;
  earNo?: string;
  masterId?: number | string;
  drugType: MedRecordDrugType;
  medicineType: string;
  medicineReason?: string;
  medicineWay: string;
  medicineId: number | string;
  medicineName: string;
  batchId: number | string;
  /** enrich：批号（替代裸 batchId） */
  batchNo?: string;
  usageId?: number | string;
  scheduleId?: number | string;
  medicineDosage: number | string;
  operatorId: number | string;
  operatorName?: string;
  remark?: string;
}

export interface MedRecordForm {
  useDate: string;
  pigId: number | string;
  medicineType: string;
  medicineReason?: string;
  medicineWay: string;
  medicineId: number | string;
  batchId: number | string;
  usageId?: number | string;
  scheduleId?: number | string;
  medicineDosage: number | string;
  remark?: string;
}

export interface MedRecordQuery extends PageQuery {
  pigId?: number | string;
  earNo?: string;
  medicineType?: string;
  drugType?: MedRecordDrugType;
  beginDate?: string;
  endDate?: string;
  batchId?: number | string;
  medicineId?: number | string;
  operatorId?: number | string;
}

export interface UsableBatchVO {
  batchId: number | string;
  medicineId: number | string;
  medicineName: string;
  batchNo: string;
  quantity: number | string;
  usageId?: number | string;
  lastUseDate?: string;
}
