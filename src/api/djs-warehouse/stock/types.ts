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
  /** 业态归属（djs_belong_type）：service JOIN product_info 回填；详情饲料 tab 显隐判定 */
  belongType?: string;
  /** 产品属性（1 生产产品 / 2 原材料）：service JOIN product_info 回填；详情饲料 tab 显隐判定 */
  productAttr?: number;
  productName: string;
  /** 产品规格（row183）：service JOIN product_info 回填；列表产品名称右侧展示 */
  productSpec?: string;
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
  /** 库位多选（R70；非空时后端按 IN 过滤，优先于单值 locationId）。 */
  locationIds?: (number | string)[];
  productId?: number | string;
  productName?: string;
  /** 归属类型（djs_belong_type）：row152-1 后端需关联 product 表按 belong_type 过滤 */
  belongType?: string;
  /** 归属类型多选（R70；非空时后端先按 belong_type IN 反查 productId 再过滤库存，优先于单值 belongType）。 */
  belongTypes?: string[];
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

/**
 * 库存查询行「猪肉转移」入参（WS13 / row143）：猪肉鲜品库 → 冻品库。
 *
 * id = 源库存行主键（snowflake，全链路 string 防截断）；后端按此取 locationId + productId + 当前库存，
 * 目标冻品库由后端按 location_type=frozen 解析。
 */
export interface StockTransferForm {
  id: number | string;
  /** 转移日期（默认当天，yyyy-MM-dd） */
  transferDate: string;
  /** 转移量（> 0，≤ 当前库存） */
  quantity?: number;
  remark?: string;
}

/** 毛菜间出库单项（row185 单条 / row187 批量共用） */
export interface VegOutItem {
  stockId: number | string;
  quantity: number | undefined;
}

/** 毛菜间出库提交（row185 产品内部处理 / row187 批量出库） */
export interface VegOutSubmitForm {
  outDate: string;
  outDest: string;
  items: VegOutItem[];
  remark?: string;
}
