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

/**
 * 需求业态 → 候选产品 belongType 映射（拉候选产品按 belong_type 过滤）。
 * other 不限定 belongType（前端兜底排除已知 6 类）。
 */
const DEMAND_TYPE_TO_BELONG: Record<DemandProductType, string | undefined> = {
  white_bar: 'white_bar',
  pig: 'pork',
  vegetable: 'vegetable',
  dry: 'dry_good',
  egg: 'egg',
  gift_box: 'gift_box',
  other: undefined
};

/** 已知 6 类 belongType（other tab 前端兜底排除）。 */
const KNOWN_BELONG_TYPES = ['white_bar', 'pork', 'vegetable', 'dry_good', 'egg', 'gift_box'];

/** 从产品 VO 派生的录入快照（DemandForm / DemandCart 回填用）。 */
export interface DemandProductSnapshot {
  productName: string;
  productUnit: string;
  productSpec: string;
  rawMaterial?: string;
}

export function useDemandProducts(productType: DemandProductType = 'white_bar') {
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

  /**
   * 拉候选产品。typeOverride 用于 DemandCart 切 7 tab 时按当前 tab 业态加载；
   * 不传则用创建时闭包的 productType（DemandForm 单产品弹窗用，向后兼容）。
   */
  async function loadProductOptions(typeOverride?: DemandProductType): Promise<void> {
    const tp = typeOverride ?? productType;
    try {
      // 按业态映射 belongType 拉候选产品：
      //   white_bar→white_bar / pig→pork / vegetable→vegetable / dry→dry_good / egg→egg / gift_box→gift_box
      //   other 不限定 belongType（前端兜底「不在已知 6 类」的产品）
      const belongType = DEMAND_TYPE_TO_BELONG[tp];
      const res = await listProduct({ pageNum: 1, pageSize: 500, belongType, productStatus: 0 });
      const rsp = res as { rows?: ProductInfoVO[]; data?: ProductInfoVO[] };
      // 需求只能挂可售产品（自产成品 / 外购 / 礼盒），排除自产原料（type=1 & attr=2）：
      // 原料是仓库内部流转（分割/毛菜处理产出 → 领用 → 打包成成品），不可被门店下单（doc/14 §5）。
      const rows = (rsp.rows ?? rsp.data ?? []).filter((p) => !(Number(p.productType) === 1 && Number(p.productAttr) === 2));
      // other tab：服务端不过滤 belongType，前端兜底排除已知 6 类（剩"其他"）
      if (tp === 'other') {
        productOptions.value = rows.filter((p) => !KNOWN_BELONG_TYPES.includes(String(p.belongType ?? '')));
      } else {
        productOptions.value = rows;
      }
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
