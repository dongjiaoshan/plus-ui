<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="600px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('plantZone.field.zoneCode')" prop="zoneCode">
            <el-input v-model="form.zoneCode" :placeholder="t('plantZone.placeholder.zoneCode')" :disabled="!!form.id" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('plantZone.field.zoneName')" prop="zoneName">
            <el-input v-model="form.zoneName" :placeholder="t('plantZone.placeholder.zoneName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('plantZone.field.zoneBelong')" prop="zoneBelong">
            <el-select v-model="form.zoneBelong" clearable :placeholder="t('plantZone.placeholder.zoneBelong')" style="width: 100%">
              <el-option v-for="dict in djs_zone_belong" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('plantZone.field.zoneStatus')" prop="zoneStatus">
            <!-- zone_status 1=启用 / 0=停用（不走 sys_normal_disable，与片区数据实态 + admin toggle 同口径） -->
            <el-radio-group v-model="form.zoneStatus">
              <el-radio :value="1">{{ t('plantZone.action.enable') }}</el-radio>
              <el-radio :value="0">{{ t('plantZone.action.disable') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('plantZone.field.zoneDesc')" prop="zoneDesc">
            <el-input v-model="form.zoneDesc" type="textarea" :rows="2" maxlength="255" :placeholder="t('plantZone.placeholder.zoneDesc')" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { addZone, getZone, updateZone } from '@/api/djs-plant/zone';
import type { PlotZoneForm } from '@/api/djs-plant/zone/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_zone_belong } = toRefs<any>(proxy?.useDict('djs_zone_belong'));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): PlotZoneForm => ({
  id: undefined,
  zoneCode: '',
  zoneName: '',
  zoneDesc: undefined,
  zoneBelong: undefined,
  zoneStatus: 1
});

const form = ref<PlotZoneForm>(defaultForm());

const rules = computed(() => ({
  zoneCode: [{ required: true, message: t('plantZone.rule.zoneCode.required'), trigger: 'blur' }],
  zoneName: [{ required: true, message: t('plantZone.rule.zoneName.required'), trigger: 'blur' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('plantZone.title.edit') : t('plantZone.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getZone(id);
  form.value = { ...defaultForm(), ...res.data };
  visible.value = true;
};

defineExpose({ openCreate, openEdit });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (form.value.id) {
        await updateZone(form.value);
      } else {
        await addZone(form.value);
      }
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>
