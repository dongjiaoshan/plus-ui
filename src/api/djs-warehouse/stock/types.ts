/**
 * 库存明细类型定义（WMS-MD-001）。
 *
 * 本 ticket admin 只读，未提供表单类型；库存写入由 WMS-DEMAND-001 / WMS-STOCK-001 D8-D11
 * 后续 ticket 通过出入库流水触发。
 */

export interface LocationStockVO extends BaseEntity {
  /** 这一行背后的库存篮 id 组，先进先出序（row223 / D-0068：一行 = 一组篮，行内操作整组提交） */
  stockIds: string[];
  /** 这一行合并了几个库存篮（≥1），排障用、不展示 */
  basketCount?: number;
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
  /** 三期标识（甲方 row92）：1 = 三期，「地块」列渲染成「三期」；无对应真实地块 */
  thirdPhase?: number;
  /** 真实地块名（service 层 JOIN 地块表回填，无则为空）；非三期行的「地块」列取此值 */
  plotName?: string;
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
  /** 三期筛选（甲方 row92）：1 = 只看三期标识的库存行；不传 = 全部 */
  thirdPhase?: number;
  isEnd?: number;
}

/**
 * 库存查询行「产品出库」入参（DJS-FIX-WMS-RALN-B）。
 *
 * stockIds = 这一行背后的库存篮 id 组（snowflake，全链路 string 防截断），先进先出序。
 * row223 / D-0068 起一行可能由多个篮合并而来，出库量由后端跨篮先进先出扣。
 */
export interface StockOutForm {
  stockIds: Array<number | string>;
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
 * stockIds = 源库存篮 id 组（snowflake，全链路 string 防截断），先进先出序；后端逐篮取
 * locationId + productId + 当前库存，目标冻品库由后端按 location_type=frozen 解析。
 */
export interface StockTransferForm {
  stockIds: Array<number | string>;
  /** 转移日期（默认当天，yyyy-MM-dd） */
  transferDate: string;
  /** 转移量（> 0，≤ 当前库存） */
  quantity?: number;
  remark?: string;
}

/** 毛菜间出库单项（row185 产品内部处理 / row187 批量出库共用） */
export interface VegOutItem {
  /**
   * 这一项背后的库存篮 id 组，先进先出序（row224 / D-0068）。
   *
   * 候选列表上的一行可能由多个篮合并而来（同产品 / 库位 / 耳号 / 地块 / 三期 / 白条流水号），
   * 整组提交、由后端跨篮先进先出扣。只出一个篮的场景（产品内部处理）传单元素数组即可。
   */
  stockIds: Array<number | string>;
  quantity: number | undefined;
}

/** 毛菜间出库提交（row185 产品内部处理 / row187 批量出库） */
export interface VegOutSubmitForm {
  outDate: string;
  outDest: string;
  items: VegOutItem[];
  remark?: string;
}

/**
 * 库存查询合并行背后的单个库存篮（row223 / D-0068「各篮明细（入库时间+重量）下沉到详情里看」）。
 */
export interface StockBasketVO {
  id: string;
  /** 建篮时间 = 这一篮的入库时间（首次建篮时刻；后续补货 UPSERT 累加不改这个戳） */
  createTime?: string;
  /** 这一篮当前的库存量（按产品单位计） */
  productStock?: number | string;
  /** 这一篮最近一次盘点时间 */
  latestCheckTime?: string;
  /** 这一篮的备注（单篮字段，合并行上不展示） */
  remark?: string;
}
