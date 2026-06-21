<template>
  <!-- 新增需求多产品购物车：右抽屉、宽 80%、点蒙层可关（保留 Element Plus 默认 close-on-click-modal=true） -->
  <el-drawer v-model="visible" direction="rtl" size="80%" :title="t('storeDemand.cart.title')" destroy-on-close @closed="handleClosed">
    <div class="cart-drawer">
      <!-- 左主区：产品类型 tab + 候选产品表（按业态 tab 切列） -->
      <div class="main-area">
        <div class="area-title">{{ t('storeDemand.create.productType') }}</div>

        <el-tabs v-model="activeTab" class="type-tabs">
          <el-tab-pane v-for="tab in TABS" :key="tab.key" :label="t(`storeDemand.tab.${tab.key}`)" :name="tab.key" />
        </el-tabs>

        <el-table
          v-loading="productLoading"
          :data="tabProducts"
          border
          stripe
          class="product-table"
          height="100%"
          :empty-text="t('storeDemand.create.emptyProducts')"
        >
          <!-- 产品图片（所有 tab 都显示，imageUrl 由后端 listProduct 回填） -->
          <el-table-column :label="t('storeDemand.create.productImage')" width="90" align="center" header-align="center">
            <template #default="{ row }">
              <ImagePreview v-if="row.imageUrl" :width="48" :height="48" :src="row.imageUrl" :preview-src-list="[row.imageUrl]" />
              <span v-else>{{ dash }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="t('storeDemand.create.productName')" min-width="160" show-overflow-tooltip align="center" header-align="center">
            <template #default="{ row }">{{ row.productName }}</template>
          </el-table-column>

          <!-- 白条：可出栏猪只头数 -->
          <el-table-column v-if="activeTab === 'white_bar'" :label="t('storeDemand.create.availablePigs')" width="140" align="center" header-align="center">
            <template #default>{{ availablePigCount }}</template>
          </el-table-column>

          <!-- 规格（除白条外都有） -->
          <el-table-column v-if="cols.spec" :label="t('storeDemand.create.spec')" width="100" align="center" header-align="center">
            <template #default="{ row }">{{ row.productSpec || dash }}</template>
          </el-table-column>

          <!-- 单位（果蔬无单列：原型果蔬表无「单位」列） -->
          <el-table-column v-if="cols.unit" :label="t('storeDemand.create.unit')" width="90" align="center" header-align="center">
            <template #default="{ row }">{{ row.productUnit || dash }}</template>
          </el-table-column>

          <!-- 原材料库存（跨域字段，product 主数据无，占位 '—'） -->
          <el-table-column v-if="cols.material" :label="t('storeDemand.create.materialStock')" width="120" align="center" header-align="center">
            <template #default>{{ dash }}</template>
          </el-table-column>

          <!-- 果蔬专属：剩余地块 / 预计产量 / 最早可采摘 / 最晚可采摘（均跨域，占位 '—'） -->
          <template v-if="activeTab === 'vegetable'">
            <el-table-column :label="t('storeDemand.create.remainPlot')" width="100" align="center" header-align="center">
              <template #default>{{ dash }}</template>
            </el-table-column>
            <el-table-column :label="t('storeDemand.create.expectYield')" width="110" align="center" header-align="center">
              <template #default>{{ dash }}</template>
            </el-table-column>
            <el-table-column :label="t('storeDemand.create.earliestPick')" width="130" align="center" header-align="center">
              <template #default>{{ dash }}</template>
            </el-table-column>
            <el-table-column :label="t('storeDemand.create.latestPick')" width="130" align="center" header-align="center">
              <template #default>{{ dash }}</template>
            </el-table-column>
          </template>

          <!-- 需求量 stepper -->
          <el-table-column :label="t('storeDemand.create.demandQuantity')" width="180" align="center" header-align="center" fixed="right">
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
      </div>

      <!-- 右侧：需求产品购物车 + 需求确认 -->
      <div class="cart-area">
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
            <!-- 个人邮寄 UI 隐藏（87-1 决策 #10-B：保后端 StoreDemandBatchBo.mailing 字段，提交载荷仍带 mailing=false） -->
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：需求门店 + 备注 + 需求确认 -->
    <template #footer>
      <div class="cart-footer">
        <div class="footer-fields">
          <span class="footer-label">{{ t('storeDemand.create.demandStore') }}</span>
          <el-select v-model="storeId" filterable :placeholder="t('storeDemand.create.demandStorePh')" style="width: 200px">
            <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
          </el-select>
          <span class="footer-label">{{ t('storeDemand.create.remark') }}</span>
          <el-input
            v-model="demandRemark"
            :placeholder="t('storeDemand.create.remarkPh')"
            :maxlength="500"
            style="width: 280px"
          />
        </div>
        <el-button type="primary" :loading="submitting" :disabled="cart.length === 0" @click="submit">
          {{ t('storeDemand.create.confirm') }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { CircleCloseFilled } from '@element-plus/icons-vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import { batchCreateStoreDemand, listStoreDemandAvailablePigs } from '@/api/djs-store/demand';
import type { StoreDemandBatchItem, StoreDemandProductType, StoreDemandTabType } from '@/api/djs-store/demand/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits<{ (e: 'success'): void }>();

const dash = '—';

/** 7 业态 tab：belongType 为产品归属分组键，productType 为落库的仓库域 4 业态码。 */
interface TabDef {
  key: StoreDemandTabType;
  belongType: string | null; // null = 「其他」兜底（无归属 / 外购）
  productType: StoreDemandProductType; // 落库映射（仓库域 4 业态）
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

const visible = ref(false);
const submitting = ref(false);
const productLoading = ref(false);
const storeId = ref<string>('');
const activeTab = ref<StoreDemandTabType>('white_bar');
const allProducts = ref<ProductInfoVO[]>([]);
const availablePigCount = ref(0);
const demandRemark = ref('');
const storeOptions = ref<StoreVO[]>([]);

/** 购物车项（含展示用 name/unit，提交时只取 productId/productType/demandQuantity/mailing）。 */
interface CartLine extends StoreDemandBatchItem {
  productName: string;
  productUnit: string;
}
const cart = ref<CartLine[]>([]);

const currentTab = computed<TabDef>(() => TABS.find((x) => x.key === activeTab.value) ?? TABS[0]);

/** 每 tab 列开关（原材料库存所有 tab 恒显示）。 */
const cols = computed(() => {
  switch (activeTab.value) {
    case 'white_bar':
      // 产品图片 / 产品名称 / 可出栏猪只头数 / 单位 / 原材料库存 / 需求量
      return { spec: false, unit: true, material: true };
    case 'vegetable':
      // 产品图片 / 产品名称 / 规格 / 原材料库存 / 剩余地块 / 预计产量 / 采摘日期×2 / 需求量（无单位列）
      return { spec: true, unit: false, material: true };
    case 'gift_box':
      // 产品图片 / 产品名称 / 单位 / 规格 / 原材料库存 / 需求量
      return { spec: true, unit: true, material: true };
    default:
      // 猪/干货/鸡蛋/其他：产品图片 / 产品名称 / 规格 / 单位 / 原材料库存 / 需求量
      return { spec: true, unit: true, material: true };
  }
});

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
  productLoading.value = true;
  try {
    const res = await listProduct({ pageNum: 1, pageSize: 500, productStatus: 0 });
    const rows = ((res as unknown as { rows?: ProductInfoVO[]; data?: ProductInfoVO[] }).rows ?? []) as ProductInfoVO[];
    // 门店只下单可售产品（自产成品 / 外购商品 / 礼盒），排除所有原材料（product_attr=2）；
    // 原料是仓库内部流转（分割/毛菜处理产出 → 领用 → 打包成成品），不可被门店下单（doc/14 §5）。
    allProducts.value = rows.filter((p) => Number(p.productAttr) !== 2);
  } catch (e) {
    console.warn('[DemandCartDrawer] loadProducts failed', e);
    allProducts.value = [];
  } finally {
    productLoading.value = false;
  }
}

async function loadAvailablePigs() {
  try {
    const res = await listStoreDemandAvailablePigs({ pageNum: 1, pageSize: 1 });
    availablePigCount.value = Number((res as unknown as { total?: number }).total ?? 0);
  } catch (e) {
    console.warn('[DemandCartDrawer] loadAvailablePigs failed', e);
    availablePigCount.value = 0;
  }
}

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[] }).rows ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[DemandCartDrawer] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function submit() {
  if (!storeId.value) {
    proxy?.$modal.msgWarning(t('storeDemand.create.demandStorePh'));
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
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

function reset() {
  activeTab.value = 'white_bar';
  cart.value = [];
  demandRemark.value = '';
}

function handleClosed() {
  reset();
}

async function open(presetStoreId: string) {
  reset();
  storeId.value = presetStoreId || '';
  visible.value = true;
  await Promise.all([loadProducts(), loadAvailablePigs(), loadStoreOptions()]);
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.cart-drawer {
  display: flex;
  gap: 12px;
  height: 100%;

  .area-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .main-area {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .type-tabs {
      flex: 0 0 auto;
    }

    .product-table {
      flex: 1;
      min-height: 0;
    }
  }

  .cart-area {
    flex: 0 0 280px;
    border-left: 1px solid var(--el-border-color-lighter);
    padding-left: 12px;
    overflow-y: auto;

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
        top: 4px;
        right: 4px;
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
    }
  }
}

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .footer-fields {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .footer-label {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
