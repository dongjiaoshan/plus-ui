<template>
  <el-drawer v-model="visible" :title="drawerTitle" direction="rtl" size="100%" destroy-on-close @closed="handleClosed">
    <div class="cart-layout">
      <!-- 左：产品候选表（顶部 7 产品 tab 跨业态切换） -->
      <div class="cart-main">
        <el-tabs v-model="activeType" class="cart-type-tabs" type="card" @tab-change="onTypeChange">
          <el-tab-pane v-for="tp in DEMAND_PRODUCT_TYPES" :key="tp" :name="tp" :label="tabLabel(tp)" />
        </el-tabs>
        <div class="cart-section-head">
          <span class="cart-section-title">{{ t('demand.cart.candidateTitle') }}</span>
          <el-tag size="small" :type="activeTypeColor">{{ activeTypeLabel }}</el-tag>
        </div>
        <el-input v-model="keyword" :placeholder="t('demand.cart.searchPlaceholder')" clearable class="cart-search">
          <template #prefix
            ><el-icon><Search /></el-icon
          ></template>
        </el-input>
        <el-table :data="filteredProducts" height="100%" border class="cart-product-table" :empty-text="t('demand.cart.emptyProducts')">
          <el-table-column :label="t('demand.column.productName')" min-width="160" show-overflow-tooltip align="center" header-align="center">
            <template #default="{ row }">{{ row.displayName || row.productName }}</template>
          </el-table-column>
          <el-table-column :label="t('demand.field.productSpec')" prop="productSpec" width="120" show-overflow-tooltip align="center" header-align="center" />
          <el-table-column :label="t('demand.field.productUnit')" prop="productUnit" width="80" align="center" header-align="center" />
          <el-table-column :label="t('demand.cart.qtyToAdd')" width="180" align="center" header-align="center">
            <template #default="{ row }">
              <!-- 公斤口径产品 3 位小数、其余整数（row94）—— 与门店端需求下单同一把尺 -->
              <el-input-number
                v-model="rowQty[String(row.id)]"
                :precision="quantityPrecisionOf(activeType, row.productUnit)"
                :min="0"
                :step="1"
                size="small"
                controls-position="right"
                style="width: 130px"
              />
            </template>
          </el-table-column>
          <el-table-column :label="t('demand.cart.opAdd')" width="100" align="center" header-align="center">
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
              <div class="cart-row-name">
                <el-tag size="small" :type="resolveTypeColor(item.productType)" class="cart-row-type">{{ rowTypeLabel(item.productType) }}</el-tag>
                {{ item.productName }}
              </div>
            </div>
            <el-input-number
              v-model="item.demandQuantity"
              :precision="quantityPrecisionOf(item.productType, item.productUnit)"
              :min="0.01"
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
import { todayYmd } from '@/utils/date';
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search } from '@element-plus/icons-vue';
import { addDemand } from '@/api/djs-warehouse/demand';
import type { DemandManageForm, DemandProductType } from '@/api/djs-warehouse/demand/types';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { isKgUnit } from '@/utils/weight';
import { useDemandProducts } from '../composables/useDemandProducts';
import {
  DEMAND_PRODUCT_TYPES,
  demandTypeLabel as resolveTypeLabel,
  demandTypeColor as resolveTypeColor,
  demandTypeHasRaw
} from '../composables/demandTypeMeta';

/** 购物车单行：一个产品 + 需求量 + 所属业态（提交时映射成一条 DemandManageForm）。 */
interface CartItem {
  /** t_warehouse_product_info.id（snowflake string），作为去重 key。 */
  productId: string;
  productName: string;
  productSpec: string;
  productUnit: string;
  rawMaterial?: string;
  /** 加入时的业态 tab（跨业态购物车，提交时按本字段映射 productType）。 */
  productType: DemandProductType;
  demandQuantity: number;
}

const emit = defineEmits<{ (e: 'success'): void }>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_demand_product_type } = toRefs<any>(proxy?.useDict('djs_demand_product_type'));

const visible = ref(false);
const submitting = ref(false);
const keyword = ref('');
const footerFormRef = ref();

/** 当前候选区业态 tab（默认白条）。 */
const activeType = ref<DemandProductType>('white_bar');

/**
 * 需求量输入精度（row94）：公斤口径产品 3 位小数、其余整数；**白条先排除**（product_unit 虽是 kg，
 * 但白条是按头/份下单的整件，不能填 0.001 头）。
 *
 * 与门店端 `djs-store/demand/components/{DemandCartDrawer,StoreDemandForm}.vue` 同一把尺
 * ——同一个 `demand_quantity` 字段不能因为入口不同就有两种精度。
 * 谓词恒用 `isKgUnit`（与展示侧 `formatQtyByKgRule` / `formatOrderQuantity` 同源），不许另写正则：
 * 录入与展示不同源，`kg/箱` 这类自由文本单位就会「能填 2.555、列表显示 3」。
 */
function quantityPrecisionOf(productType: DemandProductType | string | undefined, productUnit: string | null | undefined): number {
  if (productType === 'white_bar') return 0;
  return isKgUnit(productUnit) ? 3 : 0;
}

const { storeOptions, productOptions, loadStoreOptions, loadProductOptions } = useDemandProducts();

/** 候选表每行待加入数量（key = 产品 snowflake id）。 */
const rowQty = reactive<Record<string, number>>({});
/** 购物车数组。 */
const cartItems = ref<CartItem[]>([]);

const footer = reactive<{ storeId: string; demandDate: string; expectedArriveDate?: string }>({
  storeId: '',
  demandDate: todayYmd(),
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
    (p) =>
      (p.displayName || p.productName).toLowerCase().includes(kw) ||
      p.productName.toLowerCase().includes(kw) ||
      String(p.productId).toLowerCase().includes(kw)
  );
});

const drawerTitle = computed(() => t('demand.cart.titleGeneric'));
const activeTypeLabel = computed(() => resolveTypeLabel(activeType.value, djs_demand_product_type.value));
const activeTypeColor = computed(() => resolveTypeColor(activeType.value));

function tabLabel(tp: DemandProductType): string {
  return resolveTypeLabel(tp, djs_demand_product_type.value);
}
function rowTypeLabel(tp: DemandProductType): string {
  return resolveTypeLabel(tp, djs_demand_product_type.value);
}

/** 切 tab → 重新加载该业态候选产品（购物车不变，跨业态保留）。 */
async function onTypeChange(): Promise<void> {
  keyword.value = '';
  await loadProductOptions(activeType.value);
}

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
    exist.demandQuantity = Number((exist.demandQuantity + qty).toFixed(2));
  } else {
    const material = (row as ProductInfoVO).productMaterial;
    cartItems.value.push({
      productId: pid,
      // 展示名优先（果蔬无证=别名），进购物车 + 提交都带解析名；提交后 insertByBo 再定格，一致。
      productName: row.displayName || row.productName,
      productSpec: row.productSpec ?? '',
      productUnit: row.productUnit ?? '',
      rawMaterial: material != null ? String(material) : undefined,
      productType: activeType.value,
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
    productType: item.productType,
    productSpec: item.productSpec || undefined,
    demandQuantity: item.demandQuantity,
    productUnit: item.productUnit,
    expectedArriveDate: footer.expectedArriveDate
  };
  // 白条 / 蔬菜业态保留原材料描述（与 DemandForm 单产品弹窗一致）
  if (demandTypeHasRaw(item.productType) && item.rawMaterial) {
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
  activeType.value = 'white_bar';
  cartItems.value = [];
  Object.keys(rowQty).forEach((k) => delete rowQty[k]);
  footer.storeId = '';
  footer.demandDate = todayYmd();
  footer.expectedArriveDate = undefined;
  footerFormRef.value?.clearValidate?.();
}

async function open(): Promise<void> {
  reset();
  await Promise.all([loadStoreOptions(), loadProductOptions(activeType.value)]);
  visible.value = true;
}

function handleClosed(): void {
  reset();
}

// visible 暴露给父页：需求管理列表的 60s 自动刷新在抽屉打开期间跳过本轮（row32），不打断正在录的购物车
defineExpose({ open, visible });
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
.cart-type-tabs {
  margin-bottom: 8px;
}
.cart-type-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}
/* card tabs 选中态默认 nav 与 content 间留白；本页无 tab-pane 内容，收掉空白（决策 #11=b）。 */
.cart-type-tabs :deep(.el-tabs__content) {
  padding: 0;
}
.cart-type-tabs :deep(.el-tabs__new-tab),
.cart-type-tabs :deep(.el-tabs__nav-wrap)::after {
  display: none;
}
.cart-type-tabs :deep(.el-tabs__item) {
  height: 36px;
  line-height: 36px;
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
.cart-row-type {
  margin-right: 4px;
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
