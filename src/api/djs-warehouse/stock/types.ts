/**
 * 库存明细类型定义（WMS-MD-001）。
 *
 * 本 ticket admin 只读，未提供表单类型；库存写入由 WMS-DEMAND-001 / WMS-STOCK-001 D8-D11
 * 后续 ticket 通过出入库流水触发。
 */

export interface LocationStockVO extends BaseEntity {
  id: number | string;
  locationId: number | string;
  /** service 层 JOIN 回填 */
  locationName?: string;
  productId?: number | string;
  earNo?: string;
  plotId?: number | string;
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
  isEnd?: number;
}
