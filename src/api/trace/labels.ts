/**
 * 公开追溯 H5 码值 → 中文 label 映射（C 端展示）。
 *
 * 后端 traceContent / medications.type / plotRecords.workType / pig.breed / pig.sex 返原码值，
 * 前端做中文展示。i18n key 走 tracePublic.* 块（zh_CN.ts / en_US.ts 双语，强约束 §6.9）；
 * 未知码兜底返原码值，避免空白。
 */
import i18n from '@/lang';

const t = (key: string): string => i18n.global.t(key) as string;

/** 时间轴节点类型码 → i18n key 后缀。 */
const TRACE_CONTENT_KEYS: Record<string, string> = {
  marketing: 'marketing',
  singe: 'singe',
  white_bar_in: 'whiteBarIn',
  white_bar_pick: 'whiteBarPick',
  slaughter: 'slaughter',
  acid: 'acid',
  in_stock: 'inStock',
  ship: 'ship',
  arrival: 'arrival',
  sowing: 'sowing',
  harvest: 'harvest',
  veg_handle: 'vegHandle',
  pack: 'pack'
};

/** 用药类型码 → i18n key 后缀。 */
const MEDICATION_TYPE_KEYS: Record<string, string> = {
  health: 'health',
  treatment: 'treatment',
  vaccine: 'vaccine'
};

/** 农事类型码 → i18n key 后缀（对齐后端 djs_farm_work_type 12 类）。 */
const FARM_WORK_TYPE_KEYS: Record<string, string> = {
  tillage_break: 'tillageBreak',
  tillage_prepare: 'tillagePrepare',
  fertilize: 'fertilize',
  transplant: 'transplant',
  water_fertilize: 'waterFertilize',
  irrigation: 'irrigation',
  weed: 'weed',
  pest_control: 'pestControl',
  pruning: 'pruning',
  rotation: 'rotation',
  disaster: 'disaster',
  harvest_activity: 'harvestActivity'
};

/** 猪只性别码 → i18n key 后缀（F=母 M=公）。 */
const PIG_SEX_KEYS: Record<string, string> = {
  F: 'female',
  M: 'male'
};

/** 猪只品种码 → i18n key 后缀（V1 已知 black=黑猪；未知码兜底返原值）。 */
const PIG_BREED_KEYS: Record<string, string> = {
  black: 'black'
};

/** traceContent 码 → 中文 label（未知码返原码值）。 */
export function traceContentLabel(code?: string): string {
  if (!code) return '';
  const key = TRACE_CONTENT_KEYS[code];
  return key ? t(`tracePublic.content.${key}`) : code;
}

/** medications.type 码 → 中文 label（未知码返原码值）。 */
export function medicationTypeLabel(code?: string): string {
  if (!code) return '';
  const key = MEDICATION_TYPE_KEYS[code];
  return key ? t(`tracePublic.medType.${key}`) : code;
}

/** plotRecords.workType 码 → 中文 label（未知码返原码值）。 */
export function farmWorkTypeLabel(code?: string): string {
  if (!code) return '';
  const key = FARM_WORK_TYPE_KEYS[code];
  return key ? t(`tracePublic.workType.${key}`) : code;
}

/** pig.sex 码 → 中文 label（未知码返原码值）。 */
export function pigSexLabel(code?: string): string {
  if (!code) return '';
  const key = PIG_SEX_KEYS[code];
  return key ? t(`tracePublic.pigSex.${key}`) : code;
}

/** pig.breed 码 → 中文 label（未知码返原码值）。 */
export function pigBreedLabel(code?: string): string {
  if (!code) return '';
  const key = PIG_BREED_KEYS[code];
  return key ? t(`tracePublic.pigBreed.${key}`) : code;
}
