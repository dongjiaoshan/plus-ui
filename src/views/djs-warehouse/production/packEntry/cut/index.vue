<template>
  <div class="pack-station">
    <div class="station-title">{{ t('djs.warehouse.packEntry.cutTitle') }}</div>

    <!-- 分割单 chip 行（猪只耳号；来源 cut_record picked/cutting） -->
    <div v-loading="cuttableLoading" class="chip-row">
      <template v-if="cuttable.length > 0">
        <button
          v-for="r in cuttable"
          :key="String(r.id)"
          type="button"
          class="cut-chip"
          :class="{ active: String(form.cutRecordId) === String(r.id) }"
          @click="form.cutRecordId = r.id"
        >
          <div class="chip-line chip-line-ear">
            <el-icon><PriceTag /></el-icon>
            <span class="chip-main">{{ r.earNo ?? r.cutId }}</span>
          </div>
          <div v-if="r.pickupWeight != null" class="chip-line">
            {{ t('djs.warehouse.packEntry.whiteBarWeightShort') }}：{{ Number(r.pickupWeight).toFixed(2) }}kg
          </div>
          <div v-if="r.remainingWeight != null" class="chip-line">
            {{ t('djs.warehouse.packEntry.remainWeightLabel') }}：{{ Number(r.remainingWeight).toFixed(2) }}kg
          </div>
        </button>
      </template>
      <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.noCuttable') }}</span>
    </div>

    <div class="station-body">
      <!-- 左：分割产品卡片网格（按具体产品 belong_type=pork） -->
      <div class="station-left">
        <ProductCardGrid v-model="selectedProductId" :items="porkProducts" :loading="porkProductLoading" :show-stock="false" />
      </div>

      <!-- 右：操作 panel -->
      <div class="station-right">
        <div class="panel-title">{{ t('djs.warehouse.packEntry.operation') }}</div>

        <!-- 猪只耳号 chip（当前选中分割单回显）+ 行尾「分割完成」按钮 -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.earNo') }}</div>
          <div class="ear-row">
            <div v-if="selectedCut" class="ear-chip">
              <el-icon><PriceTag /></el-icon>
              <span>{{ selectedCut.earNo ?? selectedCut.cutId }}</span>
            </div>
            <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.cutRecordRequired') }}</span>
            <el-button type="warning" plain :loading="cutDoneSubmitting" class="finish-cut-btn" @click="openCutDone">
              {{ t('djs.warehouse.packEntry.finishCutShort') }}
            </el-button>
          </div>
        </div>

        <!-- 产品重量 numpad -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.productWeight') }}</div>
          <WeightNumpad v-model="curWeight" :placeholder="t('djs.warehouse.packEntry.weightPlaceholder')" unit="kg" :precision="3" />
        </div>

        <!-- 入库位置 button-toggle（冻品库/鲜品库 等冷库库位） -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.inLocation') }}</div>
          <div v-loading="locationLoading">
            <DestToggle v-model="form.locationId" :options="locationOptions" :empty-text="t('djs.warehouse.packEntry.locationPlaceholder')" />
          </div>
        </div>

        <div class="panel-actions">
          <el-button type="primary" size="large" class="action-btn" :loading="cutOutSubmitting" @click="handleCutOut">
            {{ t('djs.warehouse.packEntry.confirmCutOut') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 白条完成分割（滴水损失） -->
    <el-dialog v-model="cutDoneVisible" :title="t('djs.warehouse.packEntry.finishCut')" width="420px" append-to-body destroy-on-close>
      <el-form ref="doneFormRef" :model="doneForm" label-width="110px">
        <el-alert :title="t('djs.warehouse.packEntry.dripLossAutoHint')" type="info" :closable="false" show-icon class="mb-3" />
        <el-form-item :label="t('djs.warehouse.packEntry.remark')" prop="remark">
          <el-input v-model="doneForm.remark" type="textarea" :rows="2" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="cutDoneSubmitting" @click="handleCutDone">{{ t('common.confirm') }}</el-button>
        <el-button @click="cutDoneVisible = false">{{ t('common.cancel') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PackEntryCut" lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { PriceTag } from '@element-plus/icons-vue';
import ProductCardGrid from '../components/ProductCardGrid.vue';
import WeightNumpad from '../components/WeightNumpad.vue';
import DestToggle from '../components/DestToggle.vue';
import { usePackEntryOptions } from '../useOptions';
import { listCuttable, submitCutDone, submitCutOut } from '@/api/djs-warehouse/packEntry';
import type { PigCutRecordVO } from '@/api/djs-warehouse/packEntry';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';

const { t } = useI18n();

const { locations, locationLoading, loadLocations } = usePackEntryOptions();

// 分割入库库位仅展示「猪肉鲜品库」「冻品库」两类（按库位名称过滤；其它库位不作为分割产出入库目标）
const locationOptions = computed<{ value: number | string; label: string }[]>(() =>
  locations.value
    .filter((l) => {
      const name = l.locationName ?? '';
      return name.includes('冻品') || name.includes('猪肉鲜品');
    })
    .map((l) => ({ value: l.id, label: l.locationName }))
);

// 可选分割产品：产品主数据 belong_type=pork + **原材料(attr=2)**（doc/14：分割只产原料，领用原料→打包成成品）
const porkProducts = ref<ProductInfoVO[]>([]);
const porkProductLoading = ref(false);

async function loadPorkProducts() {
  porkProductLoading.value = true;
  try {
    // 分割车间(productWorkshop=2) 的猪肉**原材料**(productAttr=2)：分割产出入冷库的是原料，不是成品。
    // 成品(attr=1)由打包产出、不可被分割/领用（领用都是原材料，doc/14 §1）。
    const res = await listProduct({ pageNum: 1, pageSize: 500, belongType: 'pork', productWorkshop: 2, productAttr: 2, productStatus: 0 } as any);
    porkProducts.value = ((res as any).rows ?? []) as ProductInfoVO[];
  } finally {
    porkProductLoading.value = false;
  }
}

const cuttable = ref<PigCutRecordVO[]>([]);
const cuttableLoading = ref(false);

async function loadCuttable() {
  cuttableLoading.value = true;
  try {
    const res = await listCuttable();
    cuttable.value = ((res as any).data ?? []) as PigCutRecordVO[];
  } finally {
    cuttableLoading.value = false;
  }
}

const form = ref<{ cutRecordId: number | string | ''; locationId: number | string | '' }>({
  cutRecordId: '',
  locationId: ''
});

// 当前录入的单件分割产品（卡片选品 + numpad 录重 → 确认入库逐件提交）
const selectedProductId = ref<number | string | ''>('');
const curWeight = ref<number | undefined>(undefined);

// P4：选产品后按所选产品配置的入库库位（store_location_id CSV 首个有效项）自动填表单库位。
// 仅当解析出的库位在可选库位范围（冻品/猪肉鲜品库）内、且用户尚未选库位时自动填，不覆盖用户手选。
function resolvePresetLocationId(product: ProductInfoVO | undefined): number | string | '' {
  if (!product?.storeLocationId) return '';
  for (const token of String(product.storeLocationId).split(',')) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    const candidate = Number(trimmed);
    if (Number.isNaN(candidate)) continue;
    if (locationOptions.value.some((o) => String(o.value) === String(candidate))) {
      return candidate;
    }
  }
  return '';
}

watch(selectedProductId, (pid) => {
  if (!pid) return;
  if (form.value.locationId) return; // 用户已选库位，不覆盖
  const product = porkProducts.value.find((p) => String(p.id) === String(pid));
  const preset = resolvePresetLocationId(product);
  if (preset !== '') {
    form.value.locationId = preset;
  }
});

const selectedCut = computed(() => cuttable.value.find((r) => String(r.id) === String(form.value.cutRecordId)));

const cutOutSubmitting = ref(false);

async function handleCutOut() {
  if (!form.value.cutRecordId) {
    ElMessage.warning(t('djs.warehouse.packEntry.cutRecordRequired'));
    return;
  }
  if (!selectedProductId.value) {
    ElMessage.warning(t('djs.warehouse.packEntry.cutProductRequired'));
    return;
  }
  if (!curWeight.value || curWeight.value <= 0) {
    ElMessage.warning(t('djs.warehouse.packEntry.productWeightRequired'));
    return;
  }
  if (!form.value.locationId) {
    ElMessage.warning(t('djs.warehouse.packEntry.locationRequired'));
    return;
  }
  // 超量软校验（前端，与后端同口径：本次重量 ≤ 当前剩余可分割重量；后端为硬校验兜底）
  const remaining = selectedCut.value?.remainingWeight;
  if (remaining != null && curWeight.value > Number(remaining)) {
    ElMessage.warning(t('djs.warehouse.packEntry.cutOutExceed', { remaining: Number(remaining).toFixed(2) }));
    return;
  }
  cutOutSubmitting.value = true;
  try {
    await submitCutOut({
      cutRecordId: form.value.cutRecordId as number | string,
      locationId: form.value.locationId as number | string,
      partItems: [{ productId: selectedProductId.value as number | string, productWeight: curWeight.value }]
    });
    ElMessage.success(t('djs.warehouse.packEntry.cutOutSuccess'));
    // 逐件录入：清当前产品/重量，保留分割单 + 库位方便连续称重
    selectedProductId.value = '';
    curWeight.value = undefined;
    await loadCuttable();
  } finally {
    cutOutSubmitting.value = false;
  }
}

// ---- 白条完成分割 ----
const cutDoneVisible = ref(false);
const cutDoneSubmitting = ref(false);
const doneFormRef = ref<any>();
const doneForm = ref<{ remark: string | undefined }>({ remark: undefined });

function openCutDone() {
  if (!form.value.cutRecordId) {
    ElMessage.warning(t('djs.warehouse.packEntry.cutRecordRequired'));
    return;
  }
  doneForm.value = { remark: undefined };
  cutDoneVisible.value = true;
}

async function handleCutDone() {
  // 滴水损耗由后端自动计算（白条入库重量 − 出库重量），前端不再录入
  cutDoneSubmitting.value = true;
  try {
    await submitCutDone({
      cutRecordId: form.value.cutRecordId as number | string,
      remark: doneForm.value.remark
    });
    ElMessage.success(t('djs.warehouse.packEntry.finishCutSuccess'));
    cutDoneVisible.value = false;
    form.value = { cutRecordId: '', locationId: '' };
    selectedProductId.value = '';
    curWeight.value = undefined;
    await loadCuttable();
  } finally {
    cutDoneSubmitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadLocations(), loadCuttable(), loadPorkProducts()]);
});
</script>

<style scoped>
.pack-station {
  padding: 12px;
}
.station-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  min-height: 40px;
}
.cut-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 200px;
  padding: 10px 14px;
  border: 1px solid var(--el-color-warning);
  border-radius: 8px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  cursor: pointer;
  transition: all 0.12s ease;
}
.cut-chip.active {
  box-shadow: 0 0 0 1px var(--el-color-warning);
}
.chip-line {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.chip-line-ear {
  display: flex;
  align-items: center;
  gap: 6px;
}
.chip-main {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-color-warning-dark-2);
}
.station-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.station-left {
  flex: 1;
  min-width: 0;
}
.station-right {
  flex: 0 0 440px;
  width: 440px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 24px;
  background: var(--el-bg-color);
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 18px;
  color: var(--el-text-color-secondary);
}
.panel-section {
  margin-bottom: 22px;
}
.panel-label {
  font-size: 15px;
  color: var(--el-text-color-regular);
  margin-bottom: 10px;
}
.ear-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.finish-cut-btn {
  flex: 0 0 auto;
}
.ear-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  border: 1px solid var(--el-color-warning-light-5);
  font-weight: 600;
  font-size: 16px;
}
.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}
.action-btn {
  width: 100%;
  height: 56px;
  font-size: 18px;
}
/* 触屏放大：数字键盘 / 入库位置按钮 */
.station-right :deep(.numpad-display) {
  height: 56px;
}
.station-right :deep(.numpad-input) {
  font-size: 22px;
}
.station-right :deep(.numpad-key) {
  height: 56px;
  font-size: 22px;
}
.station-right :deep(.dest-btn) {
  min-width: 96px;
  height: 52px;
  font-size: 16px;
}
</style>
