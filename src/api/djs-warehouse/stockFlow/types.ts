/**
 * 出入库流水 admin 端类型（WMS-MAT-001）。
 *
 * 与后端 StockFlowVo / StockFlowQuery 对齐。
 */

export interface StockFlowVO {
  id: number;
  flowNo: string;
  flowDate: string;
  productId?: number;
  /** 产品类型 djs_product_type（1 自产 / 2 外购，已废弃 3 礼盒；后端 JOIN 回填） */
  productType?: number;
  productName?: string;
  productCode?: string;
  belongType?: string;
  productUnit?: string;
  warehouseId?: number;
  locationName?: string;
  inoutType: string;
  flowType: string;
  stockInType?: string;
  stockOutType?: string;
  stockOutDest?: string;
  changeNum: number;
  changeQuantity: number;
  supplierId?: number;
  earNo?: string;
  plotId?: number;
  /** 地块编号（= t_plant_plot_info.plot_code，后端 JOIN 回填） */
  blockNo?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  proofOssIds?: string;
  createTime?: string;
}

export interface StockFlowQuery {
  flowNo?: string;
  flowType?: string;
  /** 流水类型多选（R70 入/出库方式下拉多选）；非空时后端按 IN 过滤 */
  flowTypes?: string[];
  inoutType?: string;
  matType?: string;
  /** 物资类型多选（R70 物资类型下拉多选）；非空时后端按 IN 过滤 */
  matTypes?: string[];
  /** 雪花 ID 全链路 string —— Number() 会丢精度（coder-djs-cross-layer-contract） */
  productId?: string;
  productCode?: string;
  /** 产品名称模糊匹配 */
  productName?: string;
  /** 产品类型 djs_product_type（1 自产 / 2 外购，已废弃 3 礼盒）精确匹配 */
  productType?: number;
  /** 产品类型多选（R70 产品类型下拉多选，Kevin 点名）；非空时后端按 IN 过滤 */
  productTypes?: number[];
  earNo?: string;
  plotId?: number;
  /** 地块编号模糊匹配 */
  blockNo?: string;
  warehouseId?: number;
  /** 库位/仓库多选（R70 库位下拉多选）；非空时后端按 IN 过滤 */
  warehouseIds?: number[];
  stockOutDest?: string;
  /** 出库去向多选（R70 出库去向下拉多选）；非空时后端按 IN 过滤 */
  stockOutDests?: string[];
  operatorId?: number;
  /** 入/出库人姓名模糊匹配 */
  operatorName?: string;
  dateFrom?: string;
  dateTo?: string;
  pageNum?: number;
  pageSize?: number;
}
