/**
 * 农场 / 栋舍 / 栏位类型定义（BRD-MD-002）。
 *
 * 后端：org.dromara.djs.breed.farm.*
 *  - FarmInfoController  /djs/breed/farm-info/*   农场（V1 单农场只读 + 编辑 contact 3 字段）
 *  - BarnController      /djs/breed/barn/*        栋舍 CRUD
 *  - PenController       /djs/breed/pen/*         栏位 CRUD
 *
 * V1 单农场（ADR-0001）—— 左侧 el-tree 不显示农场根节点，直接显示"栋舍 → 栏位"两层。
 */

// ============= FarmInfo =============

/** 农场只读详情 + contact 编辑 */
export interface FarmInfoVO {
  id: number | string;
  farmCode: string;
  farmName: string;
  /** 字典 djs_farm_status：0=启用 / 1=停用 */
  farmStatus: number;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  remark?: string;
}

/** 仅 contact 三字段可改 */
export interface FarmContactForm {
  id: number | string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
}

// ============= Barn 栋舍 =============

export interface BarnVO {
  id: number | string;
  barnCode: string;
  barnName: string;
  /** 字典 djs_barn_type：breeding / pregnant / farrow / nursery / fattening / isolation */
  barnType: string;
  capacity?: number;
  currentCount?: number;
  /** 1=启用 / 0=停用 */
  barnStatus: number;
  remark?: string;
  createTime?: string;
}

export interface BarnForm {
  id?: number | string;
  barnCode: string;
  barnName: string;
  barnType: string;
  capacity?: number;
  barnStatus: number;
  remark?: string;
}

export interface BarnQuery extends PageQuery {
  barnCode?: string;
  barnName?: string;
  barnType?: string;
  barnStatus?: number;
}

// ============= Pen 栏位 =============

export interface PenVO {
  id: number | string;
  barnId: number | string;
  penCode: string;
  penName: string;
  /** 字典 djs_pen_type：male / female / stall / group */
  penType: string;
  capacity?: number;
  currentCount?: number;
  penStatus: number;
  remark?: string;
  createTime?: string;
}

export interface PenForm {
  id?: number | string;
  barnId: number | string;
  penCode: string;
  penName: string;
  penType: string;
  capacity?: number;
  penStatus: number;
  remark?: string;
}

export interface PenQuery extends PageQuery {
  barnId?: number | string;
  penCode?: string;
  penName?: string;
  penType?: string;
  penStatus?: number;
}
