<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('person.field.name')" prop="name">
            <el-input v-model="form.name" :placeholder="t('person.placeholder.name')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('person.field.gender')" prop="gender">
            <el-select v-model="form.gender" :placeholder="t('person.placeholder.gender')" clearable>
              <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('person.field.phone')" prop="phone">
            <el-input v-model="form.phone" :placeholder="t('person.placeholder.phone')" maxlength="11" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('person.field.idCard')" prop="idCard">
            <el-input v-model="form.idCard" :placeholder="t('person.placeholder.idCard')" maxlength="18" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('person.field.position')" prop="position">
            <el-input v-model="form.position" :placeholder="t('person.placeholder.position')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('person.field.hireDate')" prop="hireDate">
            <el-date-picker
              v-model="form.hireDate"
              value-format="YYYY-MM-DD"
              type="date"
              :placeholder="t('person.placeholder.hireDate')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('person.field.status')" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in djs_user_status" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('person.field.remark')" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
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
import { addPerson, getPerson, updatePerson } from '@/api/djs-common/person';
import type { PersonForm } from '@/api/djs-common/person/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_user_sex, djs_user_status } = toRefs<any>(proxy?.useDict('sys_user_sex', 'djs_user_status'));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): PersonForm => ({
  id: undefined,
  name: '',
  gender: undefined,
  phone: undefined,
  idCard: undefined,
  position: undefined,
  hireDate: undefined,
  status: '0',
  avatarUrl: undefined,
  remark: undefined
});

const form = ref<PersonForm>(defaultForm());

const rules = computed(() => ({
  name: [{ required: true, message: t('person.rule.name.required'), trigger: 'blur' }],
  phone: [{ pattern: /^$|^1[3-9]\d{9}$/, message: t('person.rule.phone.pattern'), trigger: 'blur' }],
  idCard: [
    {
      pattern: /^$|(^\d{15}$)|(^\d{17}([0-9Xx])$)/,
      message: t('person.rule.idCard.pattern'),
      trigger: 'blur'
    }
  ]
}));

const dialogTitle = computed(() => (form.value.id ? t('person.title.edit') : t('person.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

/** 外部调：新增 */
const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

/** 外部调：编辑 */
const openEdit = async (id: number | string) => {
  const res = await getPerson(id);
  form.value = {
    ...defaultForm(),
    ...res.data
  };
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
        await updatePerson(form.value);
      } else {
        await addPerson(form.value);
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
