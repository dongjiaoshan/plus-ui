/**
 * 农场地图区块布局。
 *
 * 这里只描述**几何**，不描述"这块地是哪个片区"——后者是用户在绑定页点选后落库的
 * （`t_plant_farm_map_region.region_key ↔ zone_id`）。几何放代码、绑定放库，
 * 是因为视觉会反复调（改形状 = 普通 commit），而绑定是用户数据（必须落库）。
 *
 * 🔴 `key` 是业务码，**永不重编号**。改画法只能调形状或加新 key，
 * 不能把已有 key 挪去指另一块地——库里的绑定是按 key 找的。
 *
 * 坐标系 = 下面的 VIEW_BOX，与像素无关；SVG 的 viewBox 本身就保证了分辨率无关。
 * 所有区块必须落在 `FarmMapBase.vue` 的地界多边形 `LAND_OUTLINE` 内。
 *
 * 布局依据（片区名与地块数来自 t_plant_plot_zone / t_plant_plot_info）：
 * 区块面积按 `plots` 给权重——地块多的画大，读图时"块大 = 地多"符合直觉；
 * 块内还按 `plots` 打细分线，视觉上还原"一个片区装着 N 个地块"。
 * 一期 23 个片区（zone_belong='A'）在主体，二期 12 个（'B'）在东北臂，
 * 中间由河道分开。三期（'C'，1 个片区）不在这张导览图上，走「图外片区」。
 *
 * ⚠️ zone_belong 的 A/B/C = 一期/二期/三期；片区名里的 A1东 / B1 / C1 是一期内部的
 * 田块编号。两套 A/B/C 不是一回事——zone_belong='A' 里同时有叫 A1东、B1、C1 的片区。
 */

/** SVG 坐标系尺寸。贴着内容外接框取，留一点边距——放大了画布上就没有大片空白 */
export const VIEW_BOX = { width: 900, height: 720 } as const;

/** 地界多边形。区块都必须落在它里面，`FarmMapBase.vue` 按它描边 */
export const LAND_OUTLINE: Array<[number, number]> = [
  [70, 250],
  [330, 205],
  [560, 168],
  [655, 148],
  [690, 62],
  [745, 40],
  [835, 56],
  [860, 205],
  [856, 348],
  [838, 452],
  [786, 520],
  [700, 578],
  [600, 628],
  [486, 676],
  [388, 686],
  [296, 648],
  [208, 578],
  [132, 470],
  [88, 366]
];

export type RegionShape = { kind: 'rect'; x: number; y: number; w: number; h: number } | { kind: 'poly'; points: Array<[number, number]> };

/** 期别，对应 t_plant_plot_zone.zone_belong 的 A / B */
export type RegionPhase = 'p1' | 'p2';

export interface MapRegion {
  /** 稳定业务码，永不重编号 */
  key: string;
  /**
   * 预设参考名。画图时按这个片区的地块数定的大小，也是**未绑定时**图上显示的占位标签。
   * 一旦绑定成功，图上显示的是真实片区名（以绑定结果为准，不是这里的值）。
   */
  label: string;
  phase: RegionPhase;
  /** 该片区的地块数，只用于定尺寸和画块内细分线，不是业务数据 */
  plots: number;
  shape: RegionShape;
}

/** 一期：主体田块区（23 个片区） */
const PHASE_1: MapRegion[] = [
  // 地头：贴着北边界的斜条
  {
    key: 'R-P1-HEADLAND',
    label: '一期地头',
    phase: 'p1',
    plots: 1,
    shape: {
      kind: 'poly',
      points: [
        [150, 242],
        [645, 180],
        [645, 198],
        [150, 260]
      ]
    }
  },

  // 西边长廊——细长条，名字自带方位
  { key: 'R-P1-COR-W', label: '长廊2（西边长廊）', phase: 'p1', plots: 1, shape: { kind: 'rect', x: 140, y: 262, w: 14, h: 204 } },

  // 西列
  { key: 'R-P1-A1W', label: 'A1西', phase: 'p1', plots: 10, shape: { kind: 'rect', x: 162, y: 262, w: 238, h: 56 } },
  { key: 'R-P1-A2W', label: 'A2西', phase: 'p1', plots: 11, shape: { kind: 'rect', x: 162, y: 322, w: 238, h: 58 } },
  { key: 'R-P1-A3W', label: 'A3西', phase: 'p1', plots: 7, shape: { kind: 'rect', x: 162, y: 384, w: 238, h: 44 } },
  { key: 'R-P1-A4W', label: 'A4西', phase: 'p1', plots: 2, shape: { kind: 'rect', x: 162, y: 432, w: 238, h: 34 } },

  // 东列
  { key: 'R-P1-A1E', label: 'A1东', phase: 'p1', plots: 10, shape: { kind: 'rect', x: 410, y: 262, w: 230, h: 56 } },
  { key: 'R-P1-A2E', label: 'A2东', phase: 'p1', plots: 11, shape: { kind: 'rect', x: 410, y: 322, w: 230, h: 58 } },
  { key: 'R-P1-A3E', label: 'A3东', phase: 'p1', plots: 2, shape: { kind: 'rect', x: 410, y: 384, w: 230, h: 34 } },
  { key: 'R-P1-A4E', label: 'A4东', phase: 'p1', plots: 2, shape: { kind: 'rect', x: 410, y: 422, w: 230, h: 34 } },

  // 东边长廊
  { key: 'R-P1-COR-E', label: '长廊3（东边长廊）', phase: 'p1', plots: 1, shape: { kind: 'rect', x: 644, y: 262, w: 12, h: 194 } },

  { key: 'R-P1-A5', label: 'A5', phase: 'p1', plots: 2, shape: { kind: 'rect', x: 410, y: 460, w: 230, h: 22 } },

  // 水泥长廊：横向细条，把上面的大田块和下面的功能区分开
  { key: 'R-P1-COR-C', label: '长廊1（水泥长廊）', phase: 'p1', plots: 1, shape: { kind: 'rect', x: 285, y: 490, w: 355, h: 12 } },

  { key: 'R-P1-NURSERY', label: '育苗', phase: 'p1', plots: 7, shape: { kind: 'rect', x: 285, y: 508, w: 140, h: 54 } },
  { key: 'R-P1-PICK', label: '采摘', phase: 'p1', plots: 7, shape: { kind: 'rect', x: 435, y: 508, w: 140, h: 54 } },

  // B 排，宽度按地块数
  { key: 'R-P1-B1', label: 'B1', phase: 'p1', plots: 3, shape: { kind: 'rect', x: 285, y: 572, w: 78, h: 40 } },
  { key: 'R-P1-B2', label: 'B2', phase: 'p1', plots: 2, shape: { kind: 'rect', x: 369, y: 572, w: 52, h: 40 } },
  { key: 'R-P1-B3', label: 'B3', phase: 'p1', plots: 2, shape: { kind: 'rect', x: 427, y: 572, w: 52, h: 40 } },
  { key: 'R-P1-B4', label: 'B4', phase: 'p1', plots: 2, shape: { kind: 'rect', x: 485, y: 572, w: 52, h: 40 } },
  { key: 'R-P1-B5', label: 'B5', phase: 'p1', plots: 1, shape: { kind: 'rect', x: 543, y: 572, w: 26, h: 40 } },

  // C 排：偏西放，把南端出入口一带让给建筑群和垂钓区（对照导览图 ①②③④ 的位置）
  { key: 'R-P1-C1', label: 'C1', phase: 'p1', plots: 2, shape: { kind: 'rect', x: 310, y: 620, w: 47, h: 32 } },
  { key: 'R-P1-C2', label: 'C2', phase: 'p1', plots: 1, shape: { kind: 'rect', x: 363, y: 620, w: 24, h: 32 } },
  { key: 'R-P1-C3', label: 'C3', phase: 'p1', plots: 2, shape: { kind: 'rect', x: 393, y: 620, w: 47, h: 32 } }
];

/** 二期：东北臂大棚区（12 个片区） */
const PHASE_2: MapRegion[] = [
  { key: 'R-P2-HEADLAND', label: '二期地头', phase: 'p2', plots: 0, shape: { kind: 'rect', x: 702, y: 66, w: 126, h: 18 } },

  // 中区长廊：沿臂西侧纵贯
  { key: 'R-P2-COR-M', label: '长廊1（中区）', phase: 'p2', plots: 2, shape: { kind: 'rect', x: 688, y: 92, w: 12, h: 402 } },

  // 连栋棚 1-6：横向条带，高度按地块数
  { key: 'R-P2-G1', label: '连栋棚1', phase: 'p2', plots: 7, shape: { kind: 'rect', x: 704, y: 92, w: 126, h: 40 } },
  { key: 'R-P2-G2', label: '连栋棚2', phase: 'p2', plots: 10, shape: { kind: 'rect', x: 704, y: 136, w: 126, h: 50 } },
  { key: 'R-P2-G3', label: '连栋棚3', phase: 'p2', plots: 7, shape: { kind: 'rect', x: 704, y: 190, w: 126, h: 40 } },
  { key: 'R-P2-G4', label: '连栋棚4', phase: 'p2', plots: 9, shape: { kind: 'rect', x: 704, y: 234, w: 126, h: 46 } },
  { key: 'R-P2-G5', label: '连栋棚5', phase: 'p2', plots: 9, shape: { kind: 'rect', x: 704, y: 284, w: 126, h: 46 } },
  { key: 'R-P2-G6', label: '连栋棚6', phase: 'p2', plots: 7, shape: { kind: 'rect', x: 704, y: 334, w: 126, h: 40 } },

  { key: 'R-P2-OPEN', label: '连栋露地', phase: 'p2', plots: 2, shape: { kind: 'rect', x: 704, y: 378, w: 126, h: 22 } },
  { key: 'R-P2-SHED', label: '单体棚', phase: 'p2', plots: 14, shape: { kind: 'rect', x: 704, y: 404, w: 126, h: 54 } },
  { key: 'R-P2-D', label: 'D区', phase: 'p2', plots: 4, shape: { kind: 'rect', x: 704, y: 462, w: 96, h: 32 } },

  // 围墙长廊：沿臂东侧
  { key: 'R-P2-COR-E', label: '长廊2（围墙）', phase: 'p2', plots: 1, shape: { kind: 'rect', x: 834, y: 150, w: 10, h: 210 } }
];

export const MAP_REGIONS: MapRegion[] = [...PHASE_1, ...PHASE_2];

/** 区块中心点，用于放标签 */
export function regionCenter(shape: RegionShape): [number, number] {
  if (shape.kind === 'rect') return [shape.x + shape.w / 2, shape.y + shape.h / 2];
  const n = shape.points.length;
  const sum = shape.points.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
  return [sum[0] / n, sum[1] / n];
}

/** 区块外接框，用于判断标签放不放得下 */
export function regionBox(shape: RegionShape): { w: number; h: number } {
  if (shape.kind === 'rect') return { w: shape.w, h: shape.h };
  const xs = shape.points.map((p) => p[0]);
  const ys = shape.points.map((p) => p[1]);
  return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

/** SVG points 属性串 */
export function toPointsAttr(shape: RegionShape): string {
  if (shape.kind === 'rect') {
    const { x, y, w, h } = shape;
    return `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
  }
  return shape.points.map(([x, y]) => `${x},${y}`).join(' ');
}

/**
 * 块内地块细分线：把区块沿长边等分成 `plots` 份。
 *
 * 只是视觉纹理——让一个片区看得出"里面装着 N 个地块"，跟真实地块边界无关，
 * 也不可点击（真正选地块在弹出的排产抽屉里）。太小的块不画，免得糊成一团。
 */
export function regionDividers(region: MapRegion): Array<[number, number, number, number]> {
  const { shape, plots } = region;
  if (shape.kind !== 'rect' || plots < 2) return [];
  const { x, y, w, h } = shape;
  const vertical = w >= h;
  const span = vertical ? w : h;
  // 每份窄于 5 个单位就不画了，画出来是一团黑
  if (span / plots < 5) return [];
  const lines: Array<[number, number, number, number]> = [];
  for (let i = 1; i < plots; i++) {
    const offset = (span / plots) * i;
    lines.push(vertical ? [x + offset, y, x + offset, y + h] : [x, y + offset, x + w, y + offset]);
  }
  return lines;
}
