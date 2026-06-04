/**
 * 种植看板配色 / 常量（PLT-DASH-001）。
 *
 * 甘特段配色：种植段绿 / 采摘段黄（与 i18n plantDashboard.chart 段配套）。
 * 农事类型中文 label 优先走 djs_farm_work_type 字典（12-13 类，硬编码易漏），
 * 字典缺失时落本文件 fallback 映射。
 */

/** 甘特段配色：种植绿 / 采摘黄 */
export const GANTT_COLOR = {
  plant: '#2ea36c', // 绿 — 种植段
  pick: '#e6a23c' // 黄 — 采摘段
} as const;

export type GanttType = keyof typeof GANTT_COLOR;

/** 取甘特段类型对应颜色，未知落 plant */
export function ganttColor(type?: string | null): string {
  return type === 'pick' ? GANTT_COLOR.pick : GANTT_COLOR.plant;
}

/** 当月完成率柱状图配色（达标绿 / 偏低橙），阈值 80% */
export const COMPLETION_COLOR = {
  good: '#2ea36c',
  low: '#e6a23c'
} as const;

/** 完成率达标阈值（0~1），≥ 该值用 good 色 */
export const COMPLETION_GOOD_THRESHOLD = 0.8;

/**
 * 农事类型 label fallback（与 djs_farm_work_type 字典对齐，字典缺失时兜底）。
 */
export const FARM_TYPE_LABELS: Record<string, string> = {
  tillage_break: '翻耕',
  tillage_prepare: '整地',
  fertilize: '施肥',
  transplant: '移栽',
  water_fertilize: '水肥',
  irrigation: '浇灌',
  weed: '除草',
  pest_control: '病虫防治',
  pruning: '整枝绑蔓',
  rotation: '退茬',
  disaster: '灾害损失',
  harvest_activity: '采摘活动'
};

/** 5 分钟轮询周期（毫秒） */
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
