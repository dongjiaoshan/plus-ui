/**
 * 毛菜间处理记录类型定义（FIX-ADMIN-R130，仓库-admin 行130）。
 *
 * 后端：org.dromara.djs.warehouse.veg.controller.VegHandleRecordController
 *       /djs/warehouse/vegHandleRecord/list
 * 列表 = 毛菜处理间处理流水 + 毛菜处理结算损耗 + 采摘活动流水三支 UNION。
 */

/** 统计来源码值：1=毛菜处理间 / 2=采摘活动（与「采摘明细」页 statSource 同码值）。 */
export type VegHandleStatSource = '1' | '2';

/** 毛菜间处理记录行 */
export interface VegHandleRecordVO {
  /** 处理日期 yyyy-MM-dd */
  handleDate?: string;
  /** 作物名称 */
  cropName?: string;
  /**
   * 产品名称（V6 row49）。
   * 仅「毛菜处理间·处理流水」行有值；「结算损耗」行是地块级跨产品结算、「采摘活动」行无产品维度，两者恒空。
   */
  productName?: string;
  /** 统计来源 1=毛菜处理间 / 2=采摘活动 */
  statSource?: VegHandleStatSource;
  /** 处理方式原始值（字典 djs_pick_dest：sale/veg_fresh/platform/loss/feed） */
  handleMethod?: string;
  /** 地块编号（采摘活动销售去向不记地块，为空） */
  plotCode?: string;
  /** 处理量(kg) */
  handleWeight?: number | string;
  /** 记录人姓名 */
  recorderName?: string;
}

/** 列表查询参数 */
export interface VegHandleRecordQuery {
  /** 处理日期起 yyyy-MM-dd */
  dateFrom?: string;
  /** 处理日期止 yyyy-MM-dd */
  dateTo?: string;
  /** 作物名称模糊 */
  cropName?: string;
  /** 统计来源精确 */
  statSource?: string;
  /** 处理方式精确（djs_pick_dest） */
  handleMethod?: string;
  /** 地块编号模糊 */
  plotCode?: string;
  /** 记录人模糊 */
  recorderName?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}
