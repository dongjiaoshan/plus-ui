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
  /** 产品名称（门店打包产品名，传给后端作 cutLabel；旧口径=零售部位中文名） */
  cutLabel?: string;
  /** 产品重量 kg（> 0） */
  weight?: number;
}

/** 门店猪肉打包可选产品（与后端 StorePackProductVo 对齐）。 */
export interface StorePackProductVO {
  /** 产品主键（雪花） */
  productId: string;
  /** 产品业务码 */
  productCode?: string;
  /** 产品名称（卡片标题 + 传给生码 cutLabel） */
  productName: string;
  /** 产品规格 */
  productSpec?: string;
  /** 缩略图 OSS id（用户上传，优先） */
  productThumb?: string;
  /** 主图 OSS id（图库自动匹配，兜底） */
  imageOssId?: string;
}
