<template>
  <el-drawer v-model="visible" :title="drawerTitle" direction="rtl" size="100%" destroy-on-close :close-on-click-modal="false" @closed="handleClosed">
    <div class="cart-layout">
      <!-- 左：产品候选表 -->
      <div class="cart-main">
        <div class="cart-section-head">
          <span class="cart-section-title">{{ t('demand.cart.candidateTitle') }}</span>
          <el-tag size="small" :type="productTypeColor">{{ productTypeLabel }}</el-tag>
        </div>
        <el-input v-model="keyword" :placeholder="t('demand.cart.searchPlaceholder')" clearable class="cart-search">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-table :data="filteredProducts" height="100%" border class="cart-product-table" :empty-text="t('demand.cart.emptyProducts')">
          <el-table-column :label="t('demand.column.productName')" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">{{ row.productName }} <span class="cart-product-code">({{ row.productId }})</span></template>
          </el-table-column>
          <el-table-column :label="t('demand.field.productSpec')" prop="productSpec" width="120" show-overflow-tooltip />
          <el-table-column :label="t('demand.field.productUnit')" prop="productUnit" width="80" align="center" />
          <el-table-column :label="t('demand.cart.qtyToAdd')" width="180" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="rowQty[String(row.id)]"
                :precision="3"
                :min="0"
                :step="1"
                size="small"
                controls-position="right"
                style="width: 130px"
              />
            </template>
          </el-table-column>
          <el-table-column :label="t('demand.cart.opAdd')" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="addToCart(row)">{{ t('demand.cart.add') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 右：购物车 + 提交区 -->
      <div class="cart-aside">
        <div class="cart-section-head">
          <span class="cart-section-title">{{ t('demand.cart.cartTitle') }}</span>
          <el-tag size="small" type="info">{{ t('demand.cart.itemCount', { count: cartItems.length }) }}</el-tag>
        </div>
        <el-scrollbar class="cart-list">
          <el-empty v-if="!cartItems.length" :description="t('demand.cart.emptyCart')" :image-size="80" />
          <div v-for="(item, idx) in cartItems" :key="item.productId" class="cart-row">
            <div class="cart-row-info">
              <div class="cart-row-name">{{ item.productName }}</div>
              <div class="cart-row-spec">{{ item.productSpec || '—' }}</div>
            </div>
            <el-input-number
              v-model="item.demandQuantity"
              :precision="3"
              :min="0.001"
              :step="1"
              size="small"
              controls-position="right"
              style="width: 120px"
            />
            <span class="cart-row-unit">{{ item.productUnit }}</span>
            <el-button link type="danger" size="small" @click="removeFromCart(idx)">{{ t('demand.cart.remove') }}</el-button>
          </div>
        </el-scrollbar>

        <el-form ref="footerFormRef" :model="footer" :rules="footerRules" label-width="92px" class="cart-footer-form">
          <el-form-item :label="t('demand.field.storeId')" prop="storeId">
            <el-select v-model="footer.storeId" filterable :placeholder="t('demand.placeholder.storeId')" style="width: 100%">
              <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('demand.field.demandDate')" prop="demandDate">
            <el-date-picker v-model="footer.demandDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
          <el-form-item :label="t('demand.field.expectedArriveDate')">
            <el-date-picker v-model="footer.expectedArriveDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-form>

        <div class="cart-actions">
          <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitting" :disabled="!cartItems.length" @click="handleSubmit">
            {{ t('demand.cart.submit', { count: cartItems.length }) }}
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search } from '@element-plus/icons-vue';
import { addDemand } from '@/api/djs-warehouse/demand';
import type { DemandManageForm, DemandProductType } from '@/api/djs-warehouse/demand/types';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { useDemandProducts } from '../composables/useDemandProducts';

/** 购物车单行：一个产品 + 需求量（提交时映射成一条 DemandManageForm）。 */
interface CartItem {
  /** t_warehouse_product_info.id（snowflake string），作为去重 key。 */
  productId: string;
  productName: string;
  productSpec: string;
  productUnit: string;
  rawMaterial?: string;
  demandQuantity: number;
}

const props = defineProps<{ productType: DemandProductType }>();
const emit = defineEmits<{ (e: 'success'): void }>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const keyword = ref('');
const footerFormRef = ref();

const { storeOptions, productOptions, loadStoreOptions, loadProductOptions } = useDemandProducts(props.productType);

/** 候选表每行待加入数量（key = 产品 snowflake id）。 */
const rowQty = reactive<Record<string, number>>({});
/** 购物车数组。 */
const cartItems = ref<CartItem[]>([]);

const footer = reactive<{ storeId: string; demandDate: string; expectedArriveDate?: string }>({
  storeId: '',
  demandDate: new Date().toISOString().slice(0, 10),
  expectedArriveDate: undefined
});

const footerRules = computed(() => ({
  storeId: [{ required: true, message: t('demand.field.storeId.required'), trigger: 'change' }],
  demandDate: [{ required: true, message: t('demand.field.demandDate.required'), trigger: 'change' }]
}));

const filteredProducts = computed<ProductInfoVO[]>(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return productOptions.value;
  return productOptions.value.filter(
    (p) => p.productName.toLowerCase().includes(kw) || String(p.productId).toLowerCase().includes(kw)
  );
});

const productTypeLabel = computed(() => t(`demand.productType.${props.productType}`));
const drawerTitle = computed(() => t('demand.cart.title', { type: productTypeLabel.value }));
const productTypeColor = computed(() => {
  switch (props.productType) {
    case 'white_bar':
      return 'danger';
    case 'vegetable':
      return 'success';
    case 'gift_box':
      return 'warning';
    default:
      return 'info';
  }
});

function addToCart(row: ProductInfoVO): void {
  const pid = String(row.id);
  const qty = rowQty[pid];
  if (!qty || qty <= 0) {
    proxy?.$modal.msgWarning(t('demand.cart.qtyRequired'));
    return;
  }
  const exist = cartItems.value.find((c) => c.productId === pid);
  if (exist) {
    // 同产品再次加入：累加数量
    exist.demandQuantity = Number((exist.demandQuantity + qty).toFixed(3));
  } else {
    const material = (row as ProductInfoVO).productMaterial;
    cartItems.value.push({
      productId: pid,
      productName: row.productName,
      productSpec: row.productSpec ?? '',
      productUnit: row.productUnit ?? '',
      rawMaterial: material != null ? String(material) : undefined,
      demandQuantity: qty
    });
  }
  rowQty[pid] = 0;
}

function removeFromCart(idx: number): void {
  cartItems.value.splice(idx, 1);
}

function toDemandForm(item: CartItem): DemandManageForm {
  const f: DemandManageForm = {
    demandDate: footer.demandDate,
    storeId: footer.storeId,
    productId: item.productId,
    productName: item.productName,
    productType: props.productType,
    productSpec: item.productSpec || undefined,
    demandQuantity: item.demandQuantity,
    productUnit: item.productUnit,
    expectedArriveDate: footer.expectedArriveDate
  };
  // 白条 / 蔬菜业态保留原材料描述（与 DemandForm 单产品弹窗一致）
  if ((props.productType === 'white_bar' || props.productType === 'vegetable') && item.rawMaterial) {
    f.rawMaterial = item.rawMaterial;
  }
  return f;
}

async function handleSubmit(): Promise<void> {
  await footerFormRef.value?.validate();
  if (!cartItems.value.length) {
    proxy?.$modal.msgWarning(t('demand.cart.emptyCart'));
    return;
  }
  submitting.value = true;
  // 逐条复用现有单条 addDemand 接口（C1：不加批量后端入口），统计成功 / 失败
  const failed: string[] = [];
  let succeeded = 0;
  try {
    for (const item of cartItems.value) {
      try {
        await addDemand(toDemandForm(item));
        succeeded += 1;
      } catch (e) {
        console.warn('[DemandCart] addDemand failed', item.productName, e);
        failed.push(item.productName);
      }
    }
  } finally {
    submitting.value = false;
  }

  if (failed.length === 0) {
    proxy?.$modal.msgSuccess(t('demand.cart.submitAllSuccess', { count: succeeded }));
    visible.value = false;
    emit('success');
  } else if (succeeded > 0) {
    // 部分成功：移除已成功行，保留失败行让用户重提
    cartItems.value = cartItems.value.filter((c) => failed.includes(c.productName));
    proxy?.$modal.msgError(t('demand.cart.submitPartial', { ok: succeeded, fail: failed.length, names: failed.join('、') }));
    emit('success');
  } else {
    proxy?.$modal.msgError(t('demand.cart.submitAllFailed', { names: failed.join('、') }));
  }
}

function reset(): void {
  keyword.value = '';
  cartItems.value = [];
  Object.keys(rowQty).forEach((k) => delete rowQty[k]);
  footer.storeId = '';
  footer.demandDate = new Date().toISOString().slice(0, 10);
  footer.expectedArriveDate = undefined;
  footerFormRef.value?.clearValidate?.();
}

async function open(): Promise<void> {
  reset();
  await Promise.all([loadStoreOptions(), loadProductOptions()]);
  visible.value = true;
}

function handleClosed(): void {
  reset();
}

defineExpose({ open });
</script>

<style scoped>
.cart-layout {
  display: flex;
  gap: 16px;
  height: 100%;
}
.cart-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.cart-aside {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--el-border-color-light);
  padding-left: 16px;
}
.cart-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.cart-section-title {
  font-size: 15px;
  font-weight: 600;
}
.cart-search {
  margin-bottom: 10px;
}
.cart-product-table {
  flex: 1;
}
.cart-product-code {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.cart-list {
  flex: 1;
  margin-bottom: 12px;
}
.cart-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.cart-row-info {
  flex: 1;
  min-width: 0;
}
.cart-row-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cart-row-spec {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.cart-row-unit {
  font-size: 13px;
  color: var(--el-text-color-regular);
  width: 36px;
}
.cart-footer-form {
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-light);
}
.cart-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
