import { ref } from 'vue';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listLocation } from '@/api/djs-warehouse/location';
import type { LocationInfoVO } from '@/api/djs-warehouse/location/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { listPlot } from '@/api/djs-plant/plot';
import type { PlotInfoVO } from '@/api/djs-plant/plot/types';
import {
  listAvailableBars,
  listSourceDry,
  listSourceMeat,
  listSourceVeg,
  listSourceWhiteBar,
  listVegProductsByMaterial
} from '@/api/djs-warehouse/packEntry';
import type { BarInfoVO, PackSourceVO } from '@/api/djs-warehouse/packEntry';

/**
 * 打包/分割录入页共享选项加载（A5）。
 *
 * 目标产品 SKU / 库位 / 门店一次性拉全量（≤ 500）做下拉，来源过程产品 / 待领用白条按需拉。
 * 页面只 import 自己用到的部分，避免无谓请求。
 */
export function usePackEntryOptions() {
  const products = ref<ProductInfoVO[]>([]);
  const productLoading = ref(false);
  const locations = ref<LocationInfoVO[]>([]);
  const locationLoading = ref(false);
  const stores = ref<StoreVO[]>([]);
  const storeLoading = ref(false);
  const sources = ref<PackSourceVO[]>([]);
  const sourceLoading = ref(false);
  const bars = ref<BarInfoVO[]>([]);
  const barLoading = ref(false);
  // plotId → 「地块编码」映射（果蔬打包顶部地块卡片标签用，纯前端）
  const plotMap = ref<Record<string, string>>({});
  const plotLoading = ref(false);

  /**
   * 目标打包产品 SKU。
   * @param productType     djs_product_type：1=自产 / 2=外购（不传=全部；礼盒不传，按 belong_type=gift_box 过滤，已废弃 3）
   * @param belongType      自产归属类型过滤（如 'pork' 仅猪肉产品、'gift_box' 礼盒；不传=不限）
   * @param belongTypes     自产归属类型集合（如 ['egg','dry_good','other'] 其他产品打包；非空落 belong_type IN）
   * @param productWorkshop 字典 djs_product_workshop 车间码字符串（如 '3'）；命中「挂了该车间」的产品，不传=不限
   * @param productAttr     产品属性 djs_product_attr（1=生产产品/打包目标成品 2=原材料，取数逻辑 doc#13）；不传=不限。
   *                        ⚠️ 形参追加在末尾，勿插中间——SkuPackForm 按位调用，错位会破坏 veg/dry/gift/other 入口
   */
  async function loadProducts(productType?: number, belongType?: string, belongTypes?: string[], productWorkshop?: string, productAttr?: number) {
    productLoading.value = true;
    try {
      const res = await listProduct({ pageNum: 1, pageSize: 500, productType, belongType, belongTypes, productWorkshop, productAttr } as any);
      products.value = ((res as any).rows ?? []) as ProductInfoVO[];
    } finally {
      productLoading.value = false;
    }
  }

  /**
   * 果蔬打包成品（按本次领用原料反查 product_material 命中成品，doc#12）。
   * 复用 products ref → 卡片网格 / demandMap / stockMap 等下游逻辑不变。
   *
   * @param materialIds 本次领用原料 product_info.id（雪花）；空 → 后端返全部果蔬自产成品（向后兼容）
   * @returns 命中条数（供调用方判断是否触发"全部成品"回退提示）
   */
  async function loadVegProductsByMaterial(materialIds: (number | string)[]): Promise<number> {
    productLoading.value = true;
    try {
      const res = await listVegProductsByMaterial(materialIds);
      products.value = ((res as any).data ?? []) as ProductInfoVO[];
      return products.value.length;
    } finally {
      productLoading.value = false;
    }
  }

  async function loadLocations() {
    if (locations.value.length > 0) return;
    locationLoading.value = true;
    try {
      const res = await listLocation({ pageNum: 1, pageSize: 500 } as any);
      locations.value = ((res as any).rows ?? []) as LocationInfoVO[];
    } finally {
      locationLoading.value = false;
    }
  }

  async function loadStores() {
    if (stores.value.length > 0) return;
    storeLoading.value = true;
    try {
      const res = await listStore({ pageNum: 1, pageSize: 500 } as any);
      stores.value = ((res as any).rows ?? []) as StoreVO[];
    } finally {
      storeLoading.value = false;
    }
  }

  /** kind: 'dry'=其他打包来源 'meat'=肉品来源(belong_type=pork) 'veg'=果蔬来源 'whiteBar'=白条/猪肉发货来源 */
  async function loadSources(kind: 'dry' | 'meat' | 'veg' | 'whiteBar') {
    sourceLoading.value = true;
    try {
      const fn = kind === 'veg' ? listSourceVeg : kind === 'whiteBar' ? listSourceWhiteBar : kind === 'meat' ? listSourceMeat : listSourceDry;
      const res = await fn();
      sources.value = ((res as any).data ?? []) as PackSourceVO[];
    } finally {
      sourceLoading.value = false;
    }
  }

  async function loadBars() {
    barLoading.value = true;
    try {
      const res = await listAvailableBars();
      bars.value = ((res as any).data ?? []) as BarInfoVO[];
    } finally {
      barLoading.value = false;
    }
  }

  /** 地块全量（果蔬打包顶部地块卡片用 plotId → plotCode）。 */
  async function loadPlots() {
    if (Object.keys(plotMap.value).length > 0) return;
    plotLoading.value = true;
    try {
      const res = await listPlot({ pageNum: 1, pageSize: 999 } as any);
      const rows = ((res as any).rows ?? []) as PlotInfoVO[];
      const map: Record<string, string> = {};
      rows.forEach((p) => {
        map[String(p.id)] = p.plotCode || p.plotName || String(p.id);
      });
      plotMap.value = map;
    } finally {
      plotLoading.value = false;
    }
  }

  return {
    products,
    productLoading,
    locations,
    locationLoading,
    stores,
    storeLoading,
    sources,
    sourceLoading,
    bars,
    barLoading,
    plotMap,
    plotLoading,
    loadProducts,
    loadVegProductsByMaterial,
    loadLocations,
    loadStores,
    loadSources,
    loadBars,
    loadPlots
  };
}
