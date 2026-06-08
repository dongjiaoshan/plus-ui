/**
 * 需求录入产品 / 门店加载逻辑（WMS-DEMAND-001）。
 *
 * DemandForm（单产品编辑弹窗）+ DemandCart（多产品购物车整页）共用：
 * - 按业态过滤拉产品候选（white_bar/vegetable/gift_box 映射 belongType；other 不限定）
 * - 拉门店候选
 * - 从产品快照回填 name/spec/unit/rawMaterial（避免重复实现 onProductSelect）
 */
import { ref } from 'vue';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import type { DemandProductType } from '@/api/djs-warehouse/demand/types';

/** 从产品 VO 派生的录入快照（DemandForm / DemandCart 回填用）。 */
export interface DemandProductSnapshot {
  productName: string;
  productUnit: string;
  productSpec: string;
  rawMaterial?: string;
}

export function useDemandProducts(productType: DemandProductType) {
  const storeOptions = ref<StoreVO[]>([]);
  const productOptions = ref<ProductInfoVO[]>([]);

  async function loadStoreOptions(): Promise<void> {
    try {
      const res = await listStore({ pageNum: 1, pageSize: 200 });
      const rsp = res as { rows?: StoreVO[]; data?: StoreVO[] };
      storeOptions.value = rsp.rows ?? rsp.data ?? [];
    } catch (e) {
      console.warn('[useDemandProducts] loadStoreOptions failed', e);
      storeOptions.value = [];
    }
  }

  async function loadProductOptions(): Promise<void> {
    try {
      // 按业态映射 belongType：white_bar / vegetable / gift_box 各取对应字典 key；other 不限定
      const belongType = productType === 'other' ? undefined : productType;
      const res = await listProduct({ pageNum: 1, pageSize: 500, belongType, productStatus: 0 });
      const rsp = res as { rows?: ProductInfoVO[]; data?: ProductInfoVO[] };
      productOptions.value = rsp.rows ?? rsp.data ?? [];
    } catch (e) {
      console.warn('[useDemandProducts] loadProductOptions failed', e);
      productOptions.value = [];
    }
  }

  /**
   * 由产品快照 id（t_warehouse_product_info.id，snowflake string）派生录入字段。
   * 找不到返回 null。
   */
  function buildSnapshot(productSnowflakeId: string): DemandProductSnapshot | null {
    const p = productOptions.value.find((x) => String(x.id) === productSnowflakeId);
    if (!p) return null;
    const material = (p as ProductInfoVO).productMaterial;
    return {
      productName: p.productName,
      productUnit: p.productUnit ?? '',
      productSpec: p.productSpec ?? '',
      rawMaterial: material != null ? String(material) : undefined
    };
  }

  return {
    storeOptions,
    productOptions,
    loadStoreOptions,
    loadProductOptions,
    buildSnapshot
  };
}
