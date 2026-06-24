/**
 * 农事记录 - 灾害子集类型定义（PLT-WORK-003）。
 *
 * 镜像后端 org.dromara.djs.plant.farm.domain.vo.FarmRecordsVo（灾害子集）。
 * ID 字段全 string（snowflake 19 位，Number 会截断，见 skill coder-djs-cross-layer-contract 契约 1）。
 */

export interface DisasterRecordVO {
  id: string;
  /** 灾害记录号 FRyyyyMMddNNNN */
  recordNo: string;
  plantId?: string;
  plotId?: string;
  /** service enrich：地块名 */
  plotName?: string;
  /** service enrich：地块编码 */
  plotCode?: string;
  /** service enrich：地块所属片区名 */
  plotZoneName?: string;
  /** 地块类型快照（字典 djs_plot_status） */
  plotType?: number;
  cropId?: string;
  cropName?: string;
  /** 农事类型（恒为 disaster） */
  farmType: string;
  /** 灾害发生日期 yyyy-MM-dd */
  farmDate?: string;
  /** 处理班组 ID */
  farmBy?: string;
  /** service enrich：处理班组名 */
  teamName?: string;
  /** 灾害类型（字典 djs_disaster_type：insect/wind/flood/drought/disease） */
  disasterType?: string;
  /** 损失率 0-100（已是百分比值，不需再 ×100） */
  lossRate?: number | string;
  /** 损失产量 kg */
  lossYield?: number | string;
  /** 预警标记（字典 djs_yes_no：1=是 / 2=否；loss_rate≥30 时为 1） */
  isWarning?: number;
  /** OSS bizType=plant_farm_proof 凭证图，逗号分隔 ossId */
  proofOssIds?: string;
  remark?: string;
  createTime?: string;
  createBy?: string;
}

export interface DisasterRecordQuery extends PageQuery {
  recordNo?: string;
  plotId?: number | string;
  /** 地块名称模糊搜索（后端经 plot_info 反查 plotId 列表后 IN 过滤；FarmRecordsQuery.plotName 已支持）。 */
  plotName?: string;
  /**
   * 地块编号模糊搜索（后端经 plot_info.plot_code like 反查 plotId 列表后 IN 过滤）。
   * 后端依赖：FarmRecordsQuery 需新增 plotCode 字段 + buildWrapper 反查，否则此参数不生效。
   */
  plotCode?: string;
  /** 地块片区筛选（后端经 plot_info.zone_id eq 反查 plotId 列表后 IN 过滤；FarmRecordsQuery.zoneId）。 */
  zoneId?: number | string;
  disasterType?: string;
  /**
   * 作物名 like 筛选（原型「请输入作物信息」）。
   * TODO(后端依赖)：后端 FarmRecordsQuery 目前仅有 cropId(eq)，无 crop_name like 字段；
   * 后端补 `private String cropName` + buildWrapper `.like(crop_name)` 前此参数不生效（见 D-FIX-22 _open-issues 后端依赖项）。
   */
  cropName?: string;
  /** 记录班组 ID（后端 FarmRecordsQuery.farmBy 已支持 eq 过滤）。 */
  farmBy?: number | string;
  /** 是否预警（1=是 / 2=否，字典 djs_yes_no）；列表 tag 仍用，筛选项已按原型移除。 */
  isWarning?: number;
  farmDateBegin?: string;
  farmDateEnd?: string;
}

/**
 * 农事记录 VO（PLT-WORK-002 admin 5 Tab 列表）。
 *
 * 镜像后端 org.dromara.djs.plant.farm.domain.vo.FarmRecordsVo。
 * 注意：后端 VO 的 `farmType` 字段承载的是 djs_farm_work_type 字典值（12 类农事类型），
 * 而非阶段（empty/grow/disaster）；阶段在 entity 的 farm_type 列、列表不直接展示。
 * ID 字段全 string（snowflake 19 位，见 skill coder-djs-cross-layer-contract 契约 1）。
 */
export interface FarmRecordVO {
  id: string;
  /** 农事记录号 FRyyyyMMddNNNN */
  recordNo: string;
  plantId?: string;
  plotId?: string;
  /** service enrich：地块名 */
  plotName?: string;
  /** service enrich：地块编码 */
  plotCode?: string;
  /** service enrich：地块所属片区名 */
  plotZoneName?: string;
  /** 地块类型快照（字典 djs_plot_status） */
  plotType?: number;
  cropId?: string;
  cropName?: string;
  /** 农事类型（字典 djs_farm_work_type 12 类） */
  farmType?: string;
  /** 农事日期 yyyy-MM-dd */
  farmDate?: string;
  /** 处理班组 ID */
  farmBy?: string;
  /** service enrich：处理班组名 */
  teamName?: string;
  /** 整地类型（字典 djs_tillage_type，仅整地类） */
  tillageType?: string;
  /** 整地方式（字典 djs_tillage_way，仅整地类） */
  tillageMethod?: string;
  /** 转移地块名（仅移栽类 transplant） */
  transplantPlotName?: string;
  /** 移栽百分比（仅移栽类） */
  transplantPercent?: number;
  /** 灾害类型（字典 djs_disaster_type，仅灾害类 disaster） */
  disasterType?: string;
  /** 损失率 0-100（仅灾害类，已是百分比值，不需再 ×100） */
  lossRate?: number | string;
  /** 损失产量 kg（仅灾害类） */
  lossYield?: number | string;
  /** OSS bizType=plant_farm_proof 凭证图，逗号分隔 ossId */
  proofOssIds?: string;
  remark?: string;
  createTime?: string;
  createBy?: string;
}

/**
 * 农事记录查询条件（PLT-WORK-002 admin 5 Tab 列表）。
 *
 * 镜像后端 FarmRecordsQuery 的 admin 列表子集。`farmWorkTypes` 为多选数组，
 * 5 Tab 切换时传入对应分组的 farm_work_type 字典值，后端走 IN 过滤。
 */
export interface FarmRecordQuery extends PageQuery {
  recordNo?: string;
  /** 5 Tab 分组对应的 farm_work_type 字典值多选（service IN 过滤） */
  farmWorkTypes?: string[];
  plotId?: number | string;
  /**
   * 地块编号模糊搜索（后端经 plot_info.plot_code like 反查 plotId 列表后 IN 过滤）。
   * 后端依赖：FarmRecordsQuery 需新增 plotCode 字段 + buildWrapper 反查，否则此参数不生效。
   */
  plotCode?: string;
  /** 地块名称模糊搜索（后端经 plot_info 反查 plotId 列表后 IN 过滤） */
  plotName?: string;
  /** 地块片区筛选（后端经 plot_info.zone_id eq 反查 plotId 列表后 IN 过滤；FarmRecordsQuery.zoneId）。 */
  zoneId?: number | string;
  /** 作物名称模糊搜索（后端 crop_name 已落主表，直接 like） */
  cropName?: string;
  /** 处理班组 ID */
  farmBy?: number | string;
  farmDateBegin?: string;
  farmDateEnd?: string;
}
