/**
 * 燎毛工序记录 admin 端类型（WMS-PIG-001）。
 *
 * 与后端 PigBurnRecordVo / PigBurnRecordQuery 对齐。
 */

export interface PigBurnRecordVO {
  id: number;
  burnId: string;
  earNo: string;
  burnTime: string;
  arriveWeight: number;
  burnWeight: number;
  lossWeight: number;
  burnStatus: string;
  operatorId?: number;
  operatorName?: string;
  locationId?: number;
  locationName?: string;
  proofOssIds?: string;
  remark?: string;
  createTime?: string;
}

export interface PigBurnRecordQuery {
  earNo?: string;
  burnId?: string;
  burnStatus?: string;
  operatorId?: number;
  burnTimeFrom?: string;
  burnTimeTo?: string;
  pageNum?: number;
  pageSize?: number;
}
