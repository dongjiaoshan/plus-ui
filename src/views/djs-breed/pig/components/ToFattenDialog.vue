<template>
  <el-dialog
    v-model="visible"
    :title="t('pig.toFatten.title')"
    width="420px"
    append-to-body
    :close-on-click-modal="!submitting"
    :close-on-press-escape="!submitting"
    :show-close="!submitting"
  >
    <p class="ear-no">{{ pigRow?.earNo }}</p>
    <p>{{ t('pig.toFatten.confirmMessage') }}</p>
    <p class="conversion-note">{{ t('pig.toFatten.permanentNotice') }}</p>
    <template #footer>
      <el-button :disabled="submitting" @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="ToFattenDialog" lang="ts">
/** D-0150：确认后永久转育肥；按当日、登录操作人、当前位置登记既有事件历史。 */
import { todayYmd } from '@/utils/date';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { toFatten } from '@/api/djs-breed/event/transfer';
import type { PigVO } from '@/api/djs-breed/pig/types';

const { t } = useI18n();
const emit = defineEmits<{ (e: 'success'): void }>();
const visible = ref(false);
const submitting = ref(false);
const pigRow = ref<PigVO>();

function open(row: PigVO) {
  if (submitting.value) return;
  pigRow.value = row;
  visible.value = true;
}

async function handleSubmit() {
  if (!pigRow.value || submitting.value) return;
  submitting.value = true;
  try {
    await toFatten({ pigId: pigRow.value.id, transferDate: `${todayYmd()} 00:00:00` });
    ElMessage.success(t('pig.toFatten.success'));
    visible.value = false;
    emit('success');
  } catch {
    // 请求层已提示拦截原因，保留确认框供用户取消；不再抛未处理的异步异常。
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
.conversion-note {
  color: var(--el-text-color-secondary);
}
</style>
