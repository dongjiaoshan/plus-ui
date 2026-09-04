/**
 * 农场地图类型定义（PLT-FARMMAP-001）。
 *
 * 镜像后端 org.dromara.djs.plant.farmmap.domain.vo.*。
 *
 * ID 字段（plotId / id）全 string（snowflake 19 位，Number 会截断，见 skill
 * coder-djs-cross-layer-contract 契约 1）。
 *
 * 图上格子的**几何**不在这儿——它在 views/djs-plant/farmmap/map/regions.generated.ts，
 * 由描图脚本从甲方地图生成、随前端发版。这里只有「哪个格子挂了哪块地」。
 */

/** 已挂地块的格子。未挂的格子后端不返回，前端按「未挂」画。 */
export interface FarmMapRegionVO {
  /** 图上格子业务码，对应 regions.generated.ts 的 key。 */
  regionKey: string;
  /** 地块 id。 */
  plotId: string;
  plotCode?: string;
  plotName?: string;
  zoneName?: string;
  /** 所属大区（字典 djs_zone_belong：A=一期基地 / B=二期基地）。 */
  zoneBelong?: string;
  /** 地块类型（字典 djs_plot_type）。 */
  plotType?: string;
  /** 地块状态（字典 djs_plot_status：1=空闲 / 2=种植 / 3=采摘）。图上着色按它。 */
  plotStatus?: number;
  /** 面积（亩）。 */
  plotArea?: number;
}

/** 图外地块：还没挂到图上的地块，同时也是绑定时的候选列表。 */
export interface FarmMapUnboundPlotVO {
  id: string;
  plotCode?: string;
  plotName?: string;
  zoneName?: string;
  zoneBelong?: string;
}

/** 一次性拉全：已挂格子 + 图外地块 + 覆盖率。 */
export interface FarmMapOverviewVO {
  regions: FarmMapRegionVO[];
  unboundPlots: FarmMapUnboundPlotVO[];
  /** 地块总数。 */
  plotTotal: number;
  /** 已挂数量。boundCount / plotTotal = 页面顶部那个覆盖率。 */
  boundCount: number;
}

/** 绑定入参。 */
export interface FarmMapBindBody {
  regionKey: string;
  plotId: string;
}
