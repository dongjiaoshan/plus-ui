<template>
  <div class="inout-station" :data-mode="mode">
    <main class="station-main">
      <header class="station-heading">
        <h2>{{ tr(isBurn ? 'pigTitle' : 'cutTitle') }}</h2>
        <el-button :loading="loading" :disabled="busy" @click="refresh()">{{ tr('refresh') }}</el-button>
      </header>
      <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" show-icon />
      <div v-loading="loading" class="source-strip" :aria-label="tr(isBurn ? 'pigs' : 'bars')">
        <button
          v-for="source in sources"
          :key="source.key"
          type="button"
          class="source-card"
          :class="{ active: source.key === selectedKey }"
          :disabled="busy || loading"
          :aria-pressed="source.key === selectedKey"
          @click="selectSource(source.key)"
        >
          <strong>{{ source.label }}</strong>
          <template v-if="source.pig">
            <span>{{ tr('marketingTime') }}：{{ source.pig.marketingTime || '—' }}</span>
            <span>{{ tr('marketingWeight') }}：{{ kg(source.pig.marketingWeight) }}</span>
            <span>{{ tr('receiveTime') }}：{{ source.pig.receiveTime || '—' }}</span>
            <span>{{ tr('receiveWeight') }}：{{ kg(source.pig.arriveWeight) }}</span>
          </template>
          <template v-else-if="source.bar">
            <span class="bar-number">{{ tr('whiteBarNo') }}：{{ source.bar.whiteBarNo || '—' }}</span>
            <span>{{ tr('inTime') }}：{{ source.bar.inTime || '—' }}</span>
            <span>{{ tr('inWeight') }}：{{ kg(source.bar.inWeight) }}</span>
            <span>{{ tr('operateTime') }}：{{ source.bar.operateTime || '—' }}</span>
            <span class="remaining">{{ tr('remaining') }}：{{ kg(source.bar.remainingWeight) }}</span>
          </template>
        </button>
        <el-empty v-if="!sources.length && !loading" :description="tr(isBurn ? 'noPigs' : 'noBars')" :image-size="64" />
      </div>
      <h3 class="products-heading">{{ tr('productList') }}</h3>
      <div v-loading="productsLoading" class="product-grid">
        <button
          v-for="product in products"
          :key="product.productId"
          class="product-card"
          :class="{ active: product.productId === selectedProductId, processed: isFull(product) }"
          type="button"
          :disabled="busy || loading || productsLoading || !selectedSource || isFull(product)"
          :aria-pressed="product.productId === selectedProductId"
          @click="selectProduct(product)"
        >
          <el-image v-if="product.imageUrl" :src="product.imageUrl" fit="contain" class="product-image">
            <template #error
              ><span class="image-fallback">{{ product.productName }}</span></template
            >
          </el-image>
          <el-icon v-else class="product-image product-placeholder"><Box /></el-icon>
          <strong>{{ product.productName }}</strong>
          <span v-if="isBurn" class="product-count">
            {{ isFull(product) && product.maxCount !== 2 ? tr('processed') : `${product.recordedCount || 0}/${product.maxCount || 1}` }}
          </span>
        </button>
        <el-empty v-if="selectedSource && !products.length && !productsLoading" :description="tr('noProducts')" :image-size="64" />
      </div>
    </main>
    <aside class="station-panel">
      <div class="ear-section">
        <label>{{ tr('earNo') }}</label>
        <div class="ear-row">
          <strong class="ear-chip">{{ selectedSource?.label || '—' }}</strong>
          <el-button
            v-hasPermi="['djs:warehouse:inout:finish']"
            type="primary"
            class="finish-button"
            :loading="finishing"
            :disabled="busy || loading || !selectedSource || (!isBurn && !selectedSource.bar?.cutRecordId)"
            @click="finish"
            >{{ tr(isBurn ? 'finishBurn' : 'finishCut') }}</el-button
          >
        </div>
      </div>
      <fieldset :disabled="busy || loading || productsLoading || storesLoading || !selectedProduct" class="entry-fields">
        <div class="weight-label">
          <label>{{ selectedProduct?.productName || tr('productWeight') }}</label>
          <ScaleFillBar v-model="weight" :in-gram="false" />
        </div>
        <WeightNumpad v-model="weight" unit="kg" :precision="3" :placeholder="tr('weightPlaceholder')" />
        <section class="destination-section">
          <label>{{ tr('destination') }}</label>
          <div class="destination-options">
            <button
              v-for="option in destinationOptions"
              :key="option.value"
              type="button"
              :class="{ active: destination === option.value }"
              :aria-pressed="destination === option.value"
              @click="destination = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <template v-if="destination === 'store'">
            <label>{{ tr('store') }}</label>
            <el-select v-model="storeId" :placeholder="tr('selectStore')" :disabled="busy || storesLoading" class="destination-select">
              <el-option v-for="store in stores" :key="store.storeId" :value="store.storeId" :label="`${store.storeName} (${store.copies})`" />
            </el-select>
          </template>
          <template v-if="destination === 'outbound'">
            <label>{{ tr('outDestination') }}</label>
            <el-select v-model="outDest" :placeholder="tr('selectOutDest')" :disabled="busy" clearable class="destination-select">
              <el-option v-for="option in outOptions" :key="option.value" :value="option.value" :label="option.label" />
            </el-select>
            <div v-if="recent.length" class="recent-destinations">
              <span>{{ tr('frequent') }}</span>
              <button
                v-for="option in recent"
                :key="option.value"
                type="button"
                :class="{ active: outDest === option.value }"
                @click="outDest = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </template>
        </section>
      </fieldset>
      <div class="panel-actions">
        <el-button
          v-hasPermi="['djs:warehouse:inout:submit']"
          type="primary"
          class="submit-button"
          :loading="submitting"
          :disabled="busy || loading || productsLoading || storesLoading || !canSubmit"
          @click="submit"
          >{{ tr(isOutbound ? 'confirmOut' : 'confirmIn') }}</el-button
        >
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Box } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/modules/user';
import { getDicts } from '@/api/system/dict/data';
import {
  getBurnPigs,
  getBurnProducts,
  getCutBars,
  getCutProducts,
  getShipStores,
  getRecentOutDests,
  submitBurn,
  submitCut,
  checkBurnFinish,
  checkCutFinish,
  finishBurn,
  finishCut,
  type BurnPig,
  type CutBar,
  type InoutProduct,
  type ShipStore,
  type RecentDestination,
  type BurnDestination,
  type CutDestination
} from '@/api/djs-warehouse/inout';
import ScaleFillBar from '../../production/packEntry/components/ScaleFillBar.vue';
import WeightNumpad from '../../production/packEntry/components/WeightNumpad.vue';
import { operationKey } from './operationKey';

const props = defineProps<{ mode: 'burn' | 'cut' }>();
const { t } = useI18n();
const tr = (key: string) => t(`warehouseInout.${key}`);
const isBurn = computed(() => props.mode === 'burn');
interface Source {
  key: string;
  label: string;
  time: string;
  pig?: BurnPig;
  bar?: CutBar;
}
const sources = ref<Source[]>([]);
const products = ref<InoutProduct[]>([]);
const stores = ref<ShipStore[]>([]);
const recent = ref<RecentDestination[]>([]);
const outOptions = ref<{ value: string; label: string }[]>([]);
const selectedKey = ref('');
const selectedProductId = ref('');
const selectedSource = computed(() => sources.value.find((s) => s.key === selectedKey.value));
const selectedProduct = computed(() => products.value.find((p) => p.productId === selectedProductId.value));
const weight = ref<number>();
const destination = ref<BurnDestination | CutDestination>('outbound');
const storeId = ref('');
const outDest = ref('');
const loading = ref(false);
const productsLoading = ref(false);
const storesLoading = ref(false);
const loadError = ref('');
const submitting = ref(false);
const finishing = ref(false);
const busy = computed(() => submitting.value || finishing.value);
const isOutbound = computed(() => destination.value === 'store' || destination.value === 'outbound');
const requests = operationKey(sessionStorage, `${useUserStore().userId}:${props.mode}`);
let sourceGeneration = 0;
let productGeneration = 0;
let refreshGeneration = 0;
onBeforeUnmount(() => {
  sourceGeneration++;
  productGeneration++;
  refreshGeneration++;
});

const destinationOptions = computed(() => {
  if (!isBurn.value)
    return [
      { value: 'outbound' as const, label: tr('warehouseOut') },
      { value: 'fresh' as const, label: tr('fresh') },
      { value: 'frozen' as const, label: tr('frozen') }
    ];
  if (selectedProduct.value?.isWhiteBar)
    return [
      { value: 'warehouse' as const, label: tr('whiteBarWarehouse') },
      { value: 'store' as const, label: tr('store') }
    ];
  return [
    { value: 'warehouse' as const, label: selectedProduct.value?.defaultLocationName || tr('defaultWarehouse') },
    { value: 'outbound' as const, label: tr('warehouseOut') }
  ];
});
function kg(value: string | number | undefined) {
  return value == null ? '—' : `${Number(value).toFixed(3)} kg`;
}
function isFull(product: InoutProduct) {
  if (!isBurn.value) return false;
  const count = product.isWhiteBar
    ? products.value.filter((p) => p.isWhiteBar).reduce((total, p) => total + (p.recordedCount || 0), 0)
    : product.recordedCount || 0;
  return count >= (product.maxCount || 1);
}
const canSubmit = computed(
  () =>
    !!selectedSource.value &&
    !!selectedProduct.value &&
    !isFull(selectedProduct.value) &&
    Number.isFinite(weight.value) &&
    (weight.value || 0) > 0 &&
    (destination.value !== 'store' || !!storeId.value) &&
    (destination.value !== 'outbound' || !!outDest.value)
);

async function selectSource(key: string, keepProduct = '') {
  const generation = ++sourceGeneration;
  productGeneration++;
  if (key) loadError.value = '';
  selectedKey.value = key;
  selectedProductId.value = '';
  weight.value = undefined;
  products.value = [];
  stores.value = [];
  storesLoading.value = false;
  if (!key) {
    productsLoading.value = false;
    return;
  }
  productsLoading.value = true;
  try {
    const result = isBurn.value ? await getBurnProducts(key) : await getCutProducts();
    if (generation !== sourceGeneration) return;
    products.value = result.data;
    const previous = products.value.find((p) => p.productId === keepProduct && !isFull(p));
    const product = previous || products.value.find((p) => !isFull(p));
    if (product) await selectProduct(product);
  } catch (error) {
    if (generation === sourceGeneration) loadError.value = error instanceof Error ? error.message : tr('loadFailed');
  } finally {
    if (generation === sourceGeneration) productsLoading.value = false;
  }
}

async function selectProduct(product: InoutProduct) {
  const generation = ++productGeneration;
  loadError.value = '';
  selectedProductId.value = product.productId;
  weight.value = undefined;
  outDest.value = '';
  storeId.value = '';
  stores.value = [];
  destination.value = isBurn.value ? 'warehouse' : 'outbound';
  storesLoading.value = false;
  if (!isBurn.value || !product.isWhiteBar) return;
  storesLoading.value = true;
  try {
    const result = await getShipStores(product.productId);
    if (generation !== productGeneration) return;
    stores.value = result.data;
    if (stores.value.length) {
      destination.value = 'store';
      storeId.value = stores.value[0].storeId;
    }
  } catch (error) {
    if (generation === productGeneration) {
      // A failed demand lookup is not evidence that no store needs stock.
      selectedProductId.value = '';
      loadError.value = error instanceof Error ? error.message : tr('loadFailed');
    }
  } finally {
    if (generation === productGeneration) storesLoading.value = false;
  }
}

async function refresh(preferredKey = selectedKey.value, keepProduct = selectedProductId.value) {
  const generation = ++refreshGeneration;
  sourceGeneration++;
  productGeneration++;
  loading.value = true;
  loadError.value = '';
  try {
    const list = isBurn.value
      ? (await getBurnPigs()).data.map(
          (pig): Source => ({ key: pig.id, label: pig.earNo || pig.barId, time: pig.receiveTime || pig.marketingTime || '', pig })
        )
      : (await getCutBars()).data.map(
          (bar): Source => ({
            key: bar.cutRecordId ? `cut:${bar.cutRecordId}` : `in:${bar.inhouseId}`,
            label: bar.earNo || bar.whiteBarNo,
            time: bar.inTime || '',
            bar
          })
        );
    if (generation !== refreshGeneration) return;
    sources.value = list.sort((a, b) => b.time.localeCompare(a.time) || a.key.localeCompare(b.key));
    const selected = sources.value.find((s) => s.key === preferredKey) || sources.value[0];
    await selectSource(selected?.key || '', keepProduct);
    const [dict, destinations] = await Promise.all([getDicts('djs_stock_out_dest'), getRecentOutDests()]);
    if (generation !== refreshGeneration) return;
    outOptions.value = dict.data.map((d) => ({ value: String(d.dictValue), label: d.dictLabel }));
    recent.value = destinations.data.filter((d) => outOptions.value.some((o) => o.value === d.value));
  } catch (error) {
    if (generation === refreshGeneration) {
      loadError.value = error instanceof Error ? error.message : tr('loadFailed');
      sources.value = [];
      await selectSource('');
    }
  } finally {
    if (generation === refreshGeneration) loading.value = false;
  }
}

async function submit() {
  if (busy.value || loading.value || !canSubmit.value || !selectedSource.value || !selectedProduct.value) return;
  submitting.value = true;
  const source = selectedSource.value;
  const productId = selectedProduct.value.productId;
  const common = { productId, weight: Number(weight.value).toFixed(3) };
  let nextKey = source.key;
  try {
    if (isBurn.value && source.pig) {
      const payload = {
        ...common,
        barInfoId: source.pig.id,
        destination: destination.value as BurnDestination,
        ...(destination.value === 'store' ? { storeId: storeId.value } : {}),
        ...(destination.value === 'outbound' ? { outDest: outDest.value } : {})
      };
      await submitBurn({ ...payload, requestId: requests.forPayload(payload) });
      requests.acknowledge(payload);
    } else if (source.bar) {
      const payload = {
        ...common,
        ...(source.bar.cutRecordId ? { cutRecordId: source.bar.cutRecordId } : { inhouseId: source.bar.inhouseId }),
        destination: destination.value as CutDestination,
        ...(destination.value === 'outbound' ? { outDest: outDest.value } : {})
      };
      const receipt = await submitCut({ ...payload, requestId: requests.forPayload(payload) });
      requests.acknowledge(payload);
      if (receipt.data.cutRecordId) nextKey = `cut:${receipt.data.cutRecordId}`;
    }
    weight.value = undefined;
    ElMessage.success(tr('saved'));
    await refresh(nextKey, productId);
  } catch {
    // request.ts displays the server/transport failure; preserve the weight and request ID for retry.
  } finally {
    submitting.value = false;
  }
}

async function finish() {
  if (busy.value || !selectedSource.value) return;
  const source = selectedSource.value;
  const sourceId = source.pig?.id || source.bar?.cutRecordId;
  if (!sourceId) return;
  finishing.value = true;
  try {
    const { data: check } = source.pig ? await checkBurnFinish(sourceId) : await checkCutFinish(sourceId);
    await ElMessageBox.confirm(
      check.confirmationRequired ? check.message : tr(isBurn.value ? 'finishBurnConfirm' : 'finishCutConfirm'),
      source.label,
      { type: 'warning', ...(check.confirmationRequired ? { confirmButtonText: tr('confirmAnyway') } : {}) }
    );
    if (source.pig) await finishBurn(sourceId, check.confirmationRequired);
    else await finishCut(sourceId, check.confirmationRequired);
    ElMessage.success(tr('finished'));
    await refresh();
  } catch {
    // Cancellation or the backend's completion guard leaves the source available for correction.
  } finally {
    finishing.value = false;
  }
}
onMounted(() => refresh());
</script>

<style scoped lang="scss">
.inout-station {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 370px;
  gap: 14px;
  padding: 16px;
  min-height: calc(100vh - 105px);
  background: var(--el-fill-color-light);
}
.station-main {
  min-width: 0;
}
.station-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  h2 {
    margin: 0;
    font-size: 22px;
  }
}
.source-strip {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 10px;
  padding: 3px 2px 12px;
  min-height: 150px;
}
.source-card {
  flex: 0 0 262px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  font-size: 12px;
  cursor: pointer;
  strong {
    font-size: 15px;
    color: var(--el-text-color-primary);
  }
}
.active {
  border-color: var(--el-color-primary) !important;
  background: var(--el-color-primary-light-9) !important;
}
.remaining {
  color: var(--el-color-warning-dark-2);
  font-weight: 600;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  gap: 12px;
  padding-top: 6px;
}
.products-heading {
  font-size: 16px;
  margin: 12px 0;
}
.product-card {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  text-align: left;
  min-height: 80px;
  padding: 14px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  cursor: pointer;
  gap: 10px;
}
.product-image {
  width: 36px;
  height: 36px;
  grid-row: span 2;
}
.product-placeholder {
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 6px;
  font-size: 20px;
}
.image-fallback {
  color: var(--el-text-color-secondary);
}
.product-count {
  grid-column: 2;
  color: var(--el-color-primary);
}
.processed {
  opacity: 0.6;
}
.station-panel {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-self: start;
  position: sticky;
  top: 16px;
}
label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 10px;
}
.ear-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}
.ear-chip {
  font-size: 13px;
  overflow-wrap: anywhere;
  color: var(--el-color-primary);
}
.entry-fields {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.weight-label {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.destination-section {
  margin-top: 20px;
}
.destination-options {
  display: flex;
  gap: 6px;
  margin-bottom: 18px;
  button {
    flex: 1;
    min-height: 38px;
  }
}
.destination-options button,
.recent-destinations button {
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-radius: 6px;
  padding: 7px 10px;
  cursor: pointer;
}
.destination-select {
  width: 100%;
}
.recent-destinations {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  font-size: 12px;
}
.panel-actions {
  margin-top: auto;
  .submit-button {
    width: 100%;
    height: 46px;
    font-size: 17px;
  }
}
button:disabled {
  cursor: not-allowed;
}
@media (max-width: 1000px) {
  .inout-station {
    grid-template-columns: minmax(0, 1fr) 320px;
    padding: 10px;
    gap: 10px;
  }
  .station-panel {
    padding: 12px;
  }
}
@media (max-width: 700px) {
  .inout-station {
    grid-template-columns: minmax(0, 1fr);
  }
  .station-panel {
    position: static;
  }
}
</style>
