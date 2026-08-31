/**
 * 作物需求 / 需求反馈 两个页面共享的列定义、搜索 schema 与小工具（V6-R152 + V6-R153）。
 *
 * 运营端 `views/djs-ops/cropDemand/index.vue`（提需求）与种植端
 * `views/djs-plant/demandFeedback/index.vue`（回需求）搜索条件与列表列完全一致，
 * 只有工具栏与操作列不同 —— 所以这里只抽「列 + 搜索 schema + 图片解析」，
 * 两个页面各写各的模板，不做 mode 开关的巨型组件。
 *
 * 数据主权在 plant 模块（表 t_plant_crop_demand / 接口 /djs/plant/cropDemand），
 * 故本文件落在 djs-plant 下，运营端反向 import。
 */

import type { BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import { listByIds as listOssByIds } from '@/api/system/oss';

/** 需求分类字典。 */
export const DEMAND_CATEGORY_DICT = 'djs_plant_demand_category';

/** 需求状态字典（待回复 / 已回复）。 */
export const DEMAND_STATUS_DICT = 'djs_plant_demand_status';

/** 两个页面都要预载的字典。 */
export const DEMAND_DICT_TYPES = [DEMAND_CATEGORY_DICT, DEMAND_STATUS_DICT];

/** 需求图片上传的 OSS bizType（后端 ALLOWED_BIZ_TYPES 白名单里有同名值）。 */
export const DEMAND_OSS_BIZ_TYPE = 'plant_demand';

/** i18n 取词函数（只用「key → 文案」这一种形态，避免引入 any）。 */
export type DemandTranslate = (key: string) => string;

/**
 * 搜索表单默认值形状（daterange 绑成 [start, end]）。
 *
 * 写成 type 而非 interface：BizTable 的 `search-model` prop 类型是 `Record<string, any>`，
 * interface 拿不到隐式索引签名会赋值报错，type alias 可以。
 */
export type DemandSearchModel = {
  demandContent?: string;
  demandCategory?: string;
  demandStatus?: string;
  demandDateRange?: [string, string];
};

/**
 * 搜索表单初始值。
 *
 * `demandStatus` 取 `''` 而非 undefined：状态下拉首位有显式「全部」（value `''`），
 * 进页面即选中它，显示「全部」而不是占位符，此时查询不带 demandStatus。
 */
export function createDemandSearchModel(): DemandSearchModel {
  return {
    demandContent: undefined,
    demandCategory: undefined,
    demandStatus: '',
    demandDateRange: undefined
  };
}

/**
 * 搜索条件（甲方 row152/row153 口径完全一致）：
 * 需求内容（模糊）/ 需求分类（字典下拉）/ 状态（全部 / 待回复 / 已回复）/ 需求日期（范围）。
 *
 * 状态下拉 `allOption` 显式给出「全部」（甲方逐字列了这一项），选中它 = 不带 demandStatus 过滤；
 * 「全部」本身就是清空语义，故 `clearable: false`，避免清空后回落到占位符、两种「全部」表达并存。
 * 需求分类甲方只写了「取字典项的内容」，没列「全部」，故不加 —— 保持与甲方原话一致。
 */
export function buildDemandSearchSchema(t: DemandTranslate): SearchFieldSchema[] {
  return [
    { field: 'demandContent', label: t('cropDemand.field.demandContent'), type: 'input', placeholder: t('cropDemand.placeholder.demandContent') },
    { field: 'demandCategory', label: t('cropDemand.field.demandCategory'), type: 'select', dictType: DEMAND_CATEGORY_DICT, clearable: true },
    {
      field: 'demandStatus',
      label: t('cropDemand.field.demandStatus'),
      type: 'select',
      dictType: DEMAND_STATUS_DICT,
      allOption: true,
      clearable: false
    },
    { field: 'demandDateRange', label: t('cropDemand.field.demandDate'), type: 'daterange' }
  ];
}

/**
 * 列表列（甲方口径：需求日期 / 需求分类 / 需求内容 / 需求状态 / 回复内容 /
 * 需求创建时间 / 创建人 / 回复时间 / 回复人；操作列由各页面自己的 `#action` slot 出）。
 */
export function buildDemandColumns(t: DemandTranslate): BizTableColumn[] {
  return [
    { prop: 'demandDate', label: t('cropDemand.column.demandDate'), minWidth: 120, align: 'center' },
    { prop: 'demandCategory', label: t('cropDemand.column.demandCategory'), minWidth: 120, align: 'center', dictType: DEMAND_CATEGORY_DICT },
    { prop: 'demandContent', label: t('cropDemand.column.demandContent'), minWidth: 220, showOverflowTooltip: true },
    { prop: 'demandStatus', label: t('cropDemand.column.demandStatus'), minWidth: 110, align: 'center', dictType: DEMAND_STATUS_DICT },
    { prop: 'replyContent', label: t('cropDemand.column.replyContent'), minWidth: 220, showOverflowTooltip: true },
    { prop: 'createTime', label: t('cropDemand.column.createTime'), minWidth: 160, align: 'center', formatter: 'datetime' },
    { prop: 'createByName', label: t('cropDemand.column.createByName'), minWidth: 110, align: 'center' },
    { prop: 'replyTime', label: t('cropDemand.column.replyTime'), minWidth: 160, align: 'center', formatter: 'datetime' },
    { prop: 'replyByName', label: t('cropDemand.column.replyByName'), minWidth: 110, align: 'center' }
  ];
}

/** daterange 绑成 [start, end]，拆成后端要的 beginDate / endDate。 */
export function demandDateRangeOf(v: unknown): { beginDate?: string; endDate?: string } {
  if (!Array.isArray(v) || v.length !== 2) {
    return {};
  }
  return {
    beginDate: typeof v[0] === 'string' && v[0] ? v[0] : undefined,
    endDate: typeof v[1] === 'string' && v[1] ? v[1] : undefined
  };
}

/**
 * 把逗号分隔的 ossId 串解析成可预览的 url 列表。
 *
 * ossId 是 19 位雪花，全链路保持 string，禁 Number()。
 */
export async function resolveDemandImageUrls(imageOssIds?: string): Promise<string[]> {
  const ids = (imageOssIds ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    return [];
  }
  try {
    const res = await listOssByIds(ids.join(','));
    const map = new Map<string, string>();
    (res.data ?? []).forEach((o) => {
      if (o?.ossId != null && o?.url) {
        map.set(String(o.ossId), o.url);
      }
    });
    return ids.map((id) => map.get(id)).filter((u): u is string => !!u);
  } catch (e) {
    console.warn('[CropDemand] listOssByIds failed', e);
    return [];
  }
}
