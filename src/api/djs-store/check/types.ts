/**
 * 门店盘点类型定义（STR-STOCK-001，admin only 无 mp）。
 *
 * 与后端 org.dromara.djs.store.check.domain.* 对齐。id / storeId / productId / checkBy
 * 均 string（snowflake JS 精度问题，参 .claude/skills/coder-djs-cross-layer-contract.md §契约 1）。
 * 盘点单状态字典 djs_check_status：draft / in_progress / completed（不是 done）。
 * 盘点结果字典 djs_check_result：1=正常 / 2=异常 / 3=计损。
 */

/** 盘点单 header 列表 VO（盘点单维度，service 聚合 header + line）。 */
export interface StoreCheckHeaderVO {
  id: string;
  checkId: string;
  storeId: string;
  storeName?: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  checkDate: string;
  /** djs_check_status：draft / in_progress / completed */
  checkStatus: string;
  /** 明细行数（service 聚合） */
  lineCount: number;
  /** 盈亏计 = SUM(diff_stock)（>0 净盘盈 / <0 净盘亏） */
  diffSum: number | string;
  createTime?: string;
}

/** 盘点明细 line VO（逐产品系统量 / 实盘量 / 差异）。 */
export interface StoreCheckRecordVO {
  id: string;
  checkId: string;
  storeId: string;
  storeName?: string;
  productId: string;
  productName: string;
  productUnit: string;
  sysStock: number | string;
  checkStock: number | string;
  diffStock: number | string;
  /** djs_check_result：1=正常 / 2=异常 / 3=计损 */
  checkResultType: number;
  diffReason?: string;
  checkBy?: string;
  checkByName?: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  checkDate: string;
  /** djs_check_status */
  checkStatus: string;
  /** 1=盘点单头 / 0=盘点明细 */
  isHeader: number;
  createTime?: string;
}

/** 新建盘点单入参（选门店 + 盘点日期 → 后端建 header status='in_progress' 锁门店）。 */
export interface StoreCheckCreateForm {
  storeId: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  checkDate: string;
  remark?: string;
}

/** 提交 / 修改实盘明细 line 入参（按 checkId + storeId + productId upsert）。 */
export interface StoreCheckLineForm {
  /** 修改场景的 line 主键；新增留空 */
  id?: string;
  checkId: string;
  productId: string;
  checkStock: number | string;
  diffReason?: string;
  /** 默认按差异自动判定，可手填覆盖 */
  checkResultType?: number;
}

/** 盘点单列表查询。 */
export interface StoreCheckQuery extends PageQuery {
  checkId?: string;
  storeId?: string;
  /** djs_check_status */
  checkStatus?: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  checkDateFrom?: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  checkDateTo?: string;
}

/** 明细 / 导出查询（按 checkId 或 storeId 拉某盘点单的逐项明细）。 */
export interface StoreCheckLineQuery {
  checkId?: string;
  storeId?: string;
  checkStatus?: string;
}
