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
          <el-icon><PriceTag /></el-icon>
          <span class="chip-main">{{ r.earNo ?? r.cutId }}</span>
          <span class="chip-sub">
            {{ r.isHalf === 1 ? t('djs.warehouse.packEntry.half') : t('djs.warehouse.packEntry.whole') }}
            <template v-if="r.pickupWeight != null"> · {{ r.pickupWeight }}kg</template>
            · {{ cutStatusLabel(r.cutStatus) }}
          </span>
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

        <!-- 猪只耳号 chip（当前选中分割单回显） -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.earNo') }}</div>
          <div v-if="selectedCut" class="ear-chip">
            <el-icon><PriceTag /></el-icon>
            <span>{{ selectedCut.earNo ?? selectedCut.cutId }}</span>
          </div>
          <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.cutRecordRequired') }}</span>
        </div>

        <!-- 产品重量 numpad -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.productWeight') }}</div>
          <WeightNumpad v-model="curWeight" :placeholder="t('djs.warehouse.packEntry.weightPlaceholder')" unit="kg" :precision="3" />
        </div>

        <!-- 规格（可选） -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.productSpec') }}</div>
          <el-input v-model="curSpec" maxlength="64" :placeholder="t('djs.warehouse.packEntry.productSpecPlaceholder')" />
        </div>

        <!-- 入库位置 button-toggle（冻品库/鲜品库 等冷库库位） -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.inLocation') }}</div>
          <div v-loading="locationLoading">
            <DestToggle v-model="form.locationId" :options="locationOptions" :empty-text="t('djs.warehouse.packEntry.locationPlaceholder')" />
          </div>
        </div>

        <!-- 凭证图 -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.proof') }}</div>
          <OssUpload ref="ossRef" v-model="proofModel" biz-type="warehouse_pig_cut" :limit="5" :file-size="10" />
        </div>

        <div class="panel-actions">
          <el-button type="primary" size="large" class="action-btn" :loading="cutOutSubmitting" @click="handleCutOut">
            {{ t('djs.warehouse.packEntry.confirmCutOut') }}
          </el-button>
          <el-button type="primary" size="large" class="action-btn" :loading="cutDoneSubmitting" @click="openCutDone">
            {{ t('djs.warehouse.packEntry.finishCut') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 白条完成分割（滴水损失） -->
    <el-dialog v-model="cutDoneVisible" :title="t('djs.warehouse.packEntry.finishCut')" width="420px" append-to-body destroy-on-close>
      <el-form ref="doneFormRef" :model="doneForm" :rules="doneRules" label-width="110px">
        <el-form-item :label="t('djs.warehouse.packEntry.dripLoss')" prop="dripLoss">
          <el-input-number v-model="doneForm.dripLoss" :min="0" :precision="3" :step="0.1" controls-position="right" style="width: 200px" />
          <span class="ml-2 text-gray-500">kg</span>
        </el-form-item>
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
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { PriceTag } from '@element-plus/icons-vue';
import OssUpload from '@/components/OssUpload/index.vue';
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

const locationOptions = computed<{ value: number | string; label: string }[]>(() =>
  locations.value.map((l) => ({ value: l.id, label: l.locationName }))
);

const CUT_STATUS_LABEL: Record<string, string> = {
  pending_pickup: 'djs.warehouse.packEntry.cutStatusPendingPickup',
  picked: 'djs.warehouse.packEntry.cutStatusPicked',
  cutting: 'djs.warehouse.packEntry.cutStatusCutting',
  done: 'djs.warehouse.packEntry.cutStatusDone'
};
function cutStatusLabel(s: string): string {
  const key = CUT_STATUS_LABEL[s];
  return key ? t(key) : s;
}

// 可选分割产品（按具体产品对齐原型）：产品主数据 belong_type=pork 的猪肉分割成品
const porkProducts = ref<ProductInfoVO[]>([]);
const porkProductLoading = ref(false);

async function loadPorkProducts() {
  porkProductLoading.value = true;
  try {
    const res = await listProduct({ pageNum: 1, pageSize: 500, belongType: 'pork' } as any);
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

const form = ref<{ cutRecordId: number | string | ''; locationId: number | string | ''; proofOssIds: string | undefined }>({
  cutRecordId: '',
  locationId: '',
  proofOssIds: undefined
});

// 当前录入的单件分割产品（卡片选品 + numpad 录重 → 确认入库逐件提交）
const selectedProductId = ref<number | string | ''>('');
const curWeight = ref<number | undefined>(undefined);
const curSpec = ref<string | undefined>(undefined);

const selectedCut = computed(() => cuttable.value.find((r) => String(r.id) === String(form.value.cutRecordId)));

const ossRef = ref<InstanceType<typeof OssUpload>>();
const cutOutSubmitting = ref(false);

const proofModel = computed<string[]>({
  get: () => (form.value.proofOssIds ? form.value.proofOssIds.split(',').filter(Boolean) : []),
  set: (val: string[]) => {
    form.value.proofOssIds = val && val.length > 0 ? val.join(',') : undefined;
  }
});

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
  cutOutSubmitting.value = true;
  try {
    await submitCutOut({
      cutRecordId: form.value.cutRecordId as number | string,
      locationId: form.value.locationId as number | string,
      partItems: [{ productId: selectedProductId.value as number | string, productWeight: curWeight.value, productSpec: curSpec.value }],
      proofOssIds: form.value.proofOssIds
    });
    ElMessage.success(t('djs.warehouse.packEntry.cutOutSuccess'));
    // 逐件录入：清当前产品/重量/规格，保留分割单 + 库位方便连续称重
    selectedProductId.value = '';
    curWeight.value = undefined;
    curSpec.value = undefined;
    await loadCuttable();
  } finally {
    cutOutSubmitting.value = false;
  }
}

// ---- 白条完成分割 ----
const cutDoneVisible = ref(false);
const cutDoneSubmitting = ref(false);
const doneFormRef = ref<any>();
const doneForm = ref<{ dripLoss: number | undefined; remark: string | undefined }>({ dripLoss: 0, remark: undefined });

const doneRules = computed(() => ({
  dripLoss: [{ required: true, message: t('djs.warehouse.packEntry.dripLossRequired'), trigger: 'blur' }]
}));

function openCutDone() {
  if (!form.value.cutRecordId) {
    ElMessage.warning(t('djs.warehouse.packEntry.cutRecordRequired'));
    return;
  }
  doneForm.value = { dripLoss: 0, remark: undefined };
  cutDoneVisible.value = true;
}

async function handleCutDone() {
  if (!doneFormRef.value) return;
  await doneFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    cutDoneSubmitting.value = true;
    try {
      await submitCutDone({
        cutRecordId: form.value.cutRecordId as number | string,
        dripLoss: doneForm.value.dripLoss as number,
        proofOssIds: form.value.proofOssIds,
        remark: doneForm.value.remark
      });
      ElMessage.success(t('djs.warehouse.packEntry.finishCutSuccess'));
      cutDoneVisible.value = false;
      form.value = { cutRecordId: '', locationId: '', proofOssIds: undefined };
      selectedProductId.value = '';
      curWeight.value = undefined;
      curSpec.value = undefined;
      ossRef.value?.setExistingFiles?.([]);
      await loadCuttable();
    } finally {
      cutDoneSubmitting.value = false;
    }
  });
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
  gap: 2px;
  padding: 8px 16px;
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
.chip-main {
  font-weight: 600;
  font-size: 14px;
}
.chip-sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
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
  flex: 0 0 320px;
  width: 320px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-bg-color);
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--el-text-color-secondary);
}
.panel-section {
  margin-bottom: 16px;
}
.panel-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}
.ear-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  border: 1px solid var(--el-color-warning-light-5);
  font-weight: 600;
}
.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
.action-btn {
  width: 100%;
}
</style>
