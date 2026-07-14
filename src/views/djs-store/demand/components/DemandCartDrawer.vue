<template>
  <!-- 新增需求多产品购物车：右抽屉、宽 80%、点蒙层可关（保留 Element Plus 默认 close-on-click-modal=true） -->
  <el-drawer v-model="visible" direction="rtl" size="80%" :title="t('storeDemand.cart.title')" destroy-on-close @closed="handleClosed">
    <div class="drawer-body">
      <div class="cart-drawer">
        <!-- 左主区：需求日期 + 产品类型 tab + 候选产品表（按业态 tab 切列） -->
        <div class="main-area">
          <!-- 顶部：产品需求日期（默认明日；确认下单时整单按此日期落库） -->
          <div class="demand-date-bar">
            <span class="demand-date-label">{{ t('storeDemand.field.productDemandDate') }}</span>
            <el-date-picker
              v-model="demandDate"
              type="date"
              value-format="YYYY-MM-DD"
              :clearable="false"
              :placeholder="t('storeDemand.field.productDemandDate')"
              style="width: 200px"
            />
          </div>

          <!-- 顶部：按产品名称筛选当前 tab 的产品（切换业态 tab 时保留搜索值；紧贴「新增需求」标题下方） -->
          <div class="product-search-bar">
            <el-input
              v-model="searchKeyword"
              :placeholder="t('storeDemand.create.productNamePh')"
              clearable
              style="width: 240px"
              @keyup.enter="applySearch"
              @clear="applySearch"
            />
            <el-button type="primary" icon="Search" @click="applySearch">{{ t('storeDemand.create.search') }}</el-button>
          </div>

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
              <template #default="{ row }">{{ row.displayName || row.productName }}</template>
            </el-table-column>

            <!-- 白条：可出栏猪只头数 -->
            <el-table-column
              v-if="activeTab === 'white_bar'"
              :label="t('storeDemand.create.availablePigs')"
              width="140"
              align="center"
              header-align="center"
            >
              <template #default>{{ availablePigCount }}</template>
            </el-table-column>

            <!-- 规格（除白条外都有） -->
            <el-table-column v-if="cols.spec" :label="t('storeDemand.create.spec')" width="100" align="center" header-align="center">
              <template #default="{ row }">{{ row.productSpec || dash }}</template>
            </el-table-column>

            <!-- 单位（果蔬无单列：原型果蔬表无「单位」列） -->
            <!-- 白条下单按「份/半只」计数口径展示单位（product_unit=kg 仅供分割/盘点按重量用），仅展示层覆盖，不改落库单位 -->
            <el-table-column v-if="cols.unit" :label="t('storeDemand.create.unit')" width="90" align="center" header-align="center">
              <template #default="{ row }">{{ activeTab === 'white_bar' ? WHITE_BAR_DEMAND_UNIT : row.productUnit || dash }}</template>
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
                <span class="cart-item-qty">{{ item.demandQuantity }}{{ item.productType === 'white_bar' ? WHITE_BAR_DEMAND_UNIT : item.productUnit }}</span>
              </div>
              <!-- 个人邮寄 UI 隐藏（87-1 决策 #10-B：保后端 StoreDemandBatchBo.mailing 字段，提交载荷仍带 mailing=false） -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：需求门店 + 备注 + 需求确认 -->
    <template #footer>
      <div class="cart-footer">
        <div class="footer-fields">
          <span class="footer-label">{{ t('storeDemand.create.demandStore') }}</span>
          <!-- 门店由全局选择器锁定，新增需求自动绑当前门店、不可手改 -->
          <span class="footer-store-name">{{ currentStoreName || '—' }}</span>
          <span class="footer-label">{{ t('storeDemand.create.remark') }}</span>
          <el-input v-model="demandRemark" :placeholder="t('storeDemand.create.remarkPh')" :maxlength="500" style="width: 280px" />
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
import { useStoreContextStore } from '@/store/modules/storeContext';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits<{ (e: 'success'): void }>();

const storeContext = useStoreContextStore();
/** 当前门店名（用于底部只读展示）。 */
const currentStoreName = computed(() => {
  const s = storeContext.myStores.find((x) => String(x.id) === storeId.value);
  return s?.storeName ?? '';
});

const dash = '—';

/** 白条门店下单展示单位：按「份/半只」计数下单（product_unit=kg 仅供仓库分割/盘点按重量），仅展示层覆盖不落库。 */
const WHITE_BAR_DEMAND_UNIT = '份';

/** 明日日期 YYYY-MM-DD（本地时区，需求日期默认值）。 */
function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
const demandDate = ref<string>(tomorrowStr());
/** 产品名称搜索：searchKeyword 为输入框实时值，appliedKeyword 为点「查询」后生效的过滤值（切 tab 保留）。 */
const searchKeyword = ref('');
const appliedKeyword = ref('');

function applySearch() {
  appliedKeyword.value = searchKeyword.value.trim();
}

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
  let list: ProductInfoVO[];
  if (def.belongType === null) {
    list = allProducts.value.filter((p) => !p.belongType || !KNOWN_BELONG.includes(p.belongType));
  } else {
    list = allProducts.value.filter((p) => p.belongType === def.belongType);
  }
  // 白条业态：加载「产品类型=自产(productType=1) + 类别=白条产品(belongType=white_bar)」全部数据。
  // 白条(整只/半只)在仓库域建模为原材料(product_attr=2)，但门店订白条→现场分割，故不套用下方原料排除。
  if (def.key === 'white_bar') {
    list = list.filter((p) => Number(p.productType) === 1);
  } else {
    // 其他业态：门店只下单可售成品，排除原材料(product_attr=2)；
    // 原料是仓库内部流转(分割/毛菜处理产出→领用→打包成成品)，门店订成品不订原料(doc/14 §5)。
    list = list.filter((p) => Number(p.productAttr) !== 2);
  }
  // 产品名称过滤（点「查询」后生效，跨 tab 保留 appliedKeyword）
  const kw = appliedKeyword.value.toLowerCase();
  if (kw) {
    list = list.filter((p) => ((p.displayName || p.productName) ?? '').toLowerCase().includes(kw) || (p.productName ?? '').toLowerCase().includes(kw));
  }
  return list;
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
      // 展示名优先（果蔬无证=别名），进购物车 + 提交都带解析名；提交后 insertByBo 再定格，一致。
      productName: row.displayName || row.productName,
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
    // withDisplayName：果蔬候选按原材料作物有效有机证书解析展示名（有证=产品名 / 无证=别名），与下单定格一致。
    const res = await listProduct({ pageNum: 1, pageSize: 500, productStatus: 0, withDisplayName: true });
    const rows = ((res as unknown as { rows?: ProductInfoVO[]; data?: ProductInfoVO[] }).rows ?? []) as ProductInfoVO[];
    // 加载全部启用产品，原料排除按 tab 业态区分（见 tabProducts）：
    // 白条 tab 取自产白条(含原料态白条，门店订白条→现场分割)；其余业态排除原材料(product_attr=2)。
    allProducts.value = rows;
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
      demandDate: demandDate.value || undefined,
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
  demandDate.value = tomorrowStr();
  searchKeyword.value = '';
  appliedKeyword.value = '';
}

function handleClosed() {
  reset();
}

async function open(presetStoreId: string) {
  reset();
  storeId.value = presetStoreId || '';
  visible.value = true;
  await Promise.all([loadProducts(), loadAvailablePigs()]);
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.drawer-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cart-drawer {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;

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

    .demand-date-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
      margin-bottom: 12px;

      .demand-date-label {
        font-size: 14px;
        font-weight: 600;
      }
    }

    .type-tabs {
      flex: 0 0 auto;
    }

    .product-table {
      flex: 1;
      min-height: 0;
    }

    .product-search-bar {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
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

    .footer-store-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      min-width: 80px;
    }
  }
}
</style>
