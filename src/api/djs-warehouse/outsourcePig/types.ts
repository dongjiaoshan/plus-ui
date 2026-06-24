/**
 * 外购猪只类型定义（DJS-FIX-WMS-RALN）。
 *
 * 后端：org.dromara.djs.warehouse.outsource.* / 路径前缀 /djs/warehouse/outsourcePig
 */

/** 后端 OutsourcePigVo 出参 */
export interface OutsourcePigVO extends BaseEntity {
  /** 主键（雪花 string，禁 Number） */
  id: number | string;
  /** 购买日期 yyyy-MM-dd */
  purchaseDate?: string;
  /** 到场时间 yyyy-MM-dd HH:mm:ss */
  arriveTime?: string;
  /** 猪只标识号 */
  pigMarkNo?: string;
  /** 毛猪重量 kg */
  pigWeight?: number | string;
  /** 送宰日期 yyyy-MM-dd */
  slaughterDate?: string;
  /** 供应商 ID（雪花 string） */
  supplierId?: number | string;
  /** 供应商名称（后端按 supplierId 回填） */
  supplierName?: string;
  /** 购买人 sys_user.user_id（string） */
  buyer?: string;
  /** 购买人姓名（后端 @Translation 回填） */
  buyerName?: string;
  remark?: string;
}

/** 新增表单（仅新增，无编辑） */
export interface OutsourcePigForm {
  /** 购买日期 yyyy-MM-dd（必填） */
  purchaseDate?: string;
  /** 到场时间 yyyy-MM-dd HH:mm:ss（不再手填；列表展示值由关联白条燎毛称重时刻 bar_info.in_time 自动回填，FIX-WMS-OUTSOURCE-001 行38） */
  arriveTime?: string;
  /** 猪只标识号（可空） */
  pigMarkNo?: string;
  /** 毛猪重量 kg（必填） */
  pigWeight?: number;
  /** 送宰日期 yyyy-MM-dd（必填） */
  slaughterDate?: string;
  /** 供应商 ID（必填） */
  supplierId?: number | string;
  /** 购买人 sys_user.user_id（可空） */
  buyer?: string;
  remark?: string;
}

/** 列表查询入参 */
export interface OutsourcePigQuery extends PageQuery {
  /** 购买日期（按天精确） yyyy-MM-dd */
  purchaseDate?: string;
  /** 到场时间（按天精确） yyyy-MM-dd */
  arriveTime?: string;
  /** 供应商 ID */
  supplierId?: number | string;
  /** 购买人 sys_user.user_id */
  buyer?: string;
}
