/**
 * 库存盘点类型定义（WMS-STOCK-001）。
 *
 * 后端：org.dromara.djs.warehouse.check.* /djs/warehouse/check
 * 跨层契约：所有 ID 字段 string（snowflake 防截断）。
 */

/** 盘点单 header 聚合 VO（admin 列表，盘点单维度 + 盈亏计） */
export interface StockCheckHeaderVO extends BaseEntity {
  id: number | string;
  checkId: string;
  locationId: number | string;
  /** service 层 JOIN 回填 */
  locationName?: string;
  checkDate?: string;
  /** 字典 djs_check_status：draft / in_progress / done */
  checkStatus: string;
  /** 明细行数 */
  lineCount?: number;
  /** 盈亏计 = SUM(diff_stock) */
  diffSum?: number | string;
}

/** 盘点明细 line VO */
export interface StockCheckRecordVO extends BaseEntity {
  id: number | string;
  checkId: string;
  locationId: number | string;
  locationName?: string;
  productId: number | string;
  productName: string;
  productUnit: string;
  sysStock: number | string;
  checkStock: number | string;
  diffStock: number | string;
  /** 字典 djs_check_result：1=正常 / 2=异常 / 3=计损 */
  checkResultType: number;
  diffReason?: string;
  checkBy?: number | string;
  /** ruoyi Translation user_id_to_name 回填 */
  checkByName?: string;
  checkDate?: string;
  checkStatus: string;
  isHeader?: number;
}

/** 盘点单列表查询入参 */
export interface StockCheckQuery extends PageQuery {
  checkId?: string;
  locationId?: number | string;
  checkStatus?: string;
  checkDateFrom?: string;
  checkDateTo?: string;
}

/** 明细 line 查询入参（不分页） */
export interface StockCheckLineQuery {
  checkId?: string;
  locationId?: number | string;
}

/** 新建盘点单入参 */
export interface StockCheckCreateForm {
  locationId?: number | string;
  checkDate?: string;
  remark?: string;
}
