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

            <el-table-column
              :label="t('storeDemand.create.productName')"
              :min-width="DATA_COL_MIN_WIDTH"
              show-overflow-tooltip
              align="center"
              header-align="center"
            >
              <template #default="{ row }">{{ row.displayName || row.productName }}</template>
            </el-table-column>

            <!-- 白条：可出栏猪只头数 -->
            <el-table-column
              v-if="activeTab === 'white_bar'"
              :label="t('storeDemand.create.availablePigs')"
              :min-width="DATA_COL_MIN_WIDTH"
              align="center"
              header-align="center"
            >
              <template #default>{{ availablePigCount }}</template>
            </el-table-column>

            <!-- 规格（除白条外都有） -->
            <el-table-column
              v-if="cols.spec"
              :label="t('storeDemand.create.spec')"
              :min-width="DATA_COL_MIN_WIDTH"
              align="center"
              header-align="center"
            >
              <template #default="{ row }">{{ row.productSpec || dash }}</template>
            </el-table-column>

            <!-- 单位（果蔬无单列：原型果蔬表无「单位」列） -->
            <!-- 白条下单按「份/半只」计数口径展示单位（product_unit=kg 仅供分割/盘点按重量用），仅展示层覆盖，不改落库单位 -->
            <el-table-column
              v-if="cols.unit"
              :label="t('storeDemand.create.unit')"
              :min-width="DATA_COL_MIN_WIDTH"
              align="center"
              header-align="center"
            >
              <template #default="{ row }">{{ activeTab === 'white_bar' ? WHITE_BAR_DEMAND_UNIT : row.productUnit || dash }}</template>
            </el-table-column>

            <!-- 果蔬专属：剩余地块 / 预计产量 / 最早可采摘 / 最晚可采摘（取种植域作物地块统计，无数据显示 '—'） -->
            <template v-if="activeTab === 'vegetable'">
              <el-table-column :label="t('storeDemand.create.remainPlot')" :min-width="DATA_COL_MIN_WIDTH" align="center" header-align="center">
                <template #default="{ row }">{{ cropStatOf(row)?.remainPlotCount ?? dash }}</template>
              </el-table-column>
              <el-table-column :label="t('storeDemand.create.expectYield')" :min-width="DATA_COL_MIN_WIDTH" align="center" header-align="center">
                <template #default="{ row }">{{ expectYieldText(row) }}</template>
              </el-table-column>
              <el-table-column :label="t('storeDemand.create.earliestPick')" :min-width="DATA_COL_MIN_WIDTH" align="center" header-align="center">
                <template #default="{ row }">{{ cropStatOf(row)?.earliestPickDate || dash }}</template>
              </el-table-column>
              <el-table-column :label="t('storeDemand.create.latestPick')" :min-width="DATA_COL_MIN_WIDTH" align="center" header-align="center">
                <template #default="{ row }">{{ cropStatOf(row)?.latestPickDate || dash }}</template>
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
                <span class="cart-item-qty"
                  >{{ item.demandQuantity }}{{ item.productType === 'white_bar' ? WHITE_BAR_DEMAND_UNIT : item.productUnit }}</span
                >
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
        <el-button type="primary" size="large" class="confirm-btn" :loading="submitting" :disabled="cart.length === 0" @click="submit">
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
import { listCropPlotStat, buildCropPlotStatByProduct, type CropPlotStatByProduct } from '@/api/djs-plant/cropStat';
import type { CropPlotStatVO } from '@/api/djs-plant/cropStat/types';
import { useStoreContextStore } from '@/store/modules/storeContext';
import { useI18n } from 'vue-i18n';
import { WHITE_BAR_DEMAND_UNIT } from '@/utils/weight';

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

/**
 * 数据列统一 min-width（客户要求「各列宽度都一样」）。
 *
 * el-table 分配规则：设 width 的列固定占该宽度，其余（只设 min-width）为弹性列 ——
 * 表体剩余宽度按各弹性列 min-width 的比例瓜分，因此所有弹性列取同一 min-width 即等宽；
 * 剩余宽度不够时各弹性列退回 min-width、表体横向滚动，仍然等宽。
 * 130 是最长表头（「最早可采摘日期」/「可出栏猪只头数」7 字 ≈ 98px + 单元格左右 padding 24px）不折行的下限。
 * 产品图片（width=90）与需求量（width=180，stepper 需固定空间）不参与瓜分。
 */
const DATA_COL_MIN_WIDTH = 130;

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
  belongType: string | null; // null = 「其他」兜底（归属为空 / 不在已知 6 类的自产成品）
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

/** 每 tab 列开关。 */
const cols = computed(() => {
  switch (activeTab.value) {
    case 'white_bar':
      // 产品图片 / 产品名称 / 可出栏猪只头数 / 单位 / 需求量
      return { spec: false, unit: true };
    case 'vegetable':
      // 产品图片 / 产品名称 / 规格 / 剩余地块 / 预计产量 / 采摘日期×2 / 需求量（无单位列）
      return { spec: true, unit: false };
    default:
      // 猪/干货/鸡蛋/礼盒/其他：产品图片 / 产品名称 / 规格 / 单位 / 需求量
      return { spec: true, unit: true };
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
  // 门店只下单自产产品(product_type=1，含礼盒)：外购商品(=2)是生产投入品(种子/药品/农药/肥料/饲料/包材/设备)，
  // 走采购入库 → 物资领用，不进门店下单链路(doc/14 §5)。服务端已按 productTypes=[1] 过滤，此处前端兜底。
  list = list.filter((p) => Number(p.productType) === 1);
  // 白条 / 礼盒不按产品属性收口：
  //   白条(整只/半只)在仓库域建模为原材料(product_attr=2)，但门店订白条→现场分割，可订；
  //   礼盒的 product_attr 在商品配置表单非必填，历史礼盒可能为空，按白名单会被误伤。
  // 其余业态取自产成品白名单(product_attr=1)：既排除原材料(=2，仓库内部流转：分割/毛菜处理产出→领用→打包成成品)，
  // 也挡住属性未配置(空)的脏数据漏进「其他产品」兜底桶。
  if (def.key !== 'white_bar' && def.key !== 'gift_box') {
    list = list.filter((p) => Number(p.productAttr) === 1);
  }
  // 产品名称过滤（点「查询」后生效，跨 tab 保留 appliedKeyword）
  const kw = appliedKeyword.value.toLowerCase();
  if (kw) {
    list = list.filter(
      (p) => ((p.displayName || p.productName) ?? '').toLowerCase().includes(kw) || (p.productName ?? '').toLowerCase().includes(kw)
    );
  }
  return list;
});

const cropStats = ref<CropPlotStatVO[]>([]);

/**
 * 果蔬统计索引「产品 id → 统计值」。归并由 api 层的 buildCropPlotStatByProduct 负责：
 * 同一基础果蔬产品可能被多条作物指向（如「甘蓝」挂两条测试作物），地块数与预计产量必须累加、
 * 日期取 min/max，直接按 relatedProduct 建 Map 会互相覆盖漏算。
 */
const cropStatMap = computed<Record<string, CropPlotStatByProduct>>(() => buildCropPlotStatByProduct(cropStats.value));

/**
 * 果蔬产品行 → 作物统计（与后端展示名解析同一条映射链）：
 * 原材料产品 id = `product_material ?? product.id`（成品挂原材料，基础果蔬自身即原材料）
 * → `t_plant_crop_info.related_product` 命中作物。查不到返回 undefined，列渲染回落 '—'。
 */
function cropStatOf(row: ProductInfoVO): CropPlotStatByProduct | undefined {
  const key = row.productMaterial ?? row.id;
  if (key === undefined || key === null || String(key) === '') {
    return undefined;
  }
  return cropStatMap.value[String(key)];
}

/**
 * 果蔬「预计产量」单元格文本：数值后缀 KG（`213.34KG`，大写无空格；单位在单元格不在列头，与同表「原材料库存」一致）。
 * 同一产品被多条作物指向时预计产量是前端累加值，浮点长尾（16.200000000000003）按最多 2 位小数收口。
 * 无统计数据回落 '—'。
 */
function expectYieldText(row: ProductInfoVO): string {
  const stat = cropStatOf(row);
  if (!stat) {
    return dash;
  }
  const n = stat.expectYield;
  if (!Number.isFinite(n)) {
    return dash;
  }
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 2, useGrouping: false })}KG`;
}

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

/** 候选产品单页拉取条数；总数超过一页时按 total 逐页补齐（见 loadProducts）。 */
const PRODUCT_PAGE_SIZE = 500;

async function loadProducts() {
  productLoading.value = true;
  try {
    // withDisplayName：果蔬候选按原材料作物有效有机证书解析展示名（有证=产品名 / 无证=别名），与下单定格一致。
    // 必须按 total 翻完所有页：启用产品总数已超过单页 500，只取第一页会让靠后的业态（果蔬/其他）整片产品在
    // 对应 tab 里消失（门店根本下不了单），且缺失是静默的、看不出来。
    // productTypes=[1]：只取自产产品（含礼盒）。外购商品(product_type=2，生产投入品)不可被门店下单，
    // 服务端直接落 product_type IN (1)，候选从 682 条收窄到自产集，兜底见 tabProducts。
    type ProductPage = { rows?: ProductInfoVO[]; data?: ProductInfoVO[]; total?: number };
    const first = (await listProduct({
      pageNum: 1,
      pageSize: PRODUCT_PAGE_SIZE,
      productTypes: [1],
      productStatus: 0,
      withDisplayName: true
    })) as unknown as ProductPage;
    const rows: ProductInfoVO[] = [...((first.rows ?? first.data ?? []) as ProductInfoVO[])];
    const total = Number(first.total ?? rows.length);
    const pages = Math.ceil(total / PRODUCT_PAGE_SIZE);
    for (let page = 2; page <= pages; page++) {
      const next = (await listProduct({
        pageNum: page,
        pageSize: PRODUCT_PAGE_SIZE,
        productTypes: [1],
        productStatus: 0,
        withDisplayName: true
      })) as unknown as ProductPage;
      rows.push(...((next.rows ?? next.data ?? []) as ProductInfoVO[]));
    }
    // 加载全部启用自产产品，属性收口按 tab 业态区分（见 tabProducts）：
    // 白条 / 礼盒 tab 不按 product_attr 过滤；其余业态只取自产成品(product_attr=1)。
    allProducts.value = rows;
  } catch (e) {
    console.warn('[DemandCartDrawer] loadProducts failed', e);
    allProducts.value = [];
  } finally {
    productLoading.value = false;
  }
}

/** 果蔬 tab 的剩余地块 / 预计产量 / 可采摘日期区间（种植域按作物聚合）。 */
async function loadCropStats() {
  try {
    const res = await listCropPlotStat();
    cropStats.value = res.data ?? [];
  } catch (e) {
    console.warn('[DemandCartDrawer] listCropPlotStat failed', e);
    cropStats.value = [];
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
  cropStats.value = [];
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
  await Promise.all([loadProducts(), loadAvailablePigs(), loadCropStats()]);
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
    // 字段区吃掉剩余宽度（min-width:0 允许收缩），确认按钮加大后「需求门店 / 备注」不被挤到换行
    flex: 1 1 auto;
    min-width: 0;
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

  // 确认下单：抽屉主操作，比默认档更醒目（与左侧 280px 备注输入框视觉等高）
  .confirm-btn {
    flex: 0 0 auto;
    min-width: 160px;
    height: 44px;
    padding: 0 28px;
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
