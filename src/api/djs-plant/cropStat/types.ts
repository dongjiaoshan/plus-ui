/**
 * 作物「在田地块」聚合统计类型。
 *
 * 后端：org.dromara.djs.plant.cropstat.controller.CropPlotStatController  GET /djs/plant/crop-stat/plot
 */

/**
 * 按作物聚合的在田地块统计行。
 *
 * 口径：只统计**当前处于种植 / 采摘中 / 采摘完成三态**的地块——即地块尚未退茬
 * （`t_plant_plot_info.plot_status IN (2,3)`，`djs_plot_status` 没有独立的「采摘完成」态，
 * 采摘完成后地块仍停在 3 直到退茬回 1）且本轮已实际播种；每块地只取当前轮明细，历史轮次不重复计数。
 *
 * 与果蔬产品行按作物主产品（作物产品配置首行）关联，
 * 匹配规则 `primaryProductId === String(product.productMaterial ?? product.id)`
 * （加工成品走 productMaterial 回落到基础菜，基础果蔬自身即原材料）。
 * 同一产品出现多次时累加 remainPlotCount / expectYield，日期取 min / max。
 */
export interface CropPlotStatVO {
  /** 作物 ID（雪花，后端序列化为字符串） */
  cropId: string;
  /** 作物名称 */
  cropName: string;
  /** 作物主产品 ID（作物产品配置首行，雪花，后端序列化为字符串） */
  primaryProductId: string | null;
  /** 剩余地块数（在田地块块数） */
  remainPlotCount: number;
  /** 预计产量合计 kg */
  expectYield: number | null;
  /** 最早可采摘日期 yyyy-MM-dd */
  earliestPickDate: string | null;
  /** 最晚可采摘日期 yyyy-MM-dd */
  latestPickDate: string | null;
}
