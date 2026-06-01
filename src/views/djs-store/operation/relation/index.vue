<template>
  <div class="p-2">
    <el-card shadow="never">
      <div class="mb-4 flex items-center gap-3">
        <span class="text-sm">{{ t('storeOperation.relation.store') }}</span>
        <el-select
          v-model="currentStoreId"
          :placeholder="t('storeOperation.relation.storePlaceholder')"
          filterable
          style="width: 280px"
          @change="handleStoreChange"
        >
          <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
        </el-select>
        <el-button v-hasPermi="['djs:storeRelation:edit']" type="primary" :loading="saving" :disabled="!currentStoreId" @click="handleSave">
          {{ t('storeOperation.relation.save') }}
        </el-button>
      </div>

      <el-transfer
        v-model="rightIds"
        v-loading="loading"
        :data="transferData"
        :titles="[t('storeOperation.relation.allSku'), t('storeOperation.relation.linkedSku')]"
        filterable
        :filter-placeholder="t('storeOperation.relation.filterPlaceholder')"
        :props="{ key: 'key', label: 'label' }"
      />
    </el-card>
  </div>
</template>

<script setup name="StoreProductRelation" lang="ts">
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { listStoreRelation, listStoreRelationCandidates, syncStoreRelation } from '@/api/djs-store/operation/relation';
import type { StoreProductCandidateVO, StoreProductRelationVO } from '@/api/djs-store/operation/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

interface TransferItem {
  key: string;
  label: string;
}

const storeOptions = ref<StoreVO[]>([]);
const currentStoreId = ref<string>('');
const candidates = ref<StoreProductCandidateVO[]>([]);
const rightIds = ref<string[]>([]);
const loading = ref(false);
const saving = ref(false);

const transferData = computed<TransferItem[]>(() =>
  candidates.value.map((c) => ({
    key: String(c.id),
    label: c.productSpec ? `${c.productName}（${c.productSpec}）` : c.productName
  }))
);

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
    if (!currentStoreId.value && storeOptions.value.length > 0) {
      currentStoreId.value = String(storeOptions.value[0].id);
      await loadRelations();
    }
  } catch (e) {
    console.warn('[StoreRelation] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function loadCandidates() {
  try {
    const res = await listStoreRelationCandidates();
    candidates.value = (res.data ?? []) as StoreProductCandidateVO[];
  } catch (e) {
    console.warn('[StoreRelation] loadCandidates failed', e);
    candidates.value = [];
  }
}

async function loadRelations() {
  if (!currentStoreId.value) {
    rightIds.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await listStoreRelation(currentStoreId.value);
    const linked = (res.data ?? []) as StoreProductRelationVO[];
    rightIds.value = linked.map((r) => String(r.productId));
  } catch (e) {
    console.warn('[StoreRelation] loadRelations failed', e);
    rightIds.value = [];
  } finally {
    loading.value = false;
  }
}

function handleStoreChange() {
  loadRelations();
}

async function handleSave() {
  if (!currentStoreId.value) return;
  saving.value = true;
  try {
    await syncStoreRelation({ storeId: currentStoreId.value, productIds: rightIds.value });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    await loadRelations();
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await loadCandidates();
  await loadStoreOptions();
});
</script>
