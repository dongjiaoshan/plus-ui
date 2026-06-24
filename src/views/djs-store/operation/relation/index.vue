<template>
  <div class="p-2">
    <el-card shadow="never">
      <div class="mb-4 flex items-center gap-3">
        <!-- 操作目标门店由顶部全局选择器统一控制 -->
        <span class="text-sm">{{ t('storeOperation.relation.store') }}</span>
        <span class="text-sm font-bold">{{ currentStoreName || '—' }}</span>
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
import { listStoreRelation, listStoreRelationCandidates, syncStoreRelation } from '@/api/djs-store/operation/relation';
import type { StoreProductCandidateVO, StoreProductRelationVO } from '@/api/djs-store/operation/types';
import { useStoreContextStore } from '@/store/modules/storeContext';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

interface TransferItem {
  key: string;
  label: string;
}

const storeContext = useStoreContextStore();
// 操作目标门店来自全局选择器（StoreSwitcher）
const { currentStoreId, myStores } = storeToRefs(storeContext);
const currentStoreName = computed(() => myStores.value.find((s) => String(s.id) === currentStoreId.value)?.storeName ?? '');
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

// 全局门店切换 → 重拉该门店关联（navbar 切换会刷新页面，watch 兜底同页响应）
watch(currentStoreId, () => loadRelations());

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
  if (currentStoreId.value) await loadRelations();
});
</script>
