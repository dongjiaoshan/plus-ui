<template>
  <el-dialog v-model="visible" :title="form.id ? t('tareSpec.editTitle') : t('tareSpec.addTitle')" destroy-on-close append-to-body width="560px">
    <el-form ref="formRef" v-loading="loading" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('tareSpec.specName')" prop="specName">
        <el-input v-model="form.specName" :placeholder="t('tareSpec.specNamePlaceholder')" maxlength="64" />
      </el-form-item>
      <el-form-item :label="t('tareSpec.tareWeight')" prop="tareWeight">
        <el-input-number v-model="form.tareWeight" :min="0.001" :precision="3" :step="0.1" controls-position="right" class="tare-weight" />
        <span class="unit">Kg</span>
      </el-form-item>
      <el-form-item :label="t('tareSpec.isDefault')" prop="isDefault">
        <el-radio-group v-model="form.isDefault">
          <el-radio v-for="d in djs_yes_no" :key="d.value" :value="Number(d.value)">{{ d.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('tareSpec.positions')" prop="positions">
        <el-checkbox-group v-model="form.positions">
          <el-checkbox v-for="d in djs_tare_position" :key="d.value" :value="d.value">{{ d.label }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { addTareSpec, getTareSpec, updateTareSpec, type TarePosition, type TareSpecForm } from '@/api/djs-warehouse/tareSpec';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{ success: [] }>();
const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_yes_no, djs_tare_position } = toRefs(proxy!.useDict('djs_yes_no', 'djs_tare_position'));

const visible = ref(false);
const loading = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const blank = (): TareSpecForm => ({ id: undefined, specName: '', tareWeight: undefined, isDefault: 0, positions: [] });
const form = ref<TareSpecForm>(blank());

const rules = computed(() => ({
  specName: [{ required: true, message: t('tareSpec.rule.specName'), trigger: 'blur' }],
  tareWeight: [{ required: true, message: t('tareSpec.rule.tareWeight'), trigger: 'blur' }],
  isDefault: [{ required: true, message: t('tareSpec.rule.isDefault'), trigger: 'change' }],
  positions: [{ type: 'array', required: true, min: 1, message: t('tareSpec.rule.positions'), trigger: 'change' }]
}));

function openCreate() {
  form.value = blank();
  visible.value = true;
}

async function openEdit(id: string) {
  form.value = blank();
  visible.value = true;
  loading.value = true;
  try {
    const { data } = await getTareSpec(id);
    form.value = {
      id: data.id,
      specName: data.specName,
      tareWeight: Number(data.tareWeight),
      isDefault: Number(data.isDefault),
      positions: (data.positions || '').split(',').filter(Boolean) as TarePosition[]
    };
  } finally {
    loading.value = false;
  }
}

async function submit() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    await (form.value.id ? updateTareSpec(form.value) : addTareSpec(form.value));
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate, openEdit });
</script>

<style scoped>
.tare-weight {
  width: 200px;
}
.unit {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}
</style>
