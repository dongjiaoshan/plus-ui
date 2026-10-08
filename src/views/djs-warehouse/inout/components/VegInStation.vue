<template>
  <div class="veg-station">
    <main class="station-main">
      <h2 class="station-title">{{ tr('vegInTitle') }}</h2>
      <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" show-icon />
      <h3 class="section-heading">{{ tr('cropName') }}</h3>
      <div v-loading="loading" class="card-area">
        <VegCardPager
          :items="crops"
          :item-key="(c: VegCrop) => c.cropId"
          :active-key="selectedCropId"
          :prev-label="tr('prevPage')"
          :next-label="tr('nextPage')"
        >
          <template #default="{ item }">
            <button
              type="button"
              class="info-card crop-card"
              :class="{ active: item.cropId === selectedCropId }"
              :aria-pressed="item.cropId === selectedCropId"
              :disabled="busy"
              @click="selectCrop(item.cropId)"
            >
              <strong class="card-title"
                ><el-icon class="leaf"><Grape /></el-icon>{{ item.cropName }}</strong
              >
              <span class="card-kv">
                <span>{{ tr('expectedYield') }}</span>
                <b>{{ kg(item.expectedYield) }}</b>
              </span>
              <span class="card-kv">
                <span>{{ tr('pickedYield') }}</span>
                <b class="metric">{{ kg(item.harvestWeight) }}</b>
              </span>
            </button>
          </template>
        </VegCardPager>
        <el-empty v-if="!crops.length && !loading" :description="tr('noCrops')" :image-size="64" />
      </div>
      <h3 class="section-heading">{{ tr('plotInfo') }}</h3>
      <div v-loading="plotsLoading" class="plot-grid">
        <button
          v-for="plot in plots"
          :key="plot.plantingRecordId"
          type="button"
          class="info-card plot-card"
          :class="{ active: plot.plantingRecordId === selectedPlotId, done: plot.weighStatus === 'done' }"
          :aria-pressed="plot.plantingRecordId === selectedPlotId"
          :disabled="busy || plot.weighStatus === 'done'"
          @click="selectPlot(plot)"
        >
          <strong class="card-title plot-code"
            ><el-icon><Location /></el-icon>{{ plot.plotCode || '—' }}
            <el-tag v-if="plot.weighStatus === 'done'" size="small" type="info" class="done-tag">{{ tr('weighDone') }}</el-tag></strong
          >
          <span class="card-kv">
            <span>{{ tr('expectedYield') }}</span>
            <b>{{ kg(plot.expectYield) }}</b>
          </span>
          <span class="card-kv right">
            <span>{{ tr('pickedYield') }}</span>
            <b class="metric">{{ kg(plot.harvestWeight) }}</b>
          </span>
        </button>
        <el-empty v-if="selectedCropId && !plots.length && !plotsLoading" :description="tr('noPlots')" :image-size="64" />
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
            ><el-icon><Grape /></el-icon>{{ selectedCrop?.cropName || '—' }}</span
          >
          <span v-if="selectedPlot" class="plot-chip">{{ selectedPlot.plotCode }}</span>
        </div>
        <el-button
          v-hasPermi="['djs:warehouse:inout:finish']"
          type="primary"
          class="finish-button"
          :loading="finishing"
          :disabled="busy || !selectedPlot || selectedPlot.weighStatus === 'done'"
          @click="finish"
          >{{ tr('vegFinishIn') }}</el-button
        >
      </div>
      <fieldset class="entry-fields" :disabled="busy || !selectedPlot">
        <div class="weight-label">
          <label>{{ tr('inWeight') }}</label>
          <ScaleFillBar v-model="weight" :in-gram="false" />
        </div>
        <WeightNumpad v-model="weight" unit="kg" :precision="3" :placeholder="tr('inWeight')" />
        <section class="info-section">
          <h4 class="info-title">{{ tr('inInfo') }}</h4>
          <label class="field-label"
            >{{ tr('inProduct') }}<span class="required-mark">*</span>
            <span v-if="selectedProduct" class="selected-hint">{{ tr('selected') }}：{{ selectedProduct.productName }}</span></label
          >
          <div class="option-row">
            <button
              v-for="product in products"
              :key="product.productId"
              type="button"
              class="option"
              :class="{ active: product.productId === productId }"
              :aria-pressed="product.productId === productId"
              @click="productId = product.productId"
            >
              {{ product.productName }}
            </button>
            <span v-if="!selectedPlot" class="hint">{{ tr('selectPlotFirst') }}</span>
            <span v-else-if="!products.length" class="hint">{{ tr('noConfiguredProduct') }}</span>
          </div>
          <label class="field-label">{{ tr('pickTeam') }}<span class="required-mark">*</span></label>
          <div class="option-row">
            <button
              v-for="team in teams"
              :key="team.teamId"
              type="button"
              class="option"
              :class="{ active: teamIds.includes(team.teamId) }"
              :aria-pressed="teamIds.includes(team.teamId)"
              @click="toggleTeam(team.teamId)"
            >
              {{ team.teamName }}
            </button>
          </div>
          <label class="field-label">{{ tr('perfPercent') }}<span class="required-mark">*</span></label>
          <div class="option-row perf-row">
            <button
              v-for="preset in PERF_PRESETS"
              :key="preset"
              type="button"
              class="option"
              :class="{ active: !customMode && perfPercent === preset }"
              :aria-pressed="!customMode && perfPercent === preset"
              @click="choosePreset(preset)"
            >
              {{ preset }}%
            </button>
            <button type="button" class="option" :class="{ active: customMode }" :aria-pressed="customMode" @click="customMode = true">
              {{ tr('custom') }}
            </button>
            <el-input
              v-if="customMode"
              v-model="customText"
              class="custom-input"
              :placeholder="tr('customPercentPlaceholder')"
              maxlength="2"
              inputmode="numeric"
            >
              <template #suffix>%</template>
            </el-input>
          </div>
          <p v-if="customMode && customText && customPercent === null" class="field-error" role="alert">{{ tr('invalidPercent') }}</p>
          <label class="field-label">{{ tr('destination') }}</label>
          <div class="option-row">
            <button type="button" class="option active" aria-pressed="true">{{ destinationName || tr('freshVegRoom') }}</button>
          </div>
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
          >{{ tr('confirmIn') }}</el-button
        >
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
/**
 * 果蔬入库管理（V6 row282）：作物 / 地块 / 产品与小程序毛菜处理同源，确认入库 = 小程序采摘录入，
 * 处理完成 = 小程序「地块是否称重完成」（0 kg 收口），记账全部在后端毛菜处理入口。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Grape, Location, Refresh } from '@element-plus/icons-vue';
import {
  finishVegIn,
  getVegCrops,
  getVegInOptions,
  getVegPlots,
  submitVegIn,
  type VegCrop,
  type VegPlot,
  type VegTeamOption
} from '@/api/djs-warehouse/inoutVeg';
import ScaleFillBar from '../../production/packEntry/components/ScaleFillBar.vue';
import WeightNumpad from '../../production/packEntry/components/WeightNumpad.vue';
import VegCardPager from './VegCardPager.vue';
import { PERF_PRESETS, defaultProductId, isValidWeight, selectableProducts, toCustomPercent, toKg } from './vegStation';

const { t } = useI18n();
const tr = (key: string) => t(`warehouseInout.${key}`);
const kg = toKg;

const crops = ref<VegCrop[]>([]);
const plots = ref<VegPlot[]>([]);
const teams = ref<VegTeamOption[]>([]);
const destinationName = ref('');
const selectedCropId = ref('');
const selectedPlotId = ref('');
const productId = ref('');
const weight = ref<number>();
const teamIds = ref<string[]>([]);
const perfPercent = ref<number>(100);
const customMode = ref(false);
const customText = ref('');
const loading = ref(false);
const plotsLoading = ref(false);
const loadError = ref('');
const submitting = ref(false);
const finishing = ref(false);
const busy = computed(() => submitting.value || finishing.value);
let cropGeneration = 0;
let refreshGeneration = 0;
onBeforeUnmount(() => {
  cropGeneration++;
  refreshGeneration++;
});

const selectedCrop = computed(() => crops.value.find((c) => c.cropId === selectedCropId.value));
const selectedPlot = computed(() => plots.value.find((p) => p.plantingRecordId === selectedPlotId.value));
const products = computed(() => selectableProducts(selectedPlot.value?.products));
const selectedProduct = computed(() => products.value.find((p) => p.productId === productId.value));
const customPercent = computed(() => toCustomPercent(customText.value));
const effectivePercent = computed<number | null>(() => (customMode.value ? customPercent.value : perfPercent.value));
const canSubmit = computed(
  () =>
    !!selectedPlot.value &&
    selectedPlot.value.weighStatus !== 'done' &&
    isValidWeight(weight.value) &&
    teamIds.value.length > 0 &&
    effectivePercent.value !== null &&
    (!products.value.length || !!selectedProduct.value)
);

function choosePreset(value: number) {
  customMode.value = false;
  customText.value = '';
  perfPercent.value = value;
}

function toggleTeam(teamId: string) {
  teamIds.value = teamIds.value.includes(teamId) ? teamIds.value.filter((id) => id !== teamId) : [...teamIds.value, teamId];
}

function selectPlot(plot: VegPlot) {
  if (plot.weighStatus === 'done') return;
  selectedPlotId.value = plot.plantingRecordId;
  productId.value = defaultProductId(plot.products);
  weight.value = undefined;
}

async function selectCrop(cropId: string, keepPlot = '') {
  const generation = ++cropGeneration;
  selectedCropId.value = cropId;
  selectedPlotId.value = '';
  productId.value = '';
  weight.value = undefined;
  plots.value = [];
  if (!cropId) {
    plotsLoading.value = false;
    return;
  }
  plotsLoading.value = true;
  try {
    const result = await getVegPlots(cropId);
    if (generation !== cropGeneration) return;
    plots.value = result.data;
    const previous = plots.value.find((p) => p.plantingRecordId === keepPlot && p.weighStatus !== 'done');
    if (previous) selectPlot(previous);
  } catch (error) {
    if (generation === cropGeneration) loadError.value = error instanceof Error ? error.message : tr('loadFailed');
  } finally {
    if (generation === cropGeneration) plotsLoading.value = false;
  }
}

async function refresh(keepCrop = selectedCropId.value, keepPlot = selectedPlotId.value) {
  const generation = ++refreshGeneration;
  loading.value = true;
  loadError.value = '';
  try {
    const [cropResult, optionResult] = await Promise.all([getVegCrops(), getVegInOptions()]);
    if (generation !== refreshGeneration) return;
    crops.value = cropResult.data;
    teams.value = optionResult.data.teams;
    destinationName.value = optionResult.data.destinationName || '';
    teamIds.value = teamIds.value.filter((id) => teams.value.some((team) => team.teamId === id));
    const crop = crops.value.find((c) => c.cropId === keepCrop) || crops.value[0];
    await selectCrop(crop?.cropId || '', crop?.cropId === keepCrop ? keepPlot : '');
  } catch (error) {
    if (generation === refreshGeneration) {
      loadError.value = error instanceof Error ? error.message : tr('loadFailed');
      crops.value = [];
      await selectCrop('');
    }
  } finally {
    if (generation === refreshGeneration) loading.value = false;
  }
}

async function submit() {
  const plot = selectedPlot.value;
  const percent = effectivePercent.value;
  if (busy.value || !canSubmit.value || !plot || percent === null || weight.value === undefined) return;
  submitting.value = true;
  try {
    await submitVegIn({
      plantingRecordId: plot.plantingRecordId,
      ...(productId.value ? { productId: productId.value } : {}),
      weight: weight.value.toFixed(3),
      teamIds: [...teamIds.value],
      perfPercent: percent
    });
    ElMessage.success(tr('vegInSaved'));
    weight.value = undefined;
    await refresh(selectedCropId.value, plot.plantingRecordId);
  } catch {
    // request.ts 已提示服务端原因；保留输入以便修正后重试。
  } finally {
    submitting.value = false;
  }
}

async function finish() {
  const plot = selectedPlot.value;
  if (busy.value || !plot || plot.weighStatus === 'done') return;
  if (weight.value !== undefined && weight.value > 0) {
    ElMessage.warning(tr('vegFinishHasWeight'));
    return;
  }
  const percent = effectivePercent.value;
  if (!teamIds.value.length) {
    ElMessage.warning(tr('selectTeam'));
    return;
  }
  if (percent === null) {
    ElMessage.warning(tr('invalidPercent'));
    return;
  }
  finishing.value = true;
  try {
    await ElMessageBox.confirm(tr('vegFinishConfirm'), plot.plotCode || tr('plotInfo'), {
      type: 'warning',
      confirmButtonText: tr('confirmFinish')
    });
    await finishVegIn({ plantingRecordId: plot.plantingRecordId, teamIds: [...teamIds.value], perfPercent: percent });
    ElMessage.success(tr('vegFinished'));
    await refresh(selectedCropId.value, '');
  } catch {
    // 取消或后端拒绝（如种植采收未完成）时保持当前选择。
  } finally {
    finishing.value = false;
  }
}

onMounted(() => refresh());
</script>

<style scoped lang="scss">
@use './vegStation.scss';
</style>
