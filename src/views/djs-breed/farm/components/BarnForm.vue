<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="560px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('farm.field.barnName')" prop="barnName">
        <el-input v-model="form.barnName" :placeholder="t('farm.placeholder.barnName')" maxlength="64" />
      </el-form-item>
      <el-form-item :label="t('farm.field.barnType')" prop="barnType">
        <el-select v-model="form.barnType" :placeholder="t('farm.placeholder.barnType')" style="width: 100%">
          <el-option v-for="dict in barnTypeDict" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>

      <!-- 新建：填三类栏位数量，提交后系统自动批量生成对应栏位 -->
      <template v-if="isCreate">
        <el-form-item :label="t('farm.proto.field.bigPenCount')" prop="bigPenCount">
          <el-input-number v-model="form.bigPenCount" :min="0" :max="999" :step="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('farm.proto.field.limitPenCount')" prop="limitPenCount">
          <el-input-number v-model="form.limitPenCount" :min="0" :max="999" :step="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('farm.proto.field.bedCount')" prop="bedCount">
          <el-input-number v-model="form.bedCount" :min="0" :max="999" :step="1" controls-position="right" style="width: 100%" />
        </el-form-item>
      </template>

      <!-- 编辑：状态（栏位数量不在编辑改，增删栏位走「栏位详情」子页） -->
      <template v-else>
        <el-form-item :label="t('farm.field.barnStatus')" prop="barnStatus">
          <el-switch v-model="form.barnStatus" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </template>

      <el-form-item :label="t('farm.field.remark')" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
      </el-form-item>
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
import { createBarnWithPens, getBarn, updateBarn } from '@/api/djs-breed/farm';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';

interface BarnFormModel {
  id?: number | string;
  barnCode: string;
  barnName: string;
  barnType: string;
  barnStatus: number;
  remark?: string;
  bigPenCount: number;
  limitPenCount: number;
  bedCount: number;
}

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const dicts = useDict('djs_barn_type');
const barnTypeDict = computed(() => dicts['djs_barn_type'] ?? []);

const defaultForm = (): BarnFormModel => ({
  id: undefined,
  barnCode: '',
  barnName: '',
  barnType: '',
  barnStatus: 1,
  remark: undefined,
  bigPenCount: 0,
  limitPenCount: 0,
  bedCount: 0
});

const form = ref<BarnFormModel>(defaultForm());

const isCreate = computed(() => !form.value.id);

const rules = computed(() => ({
  barnName: [{ required: true, message: t('farm.rule.barnName.required'), trigger: 'blur' }],
  barnType: [{ required: true, message: t('farm.rule.barnType.required'), trigger: 'change' }],
  barnStatus: [{ required: true, message: t('farm.rule.barnStatus.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => (isCreate.value ? t('farm.proto.createBarn') : t('farm.title.editBarn')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getBarn(id);
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
      if (isCreate.value) {
        await createBarnWithPens({
          barnName: form.value.barnName,
          barnType: form.value.barnType,
          bigPenCount: form.value.bigPenCount,
          limitPenCount: form.value.limitPenCount,
          bedCount: form.value.bedCount,
          remark: form.value.remark
        });
      } else {
        await updateBarn({
          id: form.value.id,
          barnCode: form.value.barnCode,
          barnName: form.value.barnName,
          barnType: form.value.barnType,
          barnStatus: form.value.barnStatus,
          remark: form.value.remark
        });
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
