/** 毛菜间出库-可选产品行（row187 新增抽屉左侧） */
export interface VegOutCandidateVO {
  stockId: string;
  productId: string;
  /**
   * 产品业务编号（t_warehouse_product_info.product_id，用户手填的产品编码）。
   *
   * V6 row108：右侧「已选产品」与打印单按它把同一产品的多个地块篮合并成一条。
   */
  productCode?: string;
  productName: string;
  productSpec?: string;
  /** 库存重量（BigDecimal 后端可能序列化为 string） */
  stockWeight: number | string;
  productUnit?: string;
  plotId?: string;
  plotCode?: string;
  /** 地块名称（「地块」列展示值；无地块时为空） */
  plotName?: string;
  /** 三期标识（1 = 三期）：三期货无 plot_id，「地块」列靠它显示「三期」 */
  thirdPhase?: number | string | null;
  /** 产品业态（vegetable / dry_good / egg / other）—— 干货与蛋类没有地块 */
  belongType?: string;
  /** 产品销售价格（row191）：新增页「销售单价」默认值，可改 */
  salePrice?: number | string | null;
}

/** 毛菜间出库单（row187 列表行，一次提交聚合成一行） */
export interface VegOutBatchVO {
  batchNo: string;
  outDate: string;
  outDest: string;
  productKinds: number;
  totalWeight: number | string;
  /** 出库金额合计（row192）= Σ 出库量 × 出库单价快照 */
  totalAmount?: number | string | null;
  operatorId?: string;
  operatorName?: string;
}

/** 毛菜间出库单明细（row187 详情弹框） */
export interface VegOutDetailVO {
  /** 产品业务编号：详情「重新打印」按它把同一产品的多条流水合成一行（V6 row108） */
  productCode?: string;
  productName: string;
  productSpec?: string;
  /** 计量单位（row194 起候选含干货/蛋类，单位混杂 kg/袋/桶/罐/枚，不能恒按 kg 展示） */
  productUnit?: string;
  outWeight: number | string;
  /** 出库单价（row193）：出库时录入的销售单价快照 */
  outUnitPrice?: number | string | null;
  /** 出库总价（row193）= 出库量 × 出库单价 */
  outAmount?: number | string | null;
  plotCode?: string;
  /** 出库量带单位展示串（导出专用，仅 xlsx 路径由后端派生；明细接口不返） */
  outQtyLabel?: string;
}

export interface VegOutQuery {
  pageNum?: number;
  pageSize?: number;
  beginDate?: string;
  endDate?: string;
  outDest?: string;
  operatorId?: number | string;
}
