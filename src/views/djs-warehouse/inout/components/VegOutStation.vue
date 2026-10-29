<template>
  <div class="veg-station">
    <main class="station-main">
      <h2 class="station-title">{{ tr('vegOutTitle') }}</h2>
      <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" show-icon />
      <h3 class="section-heading">{{ tr('productName') }}</h3>
      <div v-loading="loading" class="card-area">
        <VegCardPager
          :items="products"
          :item-key="(p: VegOutProduct) => p.productId"
          :active-key="selectedProductId"
          :prev-label="tr('prevPage')"
          :next-label="tr('nextPage')"
        >
          <template #default="{ item }">
            <button
              type="button"
              class="info-card product-card"
              :class="{ active: item.productId === selectedProductId }"
              :aria-pressed="item.productId === selectedProductId"
              :disabled="busy"
              @click="selectProduct(item.productId)"
            >
              <strong class="card-title"
                ><el-icon class="leaf"><Grape /></el-icon>{{ item.productName }}</strong
              >
              <span class="card-kv">
                <span>{{ tr('plotCount') }}</span>
                <b class="metric">{{ item.plotCount }}{{ tr('plotUnit') }}</b>
              </span>
              <span class="card-kv">
                <span>{{ tr('totalStock') }}</span>
                <b class="metric">{{ kg(item.totalStock) }}</b>
              </span>
            </button>
          </template>
        </VegCardPager>
        <el-empty v-if="!products.length && !loading" :description="tr('noVegProducts')" :image-size="64" />
      </div>
      <h3 class="section-heading">{{ tr('plotInfo') }}</h3>
      <div v-loading="stocksLoading" class="plot-grid">
        <button
          v-for="stock in stocks"
          :key="stockKey(stock)"
          type="button"
          class="info-card stock-card"
          :class="{ active: stockKey(stock) === selectedStockKey }"
          :aria-pressed="stockKey(stock) === selectedStockKey"
          :disabled="busy"
          @click="selectStock(stock)"
        >
          <strong class="card-title plot-code"
            ><el-icon><Location /></el-icon>{{ plotLabel(stock) }}</strong
          >
          <span class="card-kv">
            <span>{{ tr('remainingStock') }}</span>
            <b>{{ kg(stock.stockWeight) }}</b>
          </span>
          <span class="card-kv right">
            <span>{{ tr('stockLocation') }}</span>
            <b class="location-text">{{ stock.locationName || '—' }}</b>
          </span>
        </button>
        <el-empty v-if="selectedProductId && !stocks.length && !stocksLoading" :description="tr('noVegStocks')" :image-size="64" />
      </div>
    </main>
    <aside class="station-panel">
      <div class="panel-head">
        <label>{{ tr('selectionInfo') }}</label>
        <el-button link type="primary" :icon="Refresh" :loading="loading" :disabled="busy" @click="refresh()">{{ tr('refresh') }}</el-button>
      </div>
      <div class="chip-row">
        <div class="chip-group">
          <span class="crop-chip"
            ><el-icon><Grape /></el-icon>{{ selectedProduct?.productName || '—' }}</span
          >
          <span v-if="selectedStock" class="plot-chip">{{ plotLabel(selectedStock) }} · {{ selectedStock.locationName }}</span>
        </div>
        <el-button
          v-hasPermi="['djs:warehouse:inout:outFinish']"
          type="primary"
          class="finish-button"
          :loading="finishing"
          :disabled="busy || !selectedStock"
          @click="finishProduct"
          >{{ tr('vegFinishOut') }}</el-button
        >
      </div>
      <fieldset class="entry-fields" :disabled="busy || !selectedStock">
        <div class="weight-label">
          <label>{{ tr('outWeight') }}</label>
          <ScaleFillBar v-model="weight" :in-gram="false" />
        </div>
        <WeightNumpad v-model="weight" unit="kg" :precision="3" :placeholder="tr('outWeight')" collapse-on-auto-fill />
        <TareSelector :tare="tare" />
        <p v-if="overStock" class="field-error" role="alert">{{ tr('overStock') }}</p>
        <section class="info-section">
          <label class="field-label">{{ tr('destination') }}</label>
          <div class="option-row destination-options">
            <button
              v-for="option in destinationOptions"
              :key="option.value"
              type="button"
              class="option"
              :class="{ active: destination === option.value }"
              :aria-pressed="destination === option.value"
              @click="destination = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <template v-if="destination === 'warehouse'">
            <label class="field-label">{{ tr('outDestination') }}</label>
            <el-select v-model="outDest" :placeholder="tr('selectOutDest')" filterable clearable class="destination-select">
              <el-option v-for="option in outOptions" :key="option.value" :value="option.value" :label="option.label" />
            </el-select>
            <template v-if="recent.length">
              <label class="field-label">{{ tr('frequentDest') }}</label>
              <div class="option-row recent-destinations">
                <button
                  v-for="option in recent"
                  :key="option.value"
                  type="button"
                  class="option"
                  :class="{ active: outDest === option.value }"
                  :aria-pressed="outDest === option.value"
                  @click="outDest = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </template>
          </template>
        </section>
      </fieldset>
      <div class="panel-actions">
        <el-button
          v-hasPermi="['djs:warehouse:inout:submit']"
          type="primary"
          class="submit-button"
          :loading="submitting"
          :disabled="busy || !canSubmit"
          @click="submit"
          >{{ tr('confirmOut') }}</el-button
        >
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
/**
 * 果蔬出库管理（V6 row283）：库存里的果蔬产品（不区分库位合计）→ 地块库存卡（同库位一组篮，
 * 无地块库存单独成卡）→ 称重 → 去向「仓库出库 / 猪养殖饲料 / 家禽饲料」。记账在后端毛菜间出库口径：
 * 仓库出库写出库流水；猪养殖饲料 / 家禽饲料按有机饲喂写每日饲喂记录（饲喂类型分别为猪 / 家禽）+ 出库流水。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Grape, Location, Refresh } from '@element-plus/icons-vue';
import { getDicts } from '@/api/system/dict/data';
import type { RecentDestination } from '@/api/djs-warehouse/inout';
import {
  getVegOutProducts,
  getVegOutStocks,
  getVegRecentOutDests,
  finishVegOut,
  submitVegOut,
  type VegOutDestination,
  type VegOutProduct,
  type VegOutStock
} from '@/api/djs-warehouse/inoutVeg';
import ScaleFillBar from '../../production/packEntry/components/ScaleFillBar.vue';
import WeightNumpad from '../../production/packEntry/components/WeightNumpad.vue';
import TareSelector from '../../production/packEntry/components/TareSelector.vue';
import { useTare } from '../../production/packEntry/components/useTare';
import { confirmWeighing } from '../../production/packEntry/components/confirmWeighing';
import VegCardPager from './VegCardPager.vue';
import { isValidWeight, toKg } from './vegStation';

const { t } = useI18n();
const tr = (key: string) => t(`warehouseInout.${key}`);
const kg = toKg;

const products = ref<VegOutProduct[]>([]);
const stocks = ref<VegOutStock[]>([]);
const outOptions = ref<{ value: string; label: string }[]>([]);
const recent = ref<RecentDestination[]>([]);
const selectedProductId = ref('');
const selectedStockKey = ref('');
const weight = ref<number>();
// 去皮（V7-R4）：weight 是称重，库存校验与提交用实重
const tare = useTare('veg_out', weight);
const netWeight = tare.net;
const destination = ref<VegOutDestination>('warehouse');
const outDest = ref('');
const loading = ref(false);
const stocksLoading = ref(false);
const loadError = ref('');
const submitting = ref(false);
const finishing = ref(false);
const busy = computed(() => submitting.value || finishing.value);
let productGeneration = 0;
let refreshGeneration = 0;
onBeforeUnmount(() => {
  productGeneration++;
  refreshGeneration++;
});

const destinationOptions = computed<{ value: VegOutDestination; label: string }[]>(() => [
  { value: 'warehouse', label: tr('warehouseOut') },
  { value: 'feed', label: tr('pigFeed') },
  { value: 'poultry_feed', label: tr('poultryFeed') }
]);
const selectedProduct = computed(() => products.value.find((p) => p.productId === selectedProductId.value));
const selectedStock = computed(() => stocks.value.find((s) => stockKey(s) === selectedStockKey.value));
const overStock = computed(
  () =>
    !!selectedStock.value &&
    isValidWeight(netWeight.value) &&
    Math.round(netWeight.value * 1000) > Math.round(Number(selectedStock.value.stockWeight) * 1000)
);
const canSubmit = computed(
  () =>
    !!selectedProduct.value &&
    !!selectedStock.value &&
    isValidWeight(netWeight.value) &&
    !overStock.value &&
    (destination.value !== 'warehouse' || !!outDest.value)
);

function stockKey(stock: VegOutStock) {
  return `${stock.locationId}|${stock.plotId ?? ''}|${stock.earNo ?? ''}|${stock.thirdPhase ?? 0}`;
}

function plotLabel(stock: VegOutStock) {
  if (stock.thirdPhase === 1) return tr('thirdPhase');
  if (!stock.plotId) return tr('noPlot');
  return stock.plotCode || stock.plotName || '—';
}

function selectStock(stock: VegOutStock) {
  selectedStockKey.value = stockKey(stock);
  weight.value = undefined;
}

async function selectProduct(productId: string, keepStock = '') {
  const generation = ++productGeneration;
  selectedProductId.value = productId;
  selectedStockKey.value = '';
  weight.value = undefined;
  // 选择产品时默认【仓库出库】，出库去向回到「请选择」。
  destination.value = 'warehouse';
  outDest.value = '';
  stocks.value = [];
  if (!productId) {
    stocksLoading.value = false;
    return;
  }
  stocksLoading.value = true;
  try {
    const result = await getVegOutStocks(productId);
    if (generation !== productGeneration) return;
    stocks.value = result.data;
    if (stocks.value.some((s) => stockKey(s) === keepStock)) selectedStockKey.value = keepStock;
  } catch (error) {
    if (generation === productGeneration) loadError.value = error instanceof Error ? error.message : tr('loadFailed');
  } finally {
    if (generation === productGeneration) stocksLoading.value = false;
  }
}

async function refresh(keepProduct = selectedProductId.value, keepStock = selectedStockKey.value) {
  const generation = ++refreshGeneration;
  loading.value = true;
  loadError.value = '';
  try {
    const [productResult, dict, destinations] = await Promise.all([getVegOutProducts(), getDicts('djs_stock_out_dest'), getVegRecentOutDests()]);
    if (generation !== refreshGeneration) return;
    products.value = productResult.data;
    outOptions.value = dict.data.map((d) => ({ value: String(d.dictValue), label: d.dictLabel }));
    recent.value = destinations.data.filter((d) => outOptions.value.some((o) => o.value === d.value));
    const product = products.value.find((p) => p.productId === keepProduct) || products.value[0];
    await selectProduct(product?.productId || '', product?.productId === keepProduct ? keepStock : '');
  } catch (error) {
    if (generation === refreshGeneration) {
      loadError.value = error instanceof Error ? error.message : tr('loadFailed');
      products.value = [];
      await selectProduct('');
    }
  } finally {
    if (generation === refreshGeneration) loading.value = false;
  }
}

async function submit() {
  const product = selectedProduct.value;
  const stock = selectedStock.value;
  const net = netWeight.value;
  if (busy.value || !canSubmit.value || !product || !stock || weight.value === undefined || net === undefined) return;
  submitting.value = true;
  const keep = stockKey(stock);
  try {
    const option = destinationOptions.value.find((o) => o.value === destination.value)?.label || '';
    const dest = destination.value === 'warehouse' ? outOptions.value.find((o) => o.value === outDest.value)?.label : '';
    await confirmWeighing({ direction: 'out', gross: weight.value, tare: tare.tareKg.value, net, destination: dest ? `${option}：${dest}` : option });
    await submitVegOut({
      productId: product.productId,
      stockIds: [...stock.stockIds],
      weight: net.toFixed(3),
      destination: destination.value,
      ...(destination.value === 'warehouse' ? { outDest: outDest.value } : {})
    });
    ElMessage.success(tr('vegOutSaved'));
    weight.value = undefined;
    await refresh(product.productId, keep);
  } catch {
    // 取消确认，或 request.ts 已提示服务端原因；保留输入以便修正后重试。
  } finally {
    submitting.value = false;
  }
}

/** 出库完成：确认后将所选地块/库位库存组的实时剩余量计为毛菜处理损耗。 */
async function finishProduct() {
  const product = selectedProduct.value;
  const stock = selectedStock.value;
  if (busy.value || !product || !stock) return;
  const stockIds = [...stock.stockIds];
  finishing.value = true;
  try {
    await ElMessageBox.confirm(tr('vegOutFinishConfirm'), `${product.productName} · ${plotLabel(stock)} · ${stock.locationName || '—'}`, {
      type: 'warning',
      confirmButtonText: tr('confirmFinish')
    });
    await finishVegOut({ productId: product.productId, stockIds });
    ElMessage.success(tr('vegOutFinished'));
    selectedStockKey.value = '';
    weight.value = undefined;
    destination.value = 'warehouse';
    outDest.value = '';
    await refresh(product.productId, '');
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(tr('vegOutFinishFailed'));
    // 取消或失败均保留选择和输入；request.ts 同时展示服务端的具体拒绝原因。
  } finally {
    finishing.value = false;
  }
}

onMounted(() => refresh());
</script>

<style scoped lang="scss">
@use './vegStation.scss';
</style>
