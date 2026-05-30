/**
 * 猪只主表 + 状态机类型定义（BRD-CORE-001）。
 *
 * 后端：org.dromara.djs.breed.core.*
 *  - PigController  /djs/breed/pig/*
 *    - GET  /list             列表分页
 *    - GET  /{id}             详情（含最近 20 条状态变更）
 *    - GET  /{id}/history     全量历史（DESC by changeTime，最多 200 条）
 *    - POST /event            通用事件入口（运维 / 调试用；业务侧用 BRD-EVENT-* 各自端点）
 *
 * 字典依赖：
 *  - djs_pig_lifecycle      10 状态 HB/PZ/PH/FM/DN/LC/KH/FQ/END/BOAR_ACTIVE（current_status）
 *  - djs_pig_status_event   11 UI 事件 INTRO/BREED/FARROW/WEAN/OESTRUS/NULL_RETURN/DIE/ELIMINATE/CASTRATE/TRANSFER/SLAUGHTER
 *  - djs_pig_type           sow / boar / piglet / fattening
 *  - djs_pig_breed / djs_pig_strain  品种 / 品系
 *
 * 注意：`pigSex` 走 DB 实际值 `'F' | 'M'`（domain `Pig.pigSex` 字符列），
 *      与字典 `djs_pig_sex`（dict_value `F` / `M`）一致；FE 直接映射 F/M，不走 useDict。
 */

/** 性别（DB 列值；F=母 / M=公） */
export type PigSex = 'F' | 'M';

/** 10 lifecycle 状态码（字典 djs_pig_lifecycle） */
export type PigLifecycle = 'HB' | 'PZ' | 'PH' | 'FM' | 'DN' | 'LC' | 'KH' | 'FQ' | 'END' | 'BOAR_ACTIVE';

/** 11 UI 事件码（字典 djs_pig_status_event） */
export type PigStatusEventCode =
  | 'INTRO'
  | 'BREED'
  | 'FARROW'
  | 'WEAN'
  | 'OESTRUS'
  | 'NULL_RETURN'
  | 'DIE'
  | 'ELIMINATE'
  | 'CASTRATE'
  | 'TRANSFER'
  | 'SLAUGHTER';

/** 终止原因（end_reason；仅 currentStatus='END' 时有意义） */
export type PigEndReason = 'DEAD' | 'CULL' | 'MARKET';

/** 猪只类型 */
export type PigType = 'sow' | 'boar' | 'piglet' | 'fattening';

// ============= VO =============

/** 猪只列表行 / 详情主体（对应后端 PigVo） */
export interface PigVO {
  id: number | string;
  earNo: string;
  earTag?: string;
  lifecycleId?: number;
  recyclable?: number;
  pigSex: PigSex;
  pigType: PigType;
  pigBreedCode?: string;
  pigStrainCode?: string;
  currentStatus: PigLifecycle;
  statusStartedAt?: string;
  endReason?: PigEndReason;
  birthDate?: string;
  introduceDate?: string;
  parity?: number;
  barnId?: number | string;
  /** 栋舍编码（service enrich，列表/详情展示用） */
  barnCode?: string;
  penId?: number | string;
  /** 栏位编码（service enrich） */
  penCode?: string;
  matingId?: number | string;
  motherEar?: string;
  fatherEar?: string;
  /** 母猪累计配种次数（matingCount，由 BREED 事件后置原子 +=1 维护） */
  matingCount?: number;
  /** 上次配种日（payload.breedingDate） */
  lastMatingDate?: string;
  remark?: string;
  createTime?: string;
  createBy?: number | string;
  /** 创建人姓名（ADR-0007 + 跨层契约 §4.5；后端 @Translation USER_ID_TO_NAME） */
  createName?: string;
  version?: number;
}

/** 状态变更流水行（对应后端 PigStatusRecordVo） */
export interface PigStatusRecordVO {
  id: number | string;
  pigId: number | string;
  earNo: string;
  /** 原状态（INTRO 时为 null） */
  oldStatus?: PigLifecycle;
  newStatus: PigLifecycle;
  /** 事件类型（字典 djs_pig_status_event） */
  eventType: PigStatusEventCode;
  /** 关联业务事件表 PK（如 t_farm_pig_breeding.id） */
  relatedEventId?: number | string;
  /** 停留天数（进入 oldStatus 到本事件发生之间的整天数） */
  durationDays?: number;
  /** 事件发生时间 */
  changeTime: string;
  createTime?: string;
}

/** 详情 = PigVO + 最近 20 条历史 */
export interface PigDetailVO extends PigVO {
  recentHistory?: PigStatusRecordVO[];
}

// ============= Query =============

export interface PigQuery extends PageQuery {
  earNo?: string;
  pigSex?: PigSex;
  pigType?: PigType;
  currentStatus?: PigLifecycle;
  barnId?: number | string;
  penId?: number | string;
  /** true 时过滤掉终态 END 行 */
  excludeEnd?: boolean;
  motherEar?: string;
}

// ============= Event BO =============

/** OESTRUS payload（查情） */
export interface OestrusPayload {
  /** 是否确认妊娠（true → 走 PH，false → 留 PZ） */
  isPregnantConfirmed: boolean;
}

/** NULL_RETURN payload（返空异常） */
export interface NullReturnPayload {
  /** abort=流产 / return=返情 / idle=空怀 */
  abnormalType: 'abort' | 'return' | 'idle';
}

/** TRANSFER payload（转栏） */
export interface TransferPayload {
  newBarnId?: number | string;
  newPenId?: number | string;
}

/** 事件触发入参（对应后端 PigEventBo） */
export interface PigEventForm {
  pigId: number | string;
  eventType: PigStatusEventCode;
  /** null 时由后端取 now() */
  eventAt?: string;
  /** 关联业务事件表 PK；运维 / 调试可空 */
  relatedEventId?: number | string;
  payload?: OestrusPayload | NullReturnPayload | TransferPayload | Record<string, unknown>;
  remark?: string;
}
