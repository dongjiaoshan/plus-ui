/**
 * 需求 7 业态元数据（DJS-FIX-WMS-RALN-C 单页 7 tab）。
 *
 * label 从字典 djs_demand_product_type 取（不新增 i18n key）；color / 排产去向 / 是否有原材料
 * 按业态硬映射。tab 列差异（shipped / raw 显隐）由 index.vue 用本文件的派生函数决定。
 */
import type { DemandProductType } from '@/api/djs-warehouse/demand/types';

/** 7 业态固定顺序（与原型「新增需求」tab 顺序逐字对齐）。 */
export const DEMAND_PRODUCT_TYPES: DemandProductType[] = ['white_bar', 'pig', 'vegetable', 'dry', 'egg', 'gift_box', 'other'];

/** label 兜底（字典未加载时用；正常走字典 dictLabel）。 */
const FALLBACK_LABEL: Record<DemandProductType, string> = {
  white_bar: '白条',
  pig: '猪',
  vegetable: '果蔬',
  dry: '干货',
  egg: '鸡蛋',
  gift_box: '礼盒',
  other: '其他'
};

const COLOR: Record<DemandProductType, 'danger' | 'success' | 'warning' | 'info'> = {
  white_bar: 'danger',
  pig: 'danger',
  vegetable: 'success',
  dry: 'info',
  egg: 'warning',
  gift_box: 'warning',
  other: 'info'
};

/** 排产去向（doc/02 §需求拆解；DB 无字段，前端展示）。 */
const DESTINATION: Record<DemandProductType, string> = {
  white_bar: '分割间 / 肉品打包间',
  pig: '分割间 / 肉品打包间',
  vegetable: '菜品打包间',
  dry: '其他产品打包',
  egg: '其他产品打包',
  gift_box: '礼盒打包',
  other: '其他产品打包'
};

/** 白条 / 蔬菜业态保留原材料描述 + 计算量。 */
export function demandTypeHasRaw(type: DemandProductType): boolean {
  return type === 'white_bar' || type === 'vegetable';
}

/** 白条 / 猪业态支持「指定猪只」。 */
export function demandTypeHasPigAssign(type: DemandProductType): boolean {
  return type === 'white_bar' || type === 'pig';
}

/** 从字典选项里取 label，找不到回退到内置中文。 */
export function demandTypeLabel(type: DemandProductType, dictOptions?: Array<{ value: string; label: string }>): string {
  const hit = dictOptions?.find((d) => d.value === type);
  return hit?.label ?? FALLBACK_LABEL[type] ?? type;
}

export function demandTypeColor(type: DemandProductType): 'danger' | 'success' | 'warning' | 'info' {
  return COLOR[type] ?? 'info';
}

export function demandTypeDestination(type: DemandProductType): string {
  return DESTINATION[type] ?? '—';
}
