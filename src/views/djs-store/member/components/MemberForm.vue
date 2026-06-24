<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? t('storeMember.form.editTitle') : t('storeMember.form.addTitle')"
    destroy-on-close
    append-to-body
    width="520px"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item :label="t('storeMember.form.memberName')" prop="memberName">
        <el-input v-model="form.memberName" maxlength="64" :placeholder="t('storeMember.form.memberNamePlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('storeMember.form.phone')" prop="phone">
        <el-input v-model="form.phone" maxlength="20" :placeholder="t('storeMember.form.phonePlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('storeMember.form.memberLevel')">
        <el-select v-model="form.memberLevel" clearable :placeholder="t('storeMember.form.memberLevelPlaceholder')" style="width: 100%">
          <el-option v-for="d in djs_member_level" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('storeMember.form.joinDate')">
        <el-date-picker
          v-model="form.joinDate"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="t('storeMember.form.joinDatePlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('storeMember.form.store')">
        <!-- 门店固定为当前全局门店（新增）/ 会员原门店（编辑），不可手改 -->
        <span class="font-bold">{{ formStoreName || '—' }}</span>
      </el-form-item>
      <el-form-item :label="t('storeMember.form.memberTags')">
        <el-input v-model="form.memberTags" maxlength="255" :placeholder="t('storeMember.form.memberTagsPlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('storeMember.form.memberStatus')">
        <el-radio-group v-model="form.memberStatus">
          <el-radio :value="1">{{ t('storeMember.status.normal') }}</el-radio>
          <el-radio :value="0">{{ t('storeMember.status.disabled') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('storeMember.form.remark')">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="MemberForm" lang="ts">
import { addStoreMember, updateStoreMember } from '@/api/djs-store/member';
import type { StoreMemberForm, StoreMemberVO } from '@/api/djs-store/member/types';
import { useStoreContextStore } from '@/store/modules/storeContext';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{ success: [] }>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_member_level } = toRefs<any>(proxy?.useDict('djs_member_level'));

const storeContext = useStoreContextStore();
const formStoreName = computed(
  () => storeContext.myStores.find((s) => String(s.id) === String(form.storeId ?? ''))?.storeName ?? ''
);

const visible = ref(false);
const submitting = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();

const defaultForm = (): StoreMemberForm => ({
  id: undefined,
  memberName: '',
  phone: '',
  memberLevel: 'normal',
  joinDate: '',
  storeId: undefined,
  memberTags: '',
  memberStatus: 1,
  remark: ''
});
const form = reactive<StoreMemberForm>(defaultForm());

const rules: FormRules = {
  memberName: [{ required: true, message: t('storeMember.form.memberNameRequired'), trigger: 'blur' }],
  phone: [
    { required: true, message: t('storeMember.form.phoneRequired'), trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: t('storeMember.form.phoneInvalid'), trigger: 'blur' }
  ]
};

function openCreate() {
  isEdit.value = false;
  Object.assign(form, defaultForm());
  // 新增会员默认归属当前全局门店
  form.storeId = storeContext.currentStoreId || undefined;
  visible.value = true;
}

function openEdit(row: StoreMemberVO) {
  isEdit.value = true;
  Object.assign(form, defaultForm());
  form.id = row.id;
  form.memberName = row.memberName;
  form.phone = row.phone;
  form.memberLevel = row.memberLevel ?? 'normal';
  form.joinDate = row.joinDate ?? '';
  form.storeId = row.storeId ?? undefined;
  form.memberTags = row.memberTags ?? '';
  form.memberStatus = row.memberStatus;
  form.remark = row.remark ?? '';
  visible.value = true;
}

function handleClosed() {
  formRef.value?.resetFields();
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateStoreMember({ ...form });
    } else {
      await addStoreMember({ ...form });
    }
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate, openEdit });
</script>
