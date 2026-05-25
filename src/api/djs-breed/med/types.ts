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
  medicineId: number | string;
  usageType: MedUsageType;
  usageQty: number | string;
  useDate: string;
  relatedPenId?: number | string;
  pigId?: number | string;
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
