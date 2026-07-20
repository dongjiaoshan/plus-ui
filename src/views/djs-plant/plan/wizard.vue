<template>
  <div class="p-4 wizard-page wizard-page--fixed-footer">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-medium">{{ t('plantPlan.wizard.title') }}</span>
          <el-button link @click="goList">{{ t('plantPlan.wizard.backToList') }}</el-button>
        </div>
      </template>

      <el-steps :active="currentStep" finish-status="success" align-center class="mb-6">
        <el-step :title="t('plantPlan.wizard.step1')" />
        <el-step :title="t('plantPlan.wizard.step2')" />
        <el-step :title="t('plantPlan.wizard.step3')" />
      </el-steps>

      <!-- step1：年份 + 季节 -->
      <div v-if="currentStep === 0" class="mx-auto max-w-md">
        <el-form label-width="100px">
          <el-form-item :label="t('plantPlan.field.planYear')" required>
            <el-input-number v-model="form.planYear" :min="2020" :max="2099" :step="1" class="w-full" />
          </el-form-item>
          <el-form-item :label="t('plantPlan.field.planSeason')" required>
            <el-select v-model="form.planSeason" :placeholder="t('plantPlan.placeholder.planSeason')" class="w-full">
              <el-option v-for="d in djs_planting_season" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- step2：作物（卡片单选） -->
      <CropPicker v-if="currentStep === 1" v-model="form.cropId" :plan-season="form.planSeason" @select-crop="onSelectCrop" />

      <!-- step3：地块（按片区分组 + 每地块设月份+上中下旬+班组） -->
      <template v-if="currentStep === 2">
        <!-- 已选摘要：回显第 1 步年份/季节 + 第 2 步作物（取向导 state，不新查） -->
        <el-alert :closable="false" type="info" class="mb-4">
          <template #title>
            <div class="flex flex-wrap items-center gap-x-6 gap-y-1">
              <span>
                <span class="text-gray-500">{{ t('plantPlan.field.planYear') }}：</span>
                <span class="font-medium">{{ form.planYear || '-' }}</span>
              </span>
              <span>
                <span class="text-gray-500">{{ t('plantPlan.field.planSeason') }}：</span>
                <span class="font-medium">{{ selectedSeasonLabel }}</span>
              </span>
              <span>
                <span class="text-gray-500">{{ t('plantPlan.field.crop') }}：</span>
                <span class="font-medium">{{ selectedCropLabel }}</span>
              </span>
            </div>
          </template>
        </el-alert>
        <PlotPeriodPicker v-model="form.details" :plan-year="form.planYear" />
      </template>
    </el-card>

    <!-- 底部操作栏：固定常驻视口底部，长列表滚动时无需拉到最底即可操作 -->
    <div class="flex justify-center gap-3 wizard-footer">
      <el-button v-if="currentStep > 0" @click="prevStep">{{ t('common.prev') }}</el-button>
      <el-button v-if="currentStep < 2" type="primary" @click="nextStep">{{ t('common.next') }}</el-button>
      <el-button v-if="currentStep === 2" type="primary" :loading="submitting" @click="submit">
        {{ t('plantPlan.wizard.submit') }}
      </el-button>
    </div>
  </div>
</template>

<script setup name="PlantPlanWizard" lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { addPlan } from '@/api/djs-plant/plan';
import type { PlantPlanCreateForm } from '@/api/djs-plant/plan/types';
import type { CropInfoVO } from '@/api/djs-plant/crop/types';
import CropPicker from './components/CropPicker.vue';
import PlotPeriodPicker from './components/PlotPeriodPicker.vue';
import { PLAN_BASE } from './route';
import tab from '@/plugins/tab';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_planting_season } = toRefs<any>(proxy?.useDict('djs_planting_season'));

const STORAGE_KEY = 'plt-plan-wizard';
const STORAGE_STEP = 'plt-plan-wizard-step';
const STORAGE_CROP_NAME = 'plt-plan-wizard-cropname';

const currentStep = ref(0);
const submitting = ref(false);
// resetWizard 期间抑制 form/step watch 回写 sessionStorage（否则重置后又把初始态写回草稿缓存）
const suppressPersist = ref(false);

const form = reactive<PlantPlanCreateForm>({
  planYear: new Date().getFullYear(),
  planSeason: '',
  cropId: undefined,
  details: []
});

// 已选作物名（仅用于 step3 回显，不进提交 payload）
const selectedCropName = ref('');

// step3 摘要：季节 → dict label；作物 → 已捕获名（兜底显示 id）
const selectedSeasonLabel = computed(() => {
  const opt = djs_planting_season.value?.find((d: any) => String(d.value) === String(form.planSeason));
  return opt?.label || form.planSeason || '-';
});
const selectedCropLabel = computed(() => selectedCropName.value || (form.cropId ? String(form.cropId) : '-'));

function onSelectCrop(crop: CropInfoVO) {
  selectedCropName.value = crop.cropName || '';
  sessionStorage.setItem(STORAGE_CROP_NAME, selectedCropName.value);
}

onMounted(async () => {
  const cache = sessionStorage.getItem(STORAGE_KEY);
  if (!cache) return;
  try {
    await ElMessageBox.confirm(t('plantPlan.wizard.resumeConfirm'), t('common.tip'), {
      confirmButtonText: t('plantPlan.wizard.resumeYes'),
      cancelButtonText: t('plantPlan.wizard.resumeNo'),
      type: 'info'
    });
    const parsed = JSON.parse(cache) as PlantPlanCreateForm;
    Object.assign(form, parsed);
    selectedCropName.value = sessionStorage.getItem(STORAGE_CROP_NAME) || '';
    const cachedStep = Number(sessionStorage.getItem(STORAGE_STEP) || '0');
    currentStep.value = Math.min(Math.max(cachedStep, 0), 2);
  } catch (e) {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_STEP);
    sessionStorage.removeItem(STORAGE_CROP_NAME);
  }
});

watch(
  () => form,
  (val) => {
    if (suppressPersist.value) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  },
  { deep: true }
);
watch(currentStep, (v) => {
  if (suppressPersist.value) return;
  sessionStorage.setItem(STORAGE_STEP, String(v));
});

// 向导重置为初始态 + 清草稿缓存。向导是 keep-alive 缓存路由：提交成功后 tab 不关、实例保留、
// onMounted 不会重跑，若不重置则下次「新增」复用缓存实例、显示上次选择的作物/年份/季节（row8）。
function resetWizard() {
  suppressPersist.value = true;
  currentStep.value = 0;
  form.planYear = new Date().getFullYear();
  form.planSeason = '';
  form.cropId = undefined;
  form.details = [];
  selectedCropName.value = '';
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_STEP);
  sessionStorage.removeItem(STORAGE_CROP_NAME);
  nextTick(() => {
    suppressPersist.value = false;
  });
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--;
}

function nextStep() {
  if (currentStep.value === 0) {
    if (!form.planYear || !form.planSeason) {
      ElMessage.warning(t('plantPlan.wizard.tip.step1Required'));
      return;
    }
  } else if (currentStep.value === 1) {
    if (!form.cropId) {
      ElMessage.warning(t('plantPlan.wizard.tip.step2Required'));
      return;
    }
  }
  currentStep.value++;
}

async function submit() {
  if (!form.details.length) {
    ElMessage.warning(t('plantPlan.wizard.tip.step3Required'));
    return;
  }
  submitting.value = true;
  try {
    const res = await addPlan({
      planYear: form.planYear,
      planSeason: form.planSeason,
      cropId: form.cropId,
      details: form.details
    });
    const newId = (res.data ?? res) as string;
    ElMessage.success(t('plantPlan.wizard.tip.submitSuccess'));
    // 重置内存态 + 清草稿；再用 $tab.closeOpenPage 关闭本向导 tab（销毁 keep-alive 缓存实例）并打开详情：
    // 下次「新增」重新挂载、从零开始，不再残留上次作物（row8）。
    resetWizard();
    tab.closeOpenPage({ path: `${PLAN_BASE}/detail`, query: { id: newId } });
  } finally {
    submitting.value = false;
  }
}

function goList() {
  // 关闭向导 tab 再回列表：销毁缓存实例，使下次进入重新挂载（草稿缓存保留，走 onMounted 的恢复确认）。
  tab.closeOpenPage(PLAN_BASE);
}
</script>

<style scoped>
/* 底部操作栏固定常驻视口底部：地块列表很长滚动时按钮栏始终可见，
   无需拉到页面最底才能点"上一步/下一步/创建计划"。
   用 position: fixed 贴视口底，并给页面底部留出按钮栏高度的 padding，避免遮挡最后内容。 */
.wizard-page--fixed-footer {
  padding-bottom: 72px;
}

.wizard-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  padding: 12px 0;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 -2px 8px rgb(0 0 0 / 6%);
}
</style>
