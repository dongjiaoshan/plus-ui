/**
 * 库存明细类型定义（WMS-MD-001）。
 *
 * 本 ticket admin 只读，未提供表单类型；库存写入由 WMS-DEMAND-001 / WMS-STOCK-001 D8-D11
 * 后续 ticket 通过出入库流水触发。
 */

export interface LocationStockVO extends BaseEntity {
  id: number | string;
  /** service 层按 product_id FK 回填的产品业务码（如 P10002） */
  productCode?: string;
  locationId: number | string;
  /** service 层 JOIN 回填 */
  locationName?: string;
  productId?: number | string;
  earNo?: string;
  plotId?: number | string;
  /** service 层 JOIN 地块表回填的地块编号（plot_code） */
  blockNo?: string;
  productName: string;
  productStock: number | string;
  productUnit: string;
  isEnd: number;
  latestCheckTime?: string;
  checkResult?: number;
  operatorId?: number | string;
  /** ruoyi Translation user_id_to_name 回填 */
  operatorName?: string;
  remark?: string;
}

export interface LocationStockQuery extends PageQuery {
  locationId?: number | string;
  productId?: number | string;
  productName?: string;
  earNo?: string;
  plotId?: number | string;
  blockNo?: string;
  isEnd?: number;
}

/**
 * 库存查询行「产品出库」入参（DJS-FIX-WMS-RALN-B）。
 *
 * id = 库存行主键（snowflake，全链路 string 防截断）；后端按此取 locationId + productId。
 */
export interface StockOutForm {
  id: number | string;
  /** 出库日期（默认当天，yyyy-MM-dd） */
  outDate: string;
  /** 出库量（> 0） */
  quantity?: number;
  /** 出库方式 / 去向（djs_stock_out_dest 字典 value） */
  stockOutDest: string;
  remark?: string;
}
