/**
 * 门店追溯码（猪肉现场生码）类型（STORE-TRACE-ONSITE-001，ADR-0015）。
 *
 * 与后端 org.dromara.djs.store.trace.domain.* 对齐。所有猪只 ID 走耳号业务键，不暴露 snowflake。
 */

/** 可追溯猪只 picker 出参（与后端 TraceablePigVo 对齐）。 */
export interface TraceablePigVO {
  /** 猪只ID（= 耳号简版，chip 主显 + 选中值） */
  earNo: string;
  /** 性别（字典 djs_pig_sex：F/M） */
  pigSex?: string;
  /** 品种品系 label（{品种}/{品系}） */
  pigBreedLabel?: string;
  /** 日龄（天） */
  ageDays?: number;
}

/** 现场生码入参（与后端 StoreTraceOnsiteBo 对齐）。 */
export interface StoreTraceOnsiteForm {
  /** 猪只耳号（picker 选中） */
  earNo?: string;
  /** 零售部位中文名（字典 djs_pork_cut_product） */
  cutLabel?: string;
  /** 产品重量 kg（> 0） */
  weight?: number;
}
