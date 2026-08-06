<template>
  <!-- admin BRD-LIST-EDIT-001：修改耳号录入弹框（CLAUDE.md §6-13：录入一律弹框，点蒙层可关） -->
  <el-dialog v-model="visible" :title="t('pig.editEarNo.title')" width="480px" append-to-body @closed="onClosed">
    <el-alert :title="t('pig.editEarNo.warning')" type="warning" :closable="false" show-icon class="mb-4" />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('pig.editEarNo.currentEarNo')">
        <span class="ear-no">{{ pigRow?.earNo }}</span>
      </el-form-item>
      <el-form-item :label="t('pig.editEarNo.newEarNo')" prop="earNo">
        <el-input v-model="form.earNo" :placeholder="t('pig.editEarNo.newEarNoPlaceholder')" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="EditEarNoDialog" lang="ts">
/**
 * 修改耳号（admin BRD-LIST-EDIT-001）。
 *
 * 只改 ear_no/ear_tag，不碰其他字段。格式校验（前端 + 后端双重）与 EarNoAllocator 同口径：
 * 品系(1-2位)-品种2位-性别1位(可选)-出生日yyMMdd6位-序号3位。判重（同出生日+后三位）在后端做，
 * 前端不重复实现——避免两套口径分叉，撞号由提交后的后端报错兜底提示。
 * 提交前二次确认（ElMessageBox）：改号会让历史事件/追溯码的耳号快照与主表不一致，是有副作用的操作。
 */
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { updatePigEarNo } from '@/api/djs-breed/pig';
import type { PigVO } from '@/api/djs-breed/pig/types';

const { t } = useI18n();
const emit = defineEmits<{ (e: 'success'): void }>();

const EAR_NO_PATTERN = /^\d{1,2}-\d{2}(-\d)?-\d{6}-\d{3}$/;

const visible = ref(false);
const submitting = ref(false);
const pigRow = ref<PigVO>();
const formRef = ref<FormInstance>();

const form = reactive<{ earNo: string }>({ earNo: '' });

const rules: FormRules = {
  earNo: [
    { required: true, message: t('pig.editEarNo.newEarNoRequired'), trigger: 'blur' },
    { pattern: EAR_NO_PATTERN, message: t('pig.editEarNo.newEarNoPattern'), trigger: 'blur' }
  ]
};

function open(row: PigVO) {
  pigRow.value = row;
  form.earNo = row.earNo ?? '';
  visible.value = true;
}

function onClosed() {
  formRef.value?.resetFields();
  pigRow.value = undefined;
}

async function handleSubmit() {
  if (!pigRow.value) return;
  await formRef.value?.validate();

  const oldEarNo = pigRow.value.earNo;
  const newEarNo = form.earNo.trim();
  if (newEarNo === oldEarNo) {
    ElMessage.warning(t('pig.editEarNo.unchanged'));
    return;
  }

  try {
    await ElMessageBox.confirm(t('pig.editEarNo.confirmMessage', { old: oldEarNo, new: newEarNo }), t('pig.editEarNo.confirmTitle'), {
      type: 'warning'
    });
  } catch {
    return; // 用户取消
  }

  submitting.value = true;
  try {
    await updatePigEarNo(pigRow.value.id, {
      earNo: newEarNo,
      // version 为空说明列表接口没带出（不应发生，PigVO 类型已声明该字段），兜底传 0
      // 让后端乐观锁必然失败，报错提示重试而不是静默用错误的并发保护跳过
      version: pigRow.value.version ?? 0
    });
    ElMessage.success(t('pig.editEarNo.success'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>

<style scoped>
.ear-no {
  font-weight: 600;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
