/**
 * 公开追溯 H5 类型定义（C 端顾客扫码落地页消费）。
 *
 * 与后端 org.dromara.djs.warehouse.trace.pub.domain.vo.PublicTraceVo 对齐。
 * 公开端点 GET /djs/public/trace/{traceCode}（@SaIgnore 无登录）一次性聚合一条追溯码全链路。
 * 图片 imageUrl 已是后端解析的可访问 URL（非 ossId）；codeType / traceContent / medications.type
 * / plotRecords.workType 是原码值字符串，前端做中文映射（见 labels.ts）。
 */

/** 通用产品信息块（三业态共用）。 */
export interface TraceProductVo {
  /** 产品名称 */
  name?: string;
  /** 规格 */
  spec?: string;
  /** 净重（V1 无独立列，从 spec 推断兜底，可能为 null） */
  weight?: string;
  /** 产品描述 */
  description?: string;
  /** 产品图可访问 URL（后端解析；无图为 null） */
  imageUrl?: string;
  /** 追溯码（= produce_code 业务码 string） */
  produceCode?: string;
  /** 打包日期（V1 无独立列，用追溯码生成时间兜底） */
  packDate?: string;
  /** 生长天数（veg 专属，源 trace_code.plant_days） */
  growthDays?: number;
  /** 来源地块名（veg 专属，源 plot_info.plot_name） */
  plotName?: string;
  /** 采摘日期（veg 专属，源 trace_code.havest_date） */
  harvestDate?: string;
}

/** 时间轴节点。 */
export interface TraceEventVo {
  /** 节点类型原码值（marketing/singe/slaughter/acid/in_stock/ship/arrival，前端映射中文） */
  traceContent?: string;
  /** 节点时间 */
  traceTime?: string;
  /** 操作人姓名（后端已翻译，无裸 id） */
  operatorName?: string;
  /** 该节点工序重量 kg（后端解析 event_data 的 weight；有才展示「· 5.20kg」） */
  weight?: string;
}

/** 猪只信息块（pork 专属）。 */
export interface TracePigVo {
  /** 耳号 */
  earNo?: string;
  /** 性别码（F=母 M=公，前端映射中文） */
  sex?: string;
  /** 体重 kg（最新一条生长记录） */
  weight?: string;
  /** 猪只照片可访问 URL（后端解析；无图为 null） */
  photoUrl?: string;
  /** 品种码（前端映射中文） */
  breed?: string;
  /** 出生日期 */
  birthDate?: string;
  /** 日龄（出栏日 − 出生日，天；任一缺为 null） */
  ageDays?: number;
  /** 出栏日期（Pig 无列，用 marketing 事件时间兜底，可能为 null） */
  marketDate?: string;
  /** 所属农场名 */
  farmName?: string;
  /** 栋舍名（用生长记录冗余兜底，可能为 null） */
  barnName?: string;
}

/** 生长记录行（pork 专属）。 */
export interface TraceGrowthRecordVo {
  /** 测量日期 */
  date?: string;
  /** 日龄（测量日 − 出生日，天；出生日缺为 null） */
  ageDays?: number;
  /** 体重（kg） */
  weight?: string;
  /** 背膘厚（mm） */
  backfat?: string;
  /** 操作人姓名（后端已翻译，无裸 id） */
  operatorName?: string;
  /** 猪只照片可访问 URL（后端解析；无图为 null） */
  photoUrl?: string;
}

/** 用药 / 疫苗保健记录行（pork 专属）。 */
export interface TraceMedicationVo {
  /** 用药日期 */
  date?: string;
  /** 日龄（用药日 − 出生日，天；出生日缺为 null） */
  ageDays?: number;
  /** 药品名称 */
  name?: string;
  /** 用药类型原码值（health/treatment/vaccine，前端映射中文） */
  type?: string;
  /** 用药原因（可能为 null） */
  reason?: string;
  /** 操作人姓名（后端已翻译，无裸 id） */
  operatorName?: string;
}

/** 谱系块（pork 专属：父系 / 母系信息）。父母耳号全空 → 后端整块返 null。 */
export interface TracePedigreeVo {
  /** 父系耳号 */
  sireEarNo?: string;
  /** 父系品种 label（后端已翻译） */
  sireBreed?: string;
  /** 父系日龄（天） */
  sireAgeDays?: number;
  /** 母系耳号 */
  damEarNo?: string;
  /** 母系品种 label（后端已翻译） */
  damBreed?: string;
  /** 母系日龄（天） */
  damAgeDays?: number;
  /** 母系胎次 */
  damParity?: number;
}

/** 检疫信息块（pork 专属；V1 数据源缺口，恒 null → 前端空判隐藏）。 */
export interface TraceQuarantineVo {
  /** 检疫证号 */
  certNo?: string;
  /** 检疫机构 */
  agency?: string;
}

/** 门店信息块。 */
export interface TraceStoreVo {
  /** 门店名 */
  name?: string;
  /** 门店地址 */
  address?: string;
}

/** 作物信息块（veg 专属）。 */
export interface TraceCropVo {
  /** 作物名称 */
  name?: string;
  /** 品种（V1 可能 null） */
  variety?: string;
}

/** 地块信息块（veg 专属）。 */
export interface TracePlotVo {
  /** 地块名 */
  plotName?: string;
  /** 片区名 */
  zoneName?: string;
  /** 面积 */
  area?: string;
}

/** 地块农事记录行（veg 专属）。 */
export interface TracePlotRecordVo {
  /** 农事日期 */
  date?: string;
  /** 农事类型原码值（前端映射中文） */
  workType?: string;
  /** 详情（备注） */
  detail?: string;
  /** 记录人姓名（后端已翻译，无裸 id） */
  operatorName?: string;
}

/** 有机认证证书行（veg 专属）。 */
export interface TraceOrganicCertVo {
  /** 证书类型：crop（果蔬/作物有机证）| plot（地块有机证） */
  certType?: string;
  /** 证书图可访问 URL（后端解析；无图为 null） */
  imageUrl?: string;
  /** 颁发机构 */
  issuer?: string;
  /** 证书编号 */
  certNo?: string;
  /** 有效期起（V1 留 null） */
  validFrom?: string;
  /** 有效期止 */
  validTo?: string;
}

/** 地块历史种植作物行（veg 专属）。 */
export interface TracePlotCropHistoryVo {
  /** 作物名称 */
  cropName?: string;
  /** 生长天数（采摘日 − 种植日；任一缺为 null） */
  growthDays?: number;
  /** 种植日期 */
  startDate?: string;
  /** 采摘日期（实际优先，缺则计划） */
  endDate?: string;
  /** 作物图可访问 URL（后端解析；无图为 null） */
  imageUrl?: string;
}

/** 礼盒子产品行（gift 专属；V1 恒 []）。 */
export interface TraceComponentVo {
  /** 子产品业态：pork | veg（下钻路由依据） */
  subType?: string;
  /** 子追溯码（下钻到对应子追溯页） */
  subTraceCode?: string;
  /** 子产品名称 */
  productName?: string;
}

/**
 * 公开追溯聚合 VO（顶层）。前端按 codeType 路由到 pork/veg/gift 渲染。
 * pork 分支字段 veg/gift 时为 null，反之亦然。
 */
export interface PublicTraceVo {
  /** 追溯码类型原值（前端路由依据） */
  codeType: 'pork' | 'veg' | 'gift';
  /** 通用产品信息块 */
  product?: TraceProductVo;
  /** 流程时间轴（按 traceTime 倒序，节点数 = 实际 event 行数） */
  timeline?: TraceEventVo[];
  // ── pork 专属 ──
  pig?: TracePigVo;
  growthRecords?: TraceGrowthRecordVo[];
  medications?: TraceMedicationVo[];
  /** 谱系（父系/母系；无父母耳号 → 后端整块返 null，前端隐藏） */
  pedigree?: TracePedigreeVo;
  quarantine?: TraceQuarantineVo;
  store?: TraceStoreVo;
  // ── veg 专属 ──
  crop?: TraceCropVo;
  plot?: TracePlotVo;
  plotRecords?: TracePlotRecordVo[];
  /** 该地块历史种植作物（与 plotRecords 农事记录并存；无记录 → 空 list） */
  plotCropHistory?: TracePlotCropHistoryVo[];
  organicCerts?: TraceOrganicCertVo[];
  // ── gift 专属 ──
  components?: TraceComponentVo[];
}
