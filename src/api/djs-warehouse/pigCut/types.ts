/**
 * 分割工序记录 admin 端类型（WMS-PIG-002）。
 *
 * 与后端 PigCutRecordVo / PigCutRecordQuery 对齐。
 */

export interface PigCutRecordVO {
  id: number;
  cutId: string;
  whiteBarId: number;
  barId: string;
  earNo?: string;
  pickupTime: string;
  cutStartTime?: string;
  cutDoneTime?: string;
  pickupWeight?: number;
  dripLoss?: number;
  acidRemoveMinutes?: number;
  operatorId?: number;
  operatorName?: string;
  locationId?: number;
  locationName?: string;
  targetStoreId?: number;
  targetDemandId?: number;
  isHalf: number;
  cutStatus: 'pending_pickup' | 'picked' | 'cutting' | 'done';
  proofOssIds?: string;
  remark?: string;
  createTime?: string;
}

export interface PigCutRecordQuery {
  cutId?: string;
  barId?: string;
  earNo?: string;
  cutStatus?: string;
  operatorId?: number;
  pickupTimeFrom?: string;
  pickupTimeTo?: string;
  pageNum?: number;
  pageSize?: number;
}
