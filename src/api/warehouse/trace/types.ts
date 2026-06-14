/**
 * 追溯码管理类型定义（TRC-ADMIN-001，admin only 无 mp）。
 *
 * 与后端 org.dromara.djs.warehouse.trace.domain.* 对齐。
 * id / productId / storeId / plotId / farmId / cropCertId / plotCertId / createBy / operatorId
 * 全 string（snowflake JS 精度问题，参 .claude/skills/coder-djs-cross-layer-contract.md §契约 1）。
 * codeType 列实存 pork/veg/gift（字典 djs_trace_code_type，非数字）；
 * traceContent 列实存 marketing/singe/slaughter/acid/in_stock/ship/arrival...（字典 djs_trace_content）。
 */

/** 追溯码列表行 VO（主表字段 + service 内存 JOIN 出的展示名）。 */
export interface TraceCodeVO {
  id: string;
  /** 追溯码（produce_code，TRC-CORE genCode 生成） */
  produceCode: string;
  /** 追溯码类型（字典 djs_trace_code_type，值 pork/veg/gift） */
  codeType: string;
  productId?: string;
  /** 产品名（service JOIN t_warehouse_product_info 取） */
  productName?: string;
  /** 产品规格（JOIN product，码样式页展示重量/规格） */
  productSpec?: string;
  /** 产品图 OSS ID（JOIN product，详情 ImagePreview 用） */
  productImg?: string;
  /** 猪只耳号（猪肉追溯链） */
  pigEarNo?: string;
  plotId?: string;
  /** 地块名（JOIN t_plant_plot_info 取） */
  plotName?: string;
  /** 种植天数 */
  plantDays?: number;
  /** 采收日期 yyyy-MM-dd */
  harvestDate?: string;
  cropCertId?: string;
  plotCertId?: string;
  storeId?: string;
  /** 门店名（JOIN t_md_store 取，门店非字典不能 dict-tag） */
  storeName?: string;
  farmId?: string;
  /** 农场名（JOIN sys_farm 取） */
  farmName?: string;
  qrOssId?: string;
  remark?: string;
  createBy?: string;
  /** 生成人姓名（USER_ID_TO_NAME 翻译） */
  creatorName?: string;
  /** 生成时间 yyyy-MM-dd HH:mm:ss */
  createTime?: string;
  // —— 原型「果蔬追溯码管理」产出流字段（STORE-TRACE-ONSITE-001，service 聚合 trace_event/产出记录）——
  /** 到店日期（trace_event arrival 事件时间） */
  arrivalDate?: string;
  /** 生产编号（produce_no） */
  produceNo?: string;
  /** 序号（生产编号末段流水号） */
  serialNo?: number;
  /** 实际重量 kg（产出记录 produce_quantity） */
  actualWeight?: number;
  /** 采摘时间（trace_event pick 事件时间） */
  pickTime?: string;
  /** 月台接收时间（trace_event in_stock 事件时间） */
  platformReceiveTime?: string;
  /** 发货时间（trace_event ship 事件时间） */
  shipTime?: string;
}

/** 单条事件流水 VO（时间轴节点，immutable 只读）。 */
export interface TraceEventVO {
  id: string;
  produceCode: string;
  /** 事件类型（字典 djs_trace_content，值 marketing/singe/...） */
  traceContent: string;
  /** 事件时间 yyyy-MM-dd HH:mm:ss（时间轴排序键） */
  traceTime?: string;
  /** 事件上下文 JSON（V1 多 NULL） */
  eventData?: string;
  operatorId?: string;
  /** 操作人姓名（USER_ID_TO_NAME 翻译） */
  operatorName?: string;
  createTime?: string;
}

/** 追溯码详情聚合 VO（主表全字段 + 完整事件时间轴）。 */
export interface TraceCodeDetailVO extends TraceCodeVO {
  /** 完整事件时间轴（按 trace_time 升序，节点数 driven by 实际 event 行） */
  events?: TraceEventVO[];
}

/** 追溯码列表查询（PageQuery 全局类型已自动注入）。 */
export interface TraceCodeQuery extends PageQuery {
  /** 追溯码类型（tab 切换传 pork/veg/gift） */
  codeType?: string;
  /** 追溯码模糊查 */
  produceCode?: string;
  /** 产品名模糊查（主表无此列，service JOIN 后内存过滤） */
  productName?: string;
  /** 猪只耳号精确查 */
  pigEarNo?: string;
  /** 生成时间起 yyyy-MM-dd HH:mm:ss */
  beginDate?: string;
  /** 生成时间止 yyyy-MM-dd HH:mm:ss */
  endDate?: string;
  /** 到店日期起 yyyy-MM-dd HH:mm:ss（按 trace_event arrival 事件过滤，果蔬默认当天到店） */
  arrivalBeginDate?: string;
  /** 到店日期止 yyyy-MM-dd HH:mm:ss（按 trace_event arrival 事件过滤） */
  arrivalEndDate?: string;
}
