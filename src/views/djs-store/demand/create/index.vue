<template>
  <div class="demand-create">
    <!-- 左主区：产品类型 tab + 每 tab 产品表格（stepper 录需求量） -->
    <el-card shadow="never" class="main-area">
      <div class="area-title">{{ t('storeDemand.create.productType') }}</div>

      <el-tabs v-model="activeTab" class="type-tabs">
        <el-tab-pane v-for="tab in TABS" :key="tab.key" :label="t(`storeDemand.tab.${tab.key}`)" :name="tab.key" />
      </el-tabs>

      <el-table :data="tabProducts" border stripe class="product-table" :empty-text="t('storeDemand.create.emptyProducts')">
        <el-table-column :label="t('storeDemand.create.productName')" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.productName }}</template>
        </el-table-column>
        <el-table-column v-if="isWhiteBarTab" :label="t('storeDemand.create.availablePigs')" width="160" align="center">
          <template #default>{{ availablePigCount }}</template>
        </el-table-column>
        <el-table-column :label="t('storeDemand.create.unit')" width="100" align="center">
          <template #default="{ row }">{{ row.productUnit }}</template>
        </el-table-column>
        <el-table-column :label="t('storeDemand.create.demandQuantity')" width="200" align="center">
          <template #default="{ row }">
            <el-input-number
              :model-value="quantityOf(row)"
              :min="0"
              :step="1"
              :precision="0"
              size="small"
              @update:model-value="(v: number | undefined) => onQuantityChange(row, v)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部备注 + 整单确认 -->
      <div class="footer-bar">
        <div class="remark-box">
          <span class="remark-label">{{ t('storeDemand.create.remark') }}</span>
          <el-input v-model="demandRemark" type="textarea" :rows="2" :maxlength="500" :placeholder="t('storeDemand.create.remarkPh')" />
        </div>
      </div>
    </el-card>

    <!-- 右侧固定：需求产品购物车 -->
    <el-card shadow="never" class="cart-area">
      <div class="area-title">{{ t('storeDemand.create.operation') }}</div>
      <div class="cart-title">{{ t('storeDemand.create.cartTitle') }}</div>

      <div v-if="cart.length === 0" class="cart-empty">{{ t('storeDemand.create.cartEmpty') }}</div>

      <div class="cart-list">
        <div v-for="item in cart" :key="item.productId" class="cart-item">
          <el-icon class="cart-del" @click="removeFromCart(item.productId)"><CircleCloseFilled /></el-icon>
          <div class="cart-item-main">
            <span class="cart-item-name">{{ item.productName }}</span>
            <span class="cart-item-qty">{{ item.demandQuantity }}{{ item.productUnit }}</span>
          </div>
          <el-checkbox v-model="item.mailing" class="cart-item-mailbox" size="small">{{ t('storeDemand.create.mailing') }}</el-checkbox>
        </div>
      </div>

      <el-button type="primary" class="cart-submit" :loading="submitting" :disabled="cart.length === 0" @click="submit">
        {{ t('storeDemand.create.confirm') }}
      </el-button>
    </el-card>
  </div>
</template>

<script setup name="StoreDemandCreate" lang="ts">
import { CircleCloseFilled } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { batchCreateStoreDemand, listStoreDemandAvailablePigs } from '@/api/djs-store/demand';
import type { StoreDemandBatchItem, StoreDemandProductType, StoreDemandTabType } from '@/api/djs-store/demand/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/** 7 业态 tab：belongType 为产品归属分组键，productType 为落库的仓库域 4 业态码。 */
interface TabDef {
  key: StoreDemandTabType;
  belongType: string | null; // null = 「其他」兜底（无归属 / 外购）
  productType: StoreDemandProductType; // 落库映射
}
const TABS: TabDef[] = [
  { key: 'white_bar', belongType: 'white_bar', productType: 'white_bar' },
  { key: 'pork', belongType: 'pork', productType: 'other' },
  { key: 'vegetable', belongType: 'vegetable', productType: 'vegetable' },
  { key: 'dry_good', belongType: 'dry_good', productType: 'other' },
  { key: 'egg', belongType: 'egg', productType: 'other' },
  { key: 'gift_box', belongType: 'gift_box', productType: 'gift_box' },
  { key: 'other', belongType: null, productType: 'other' }
];
const KNOWN_BELONG = TABS.map((x) => x.belongType).filter((x): x is string => x !== null);

const storeId = ref<string>((route.query.storeId as string) || '');
const activeTab = ref<StoreDemandTabType>('white_bar');
const allProducts = ref<ProductInfoVO[]>([]);
const availablePigCount = ref(0);
const demandRemark = ref('');
const submitting = ref(false);

/** 购物车项（含展示用 name/unit，提交时只取 productId/productType/demandQuantity/mailing）。 */
interface CartLine extends StoreDemandBatchItem {
  productName: string;
  productUnit: string;
}
const cart = ref<CartLine[]>([]);

const currentTab = computed<TabDef>(() => TABS.find((x) => x.key === activeTab.value) ?? TABS[0]);
const isWhiteBarTab = computed(() => activeTab.value === 'white_bar');

/** 当前 tab 的产品：按 belongType 归组；「其他」tab = belongType 不在已知 6 类（含空）。 */
const tabProducts = computed<ProductInfoVO[]>(() => {
  const def = currentTab.value;
  if (def.belongType === null) {
    return allProducts.value.filter((p) => !p.belongType || !KNOWN_BELONG.includes(p.belongType));
  }
  return allProducts.value.filter((p) => p.belongType === def.belongType);
});

function quantityOf(row: ProductInfoVO): number {
  const line = cart.value.find((c) => c.productId === String(row.id));
  return line ? Number(line.demandQuantity) : 0;
}

function onQuantityChange(row: ProductInfoVO, value: number | undefined) {
  const qty = Number(value ?? 0);
  const pid = String(row.id);
  const idx = cart.value.findIndex((c) => c.productId === pid);
  if (qty <= 0) {
    if (idx >= 0) cart.value.splice(idx, 1);
    return;
  }
  if (idx >= 0) {
    cart.value[idx].demandQuantity = qty;
  } else {
    cart.value.push({
      productId: pid,
      productType: currentTab.value.productType,
      demandQuantity: qty,
      mailing: false,
      productName: row.productName,
      productUnit: row.productUnit
    });
  }
}

function removeFromCart(productId: string) {
  const idx = cart.value.findIndex((c) => c.productId === productId);
  if (idx >= 0) cart.value.splice(idx, 1);
}

async function loadProducts() {
  try {
    const res = await listProduct({ pageNum: 1, pageSize: 500 });
    allProducts.value = ((res as unknown as { rows?: ProductInfoVO[]; data?: ProductInfoVO[] }).rows ?? []) as ProductInfoVO[];
  } catch (e) {
    console.warn('[StoreDemandCreate] loadProducts failed', e);
    allProducts.value = [];
  }
}

async function loadAvailablePigs() {
  try {
    const res = await listStoreDemandAvailablePigs({ pageNum: 1, pageSize: 1 });
    availablePigCount.value = Number((res as unknown as { total?: number }).total ?? 0);
  } catch (e) {
    console.warn('[StoreDemandCreate] loadAvailablePigs failed', e);
    availablePigCount.value = 0;
  }
}

async function submit() {
  if (!storeId.value) {
    proxy?.$modal.msgWarning(t('storeDemand.tip.selectStoreFirst'));
    return;
  }
  if (cart.value.length === 0) {
    proxy?.$modal.msgWarning(t('storeDemand.create.cartEmpty'));
    return;
  }
  submitting.value = true;
  try {
    await batchCreateStoreDemand({
      storeId: storeId.value,
      demandRemark: demandRemark.value || undefined,
      items: cart.value.map((c) => ({
        productId: c.productId,
        productType: c.productType,
        demandQuantity: Number(c.demandQuantity),
        mailing: c.mailing
      }))
    });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    router.push({ path: '/djs-store/demand/list' });
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadProducts();
  loadAvailablePigs();
});
</script>

<style lang="scss" scoped>
.demand-create {
  display: flex;
  gap: 12px;
  padding: 8px;

  .area-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .main-area {
    flex: 1;
    min-width: 0;
  }

  .product-table {
    margin-top: 8px;
  }

  .footer-bar {
    margin-top: 16px;

    .remark-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .remark-label {
        flex: 0 0 auto;
        padding-top: 6px;
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .cart-area {
    flex: 0 0 300px;

    .cart-title {
      font-size: 14px;
      font-weight: 600;
      margin: 4px 0 12px;
    }

    .cart-empty {
      color: #909399;
      font-size: 13px;
      text-align: center;
      padding: 24px 0;
    }

    .cart-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cart-item {
      position: relative;
      background: #f5f7fa;
      border-radius: 6px;
      padding: 10px 28px 10px 12px;

      .cart-del {
        position: absolute;
        top: -6px;
        right: -6px;
        font-size: 18px;
        color: #f56c6c;
        cursor: pointer;
      }

      .cart-item-main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;

        .cart-item-name {
          font-size: 14px;
          font-weight: 500;
        }

        .cart-item-qty {
          font-size: 13px;
          color: #606266;
        }
      }

      .cart-item-mailbox {
        margin-top: 4px;
      }
    }

    .cart-submit {
      width: 100%;
      margin-top: 20px;
    }
  }
}
</style>
