/**
 * 农场地图几何的对外入口。
 *
 * 几何本体在 `regions.generated.ts`——由 `scripts/trace-farmmap.py` 从甲方那张农场地图
 * （`doc-phase2/_input/map.png`）描出来，**不要手改那个文件**；要改形状就调脚本参数重跑。
 * 本文件只放消费侧要用的纯函数，好让生成物保持"只有数据、没有逻辑"，重跑不会覆盖掉手写代码。
 *
 * 分工：**几何在代码、绑定在库**。
 * 改画法 = 改代码 = 发一次版（低频，形状不会天天变）；
 * 「这个格子是哪块地」= 用户在页面上点、落 `t_plant_farm_map_region`（随时可改，不发版）。
 */

export { VIEW_BOX, MAP_REGIONS, MAP_DECOR } from './regions.generated';
export type { MapRegion, RegionPalette } from './regions.generated';

import type { MapRegion } from './regions.generated';

/** 区块中心点，用于放标签 */
export function regionCenter(region: MapRegion): [number, number] {
  const [x, y, w, h] = region.box;
  return [x + w / 2, y + h / 2];
}

/** SVG points 属性串 */
export function toPointsAttr(points: Array<[number, number]>): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

/**
 * 这块地在当前缩放下放不放得下标签。
 *
 * 判据用**屏幕尺寸**（几何尺寸 × 缩放）而不是几何尺寸，于是那些窄条田在放大后会
 * 自动显出名字——这正是缩放该有的用处。
 */
export function labelFits(region: MapRegion, scale: number): boolean {
  const [, , w, h] = region.box;
  return w * scale >= 40 && h * scale >= 16;
}
