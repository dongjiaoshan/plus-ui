/**
 * 三期作物入库类型定义（V6 row88）。
 *
 * 后端：org.dromara.djs.warehouse.thirdphase.controller.ThirdPhaseInController  /djs/warehouse/thirdPhaseIn
 *
 * 「三期」= 甲方作物的第三茬/第三期（不是开发三期）；系统里没有对应的真实地块，入库行只打一个
 * `third_phase` 标记 + 展示文案（甲方 row92）。
 * 入库方式固定 djs_flow_type = third_phase_in；入库库位固定毛菜鲜品库（甲方口径「毛菜保鲜室」，L0006）。
 */

/** 三期作物入库记录行 */
export interface ThirdPhaseInVO {
  id: number | string;
  /** 入库时间 yyyy-MM-dd HH:mm（后端已格式化到分） */
  inTime?: string;
  /** 作物 id（t_plant_crop_info.id，超 JS Number 精度按字符串用） */
  cropId?: number | string;
  /** 作物名称 */
  cropName?: string;
  /** 入库产品 id（t_warehouse_product_info.id） */
  productId?: number | string;
  /** 入库产品名称 */
  productName?: string;
  /** 入库量(kg，3 位小数；BigDecimal 序列化为字符串，渲染前必须 Number() 转换) */
  stockNum?: number | string;
  /** 入库库位 id */
  locationId?: number | string;
  /** 入库库位名称 */
  locationName?: string;
  /** 入库人 user_id */
  operatorId?: number | string;
  /** 入库人姓名 */
  operatorName?: string;
  /** 备注 */
  remark?: string;
}

/** 三期合计（甲方 row92：通过三期标识统计三期的总入库 / 总出库） */
export interface ThirdPhaseSummaryVO {
  /** 三期总入库量(kg；BigDecimal 序列化为字符串，渲染前必须 Number() 转换) */
  totalIn?: number | string;
  /** 三期总出库量(kg；同上) */
  totalOut?: number | string;
}

/** 列表查询参数 */
export interface ThirdPhaseInQuery extends PageQuery {
  /** 入库日期起 yyyy-MM-dd */
  beginTime?: string;
  /** 入库日期止 yyyy-MM-dd */
  endTime?: string;
  /** 作物名称模糊 */
  cropName?: string;
}

/** 新增入库入参 */
export interface ThirdPhaseInForm {
  /** 入库产品 id（仅果蔬类原材料：belong_type=vegetable + product_attr=2） */
  productId: string;
  /** 入库量(kg，最多 3 位小数) */
  stockNum: number;
  /** 入库库位 id（锁死毛菜鲜品库 L0006） */
  locationId: string;
}
