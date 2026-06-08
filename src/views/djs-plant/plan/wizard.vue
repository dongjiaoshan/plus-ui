<template>
  <div class="p-4">
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
          <el-form-item :label="t('plantPlan.field.plantDate')">
            <el-input v-model="form.plantDate" :placeholder="t('plantPlan.placeholder.plantDate')" />
          </el-form-item>
        </el-form>
      </div>

      <!-- step2：作物（卡片单选） -->
      <CropPicker v-if="currentStep === 1" v-model="form.cropId" />

      <!-- step3：地块（按片区分组 + 每地块设月份+上中下旬+班组） -->
      <PlotPeriodPicker v-if="currentStep === 2" v-model="form.details" />

      <div class="mt-6 flex justify-center gap-3">
        <el-button v-if="currentStep > 0" @click="prevStep">{{ t('common.prev') }}</el-button>
        <el-button v-if="currentStep < 2" type="primary" @click="nextStep">{{ t('common.next') }}</el-button>
        <el-button v-if="currentStep === 2" type="primary" :loading="submitting" @click="submit">
          {{ t('plantPlan.wizard.submit') }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="PlantPlanWizard" lang="ts">
import { ref, reactive, watch, onMounted, getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { addPlan } from '@/api/djs-plant/plan';
import type { PlantPlanCreateForm } from '@/api/djs-plant/plan/types';
import CropPicker from './components/CropPicker.vue';
import PlotPeriodPicker from './components/PlotPeriodPicker.vue';
import { PLAN_BASE } from './route';

const { t } = useI18n();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_planting_season } = toRefs<any>(proxy?.useDict('djs_planting_season'));

const STORAGE_KEY = 'plt-plan-wizard';
const STORAGE_STEP = 'plt-plan-wizard-step';

const currentStep = ref(0);
const submitting = ref(false);

const form = reactive<PlantPlanCreateForm>({
  planYear: new Date().getFullYear(),
  planSeason: '',
  cropId: undefined,
  plantDate: '',
  details: []
});

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
    const cachedStep = Number(sessionStorage.getItem(STORAGE_STEP) || '0');
    currentStep.value = Math.min(Math.max(cachedStep, 0), 2);
  } catch (e) {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_STEP);
  }
});

watch(
  () => form,
  (val) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  },
  { deep: true }
);
watch(currentStep, (v) => sessionStorage.setItem(STORAGE_STEP, String(v)));

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
      plantDate: form.plantDate,
      details: form.details
    });
    const newId = (res.data ?? res) as string;
    ElMessage.success(t('plantPlan.wizard.tip.submitSuccess'));
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_STEP);
    router.push(`${PLAN_BASE}/detail?id=${newId}`);
  } finally {
    submitting.value = false;
  }
}

function goList() {
  router.push(PLAN_BASE);
}
</script>
