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
  updateTime?: string;
  /** 更新人昵称 */
  updateByName?: string;
  /** 大栏数量（后端按 pen_type=big 实时统计） */
  bigPenCount?: number;
  /** 限位栏数量（后端按 pen_type=stall 实时统计） */
  limitPenCount?: number;
  /** 产床数量（后端按 pen_type=farrow 实时统计） */
  bedCount?: number;
  /** 散栏数量（后端按 pen_type=scatter 实时统计） */
  scatterPenCount?: number;
  /** 保育栏数量（后端按 pen_type=nursery_pen 实时统计） */
  nurseryPenCount?: number;
  /** 当前猪只存栏数量（后端实时统计存活猪只） */
  liveCount?: number;
}

/** 编辑栋舍（名称 / 类型 / 状态 / 备注；栏位数量在新建时定，编辑不改） */
export interface BarnForm {
  id?: number | string;
  barnCode: string;
  barnName: string;
  barnType: string;
  capacity?: number;
  barnStatus: number;
  remark?: string;
}

/** 新建栋舍（对齐原型「新建栋舍」弹窗：名称 / 类型 / 五类栏位数量自动生成栏位） */
export interface BarnCreateForm {
  barnName: string;
  barnType: string;
  bigPenCount: number;
  limitPenCount: number;
  bedCount: number;
  scatterPenCount: number;
  nurseryPenCount: number;
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
  /** 字典 djs_pen_type：big 大栏 / stall 限位栏 / farrow 产床 */
  penType: string;
  capacity?: number;
  currentCount?: number;
  penStatus: number;
  remark?: string;
  createTime?: string;
}

/** 栏位详情（栏位详情子页 3-tab：大栏 / 限位栏 / 产床） */
export interface PenDetailVO {
  id: number | string;
  penCode: string;
  /** 栏位序号名（如「1栏」） */
  penName: string;
  /** big / stall / farrow */
  penType: string;
  capacity?: number;
  /** 大栏：猪只头数 */
  headCount?: number;
  /** 限位栏 / 产床：占栏猪只耳号（空栏为 null） */
  earNo?: string;
  /** 占栏猪只 ID（耳号链接跳详情用） */
  pigId?: number | string;
  /** 产床：占栏母猪最近一次分娩的活产仔猪数 */
  pigletCount?: number;
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
