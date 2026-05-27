<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="reset">
    <el-form label-width="100px">
      <el-form-item :label="t('demand.assignPig.earNos')">
        <el-input v-model="earNosRaw" type="textarea" :rows="6" :placeholder="t('demand.assignPig.placeholder')" maxlength="2000" show-word-limit />
      </el-form-item>
      <el-form-item>
        <el-text size="small" type="info">{{ t('demand.assignPig.hint') }}</el-text>
      </el-form-item>
    </el-form>

    <div v-if="assignedList.length > 0" class="mt-3">
      <el-divider content-position="left">{{ t('demand.assignPig.assigned') }}</el-divider>
      <el-tag v-for="p in assignedList" :key="p.earNo" type="primary" closable size="default" class="mr-2 mb-2" @close="onRemove(p.earNo)">
        {{ p.earNo }}
      </el-tag>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" :disabled="!parsedEarNos.length" @click="handleAssign">
        {{ t('demand.assignPig.assignBtn', { count: parsedEarNos.length }) }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { assignPigs, listAssignedPigs, removeAssignedPig } from '@/api/djs-warehouse/demand';
import type { DemandPigVO } from '@/api/djs-warehouse/demand/types';

const emit = defineEmits<{ (e: 'success'): void }>();
const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const demandId = ref<string>('');
const demandNo = ref<string>('');
const earNosRaw = ref<string>('');
const assignedList = ref<DemandPigVO[]>([]);

const dialogTitle = computed(() => t('demand.assignPig.title', { no: demandNo.value }));
const parsedEarNos = computed(() => {
  const arr = earNosRaw.value
    .split(/[,，\n\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return Array.from(new Set(arr));
});

async function loadAssigned() {
  if (!demandId.value) return;
  const res = await listAssignedPigs(demandId.value);
  assignedList.value = ((res as any).data ?? []) as DemandPigVO[];
}

async function open(id: string, no: string) {
  reset();
  demandId.value = id;
  demandNo.value = no;
  visible.value = true;
  await loadAssigned();
}

function reset() {
  earNosRaw.value = '';
  assignedList.value = [];
  demandId.value = '';
  demandNo.value = '';
}

async function handleAssign() {
  if (!demandId.value || parsedEarNos.value.length === 0) return;
  submitting.value = true;
  try {
    await assignPigs(demandId.value, { earNos: parsedEarNos.value });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    earNosRaw.value = '';
    await loadAssigned();
    emit('success');
  } finally {
    submitting.value = false;
  }
}

async function onRemove(earNo: string) {
  await proxy?.$modal.confirm(t('demand.assignPig.confirmRemove', { earNo }));
  await removeAssignedPig(demandId.value, earNo);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  await loadAssigned();
  emit('success');
}

defineExpose({ open });
</script>
