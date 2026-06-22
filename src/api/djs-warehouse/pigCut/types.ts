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

/** 待领用白条（applet GET /availableBars，与后端 BarInfoVo 对齐） */
export interface AvailableBarVO {
  id: number;
  barId: string;
  earNo?: string;
  marketingWeight?: number;
  inWeight?: number;
  inTime?: string;
  status: string;
}

/** 阶段 1 白条领用表单（与后端 PigCutPickupBo 对齐） */
export interface PigCutPickupForm {
  barInfoId?: number;
  locationId?: number;
  pickupWeight?: number;
  isHalf?: number;
  remark?: string;
}

/** 分割出库单部位明细（与后端 PigCutOutBo.PartItem 对齐） */
export interface PigCutPartItem {
  productId?: number;
  cutPart?: string;
  productWeight?: number;
  productSpec?: string;
}

/** 阶段 2 分割出库表单（与后端 PigCutOutBo 对齐） */
export interface PigCutOutForm {
  cutRecordId?: number;
  locationId?: number;
  partItems: PigCutPartItem[];
  proofOssIds?: string;
}

/** 阶段 3 分割完成表单（与后端 PigCutDoneBo 对齐；滴水损耗后端自动计算，前端不录入） */
export interface PigCutDoneForm {
  cutRecordId?: number;
  proofOssIds?: string;
  remark?: string;
}
