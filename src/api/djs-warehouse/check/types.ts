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
  /** 盘点仓库（库位名称，service 层 JOIN 回填） */
  locationName?: string;
  checkDate?: string;
  /** 字典 djs_check_status：draft / in_progress / done */
  checkStatus: string;
  /** 盘点商品数 = 明细行数 */
  lineCount?: number;
  /** 盘点异常数 = 结果为异常（djs_check_result=2）的明细数 */
  abnormalCount?: number;
  /** 盈亏计 = SUM(diff_stock) */
  diffSum?: number | string;
  /** 盘点人 ID（盘点单头发起人 create_by） */
  checkBy?: number | string;
  /** 盘点人姓名（后端 @Translation 回填） */
  checkByName?: string;
}

/** 盘点明细 line VO */
export interface StockCheckRecordVO extends BaseEntity {
  id: number | string;
  checkId: string;
  locationId: number | string;
  locationName?: string;
  productId: number | string;
  /** 产品代码（业务码，后端按 productId 回填 ProductInfo.productId） */
  productCode?: string;
  productName: string;
  productUnit: string;
  /** 库存量（盘点时系统量） */
  sysStock: number | string;
  /** 盘点库存量（实盘量） */
  checkStock: number | string;
  /** 盘点计损量（正常结果计入的损耗量，后端派生） */
  lossWeight?: number | string;
  /** 差异 = checkStock - sysStock（带符号） */
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
  /** 盘点仓库多选（R70；非空时后端按 IN 过滤，优先于单值 locationId）。 */
  locationIds?: (number | string)[];
  checkStatus?: string;
  /** 盘点人姓名（按发起人 nick_name 模糊筛选） */
  checkByName?: string;
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
