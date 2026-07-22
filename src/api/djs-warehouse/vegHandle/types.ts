/**
 * 毛菜处理 admin 端类型（WMS-VEG-001）。
 *
 * 与后端 VegetableHandleVo / HandleRecordVo 对齐。
 */

export interface VegetableHandleVO {
  id: number | string;
  plantingRecordId?: number | string;
  plotId: number | string;
  plotName?: string;
  cropId: number | string;
  cropName?: string;
  productId?: number | string;
  pickStartTime: string;
  pickEndTime?: string;
  pickedWeight?: number;
  handledWeight?: number;
  feedWeight?: number;
  sendPlatformWeight?: number;
  stockInWeight?: number;
  lossWeight?: number;
  isWeighed: number;
  isFinish: number;
  handleStatus: 'pending' | 'processing' | 'done';
  remark?: string;
  createTime?: string;
}

export interface HandleRecordVO {
  id: number | string;
  handleId: number | string;
  plotId: number | string;
  cropId: number | string;
  recordType: 1 | 2;
  recordWeight: number;
  isFinish?: number;
  handleTarget?: 1 | 2 | 3;
  locationId?: number | string;
  locationName?: string;
  handleUser: number | string;
  handleUserName?: string;
  handleTime: string;
  proofOssIds?: string;
  remark?: string;
  createTime?: string;
}

export interface VegHandleQuery {
  plotId?: number | string;
  cropId?: number | string;
  plantingRecordId?: number | string;
  handleStatus?: string;
  /** 处理状态多选（R70 状态下拉多选）。 */
  handleStatuses?: string[];
  pickStartTimeFrom?: string;
  pickStartTimeTo?: string;
  pageNum?: number;
  pageSize?: number;
}

/** 采摘明细行（admin 只读列表）。 */
export interface PickDetailVO {
  id?: number | string;
  /** 采摘日期 yyyy-MM-dd。 */
  pickDate?: string;
  cropName?: string;
  /** 地块编号。 */
  plotCode?: string;
  /** 采摘量（kg）。 */
  pickWeight?: number;
  /** 采摘班组名称。 */
  teamName?: string;
}

export interface PickDetailQuery {
  /** 采摘日期范围-起 yyyy-MM-dd。 */
  pickDateBegin?: string;
  /** 采摘日期范围-止 yyyy-MM-dd。 */
  pickDateEnd?: string;
  cropName?: string;
  /** 采摘班组 id。 */
  teamId?: number | string;
  pageNum?: number;
  pageSize?: number;
}
