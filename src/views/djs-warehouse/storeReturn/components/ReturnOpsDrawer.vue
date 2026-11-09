<template>
  <el-drawer v-model="visible" :title="drawerTitle" direction="rtl" size="1200px" append-to-body destroy-on-close>
    <div v-loading="loading" class="ops-drawer">
      <div class="ops-head">
        <span>{{ row?.storeName || row?.returnUnit || '—' }} / {{ row?.returnDate || '—' }}</span>
        <el-button
          v-if="mode === 'handle'"
          v-hasPermi="['djs:warehouse:storeReturn:confirm']"
          :disabled="!pendingItems.length"
          type="primary"
          @click="openProductPicker"
          >{{ t('djs.warehouse.storeReturn.addProducts') }}</el-button
        >
      </div>
      <el-table :data="items" row-key="id" border height="480">
        <el-table-column prop="productName" :label="t('djs.warehouse.storeReturn.productName')" min-width="150" align="center" />
        <el-table-column prop="productSpec" :label="t('djs.warehouse.storeReturn.productSpec')" min-width="110" align="center" />
        <el-table-column :label="t('djs.warehouse.storeReturn.returnQuantity')" min-width="110" align="center">
          <template #default="{ row: r }">{{ r.warehouseAdded === 1 ? '—' : formatQty(r.returnQuantity, r) }}</template>
        </el-table-column>
        <el-table-column :label="t('djs.warehouse.storeReturn.confirmQuantity')" min-width="170" align="center">
          <template #default="{ row: r }">
            <el-input-number
              v-if="editable(r)"
              v-model="r.confirmInput"
              :min="0"
              :precision="precision(r)"
              :max="maxOf(r, r.discardInput)"
              :controls="false"
              :disabled="r.canInbound === false"
              class="cell-num"
            />
            <span v-else>{{ confirmed(r) }}</span> {{ metricSuffix(r) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('djs.warehouse.storeReturn.discardQuantity')" min-width="170" align="center">
          <template #default="{ row: r }">
            <el-input-number
              v-if="editable(r)"
              v-model="r.discardInput"
              :min="0"
              :max="metricIsKg(r) ? undefined : maxOf(r, r.confirmInput)"
              :precision="precision(r)"
              :controls="false"
              class="cell-num"
            />
            <span v-else>{{ discarded(r) }}</span> {{ metricSuffix(r) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('djs.warehouse.storeReturn.warehouseRemark')" min-width="180" align="center">
          <template #default="{ row: r }"
            ><el-input v-if="editable(r)" v-model="r.noteInput" :maxlength="500" /><span v-else>{{ r.warehouseRemark || '—' }}</span></template
          >
        </el-table-column>
        <el-table-column :label="t('djs.warehouse.storeReturn.inboundLocation')" min-width="200" align="center">
          <template #default="{ row: r }">
            <LocationSelect v-if="editable(r)" v-model="r.locationId" :options="r.locationOptions || []" :disabled="Number(r.confirmInput) <= 0" />
            <span v-else>{{ r.locationName || '—' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button v-if="mode === 'handle'" type="primary" :loading="submitLoading" :disabled="!pendingItems.length" @click="handleSubmit">{{
        t('djs.warehouse.storeReturn.done')
      }}</el-button>
    </template>
    <el-dialog v-model="pickerVisible" :title="t('djs.warehouse.storeReturn.addProducts')" width="700px" append-to-body destroy-on-close>
      <el-input v-model="keyword" :placeholder="t('djs.warehouse.storeReturn.searchProduct')" clearable />
      <el-table :data="filteredCandidates" height="360" row-key="productId" @selection-change="onSelection">
        <el-table-column type="selection" width="45" />
        <el-table-column prop="productName" :label="t('djs.warehouse.storeReturn.productName')" />
        <el-table-column prop="productSpec" :label="t('djs.warehouse.storeReturn.productSpec')" />
      </el-table>
      <template #footer
        ><el-button @click="pickerVisible = false">{{ t('common.cancel') }}</el-button
        ><el-button type="primary" :disabled="!selection.length" :loading="adding" @click="addProducts">{{
          t('common.confirm')
        }}</el-button></template
      >
    </el-dialog>
  </el-drawer>
</template>

<script setup name="StoreReturnOpsDrawer" lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  listReturnOpsItems,
  listWarehouseSupplementCandidates,
  confirmWarehouseReturn,
  addWarehouseReturnProducts
} from '@/api/djs-warehouse/storeReturn';
import type { StoreReturnOpsItemVO, StoreReturnUnitCandidateVO } from '@/api/djs-store/return/types';
import type { ReturnStoreDailyVO } from '@/api/djs-warehouse/return/types';
import LocationSelect from '@/components/LocationSelect/index.vue';
import {
  defaultLocationOf,
  operationDefaultConfirmInput,
  fromConfirmWeight,
  isKgUnit,
  operationMaxQty,
  metricIsKg,
  metricSuffix,
  toNum
} from '../metric';

interface OpsRow extends StoreReturnOpsItemVO {
  confirmInput: number;
  discardInput: number;
  noteInput: string;
}
const props = withDefaults(defineProps<{ modelValue: boolean; mode?: 'handle' | 'detail'; row?: ReturnStoreDailyVO | null }>(), {
  mode: 'handle',
  row: null
});
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void; (e: 'done'): void }>();
const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const visible = computed({ get: () => props.modelValue, set: (v: boolean) => emit('update:modelValue', v) });
const drawerTitle = computed(() => t(props.mode === 'detail' ? 'djs.warehouse.storeReturn.detailTitle' : 'djs.warehouse.storeReturn.handleTitle'));
const loading = ref(false);
const submitLoading = ref(false);
const items = ref<OpsRow[]>([]);
const pendingItems = computed(() => items.value.filter((r) => r.returnStatus !== 'received'));
const editable = (r: OpsRow) => props.mode === 'handle' && r.returnStatus !== 'received';
const precision = (r: OpsRow) => (metricIsKg(r) ? 3 : 1);
const maxOf = (r: OpsRow, other: number) => {
  const cap = operationMaxQty(r);
  return cap === null ? undefined : Math.max(0, cap - (metricIsKg(r) ? 0 : Number(other || 0)));
};
const confirmed = (r: OpsRow) => (r.warehouseDiscardQty == null && r.isDiscard === 1 ? '0' : fromConfirmWeight(r, r.receivedQty ?? r.receivedWeight));
const discarded = (r: OpsRow) => fromConfirmWeight(r, r.warehouseDiscardQty ?? (r.isDiscard === 1 ? (r.receivedQty ?? r.receivedWeight ?? 0) : 0));
function formatQty(value: unknown, r: OpsRow) {
  const n = toNum(value as number | string | undefined);
  return n == null ? '—' : `${isKgUnit(r.productUnit) ? n.toFixed(3) : n} ${r.productUnit || ''}`;
}
async function loadItems() {
  if (!props.row) return;
  loading.value = true;
  try {
    const { data } = await listReturnOpsItems({
      returnType: props.row.returnType,
      storeId: props.row.returnType === 'unit' ? undefined : props.row.storeId,
      returnUnit: props.row.returnType === 'unit' ? props.row.returnUnit : undefined,
      returnDateFrom: props.row.returnDate,
      returnDateTo: props.row.returnDate
    });
    items.value = (data || []).map((r) => ({
      ...r,
      confirmInput: operationDefaultConfirmInput(r),
      discardInput: 0,
      noteInput: r.warehouseRemark || '',
      locationId:
        r.returnStatus === 'received'
          ? r.locationId
          : defaultLocationOf(
              r.locationOptions?.some((location) => String(location.id) === String(r.locationId)) ? r.locationId : r.defaultLocationId,
              r.locationOptions
            )
    }));
  } finally {
    loading.value = false;
  }
}
watch(
  () => [props.modelValue, props.row] as const,
  ([open]) => {
    if (open) loadItems();
    else items.value = [];
  },
  { immediate: true }
);

const pickerVisible = ref(false);
const adding = ref(false);
const keyword = ref('');
const candidates = ref<StoreReturnUnitCandidateVO[]>([]);
const selection = ref<StoreReturnUnitCandidateVO[]>([]);
const filteredCandidates = computed(() =>
  candidates.value.filter(
    (c) => !items.value.some((r) => String(r.productId) === String(c.productId)) && (c.productName || '').includes(keyword.value.trim())
  )
);
function onSelection(rows: StoreReturnUnitCandidateVO[]) {
  selection.value = rows;
}
async function openProductPicker() {
  const { data } = await listWarehouseSupplementCandidates();
  candidates.value = data || [];
  keyword.value = '';
  selection.value = [];
  pickerVisible.value = true;
}
async function addProducts() {
  const anchor = pendingItems.value[0]?.id;
  if (!anchor) return;
  adding.value = true;
  try {
    await addWarehouseReturnProducts({ anchorId: anchor, productIds: selection.value.map((r) => String(r.productId)) });
    const previous = new Map(items.value.map((r) => [r.id, r]));
    await loadItems();
    items.value.forEach((r) => {
      const old = previous.get(r.id);
      if (old && r.returnStatus !== 'received') {
        r.confirmInput = old.confirmInput;
        r.discardInput = old.discardInput;
        r.noteInput = old.noteInput;
        r.locationId = old.locationId;
      }
    });
    pickerVisible.value = false;
  } finally {
    adding.value = false;
  }
}
async function handleSubmit() {
  const targets = pendingItems.value.filter((r) => Number(r.confirmInput) > 0 || Number(r.discardInput) > 0);
  if (!targets.length) {
    proxy?.$modal.msgError(t('djs.warehouse.storeReturn.amountRequired'));
    return;
  }
  submitLoading.value = true;
  let done = 0;
  try {
    for (const r of targets) {
      try {
        await confirmWarehouseReturn({
          id: r.id,
          receivedQty: Number(r.confirmInput || 0),
          discardQty: Number(r.discardInput || 0),
          warehouseRemark: r.noteInput,
          locationId: r.locationId
        });
        done++;
      } catch {
        proxy?.$modal.msgError(t('djs.warehouse.storeReturn.partialFailure', { done, total: targets.length }));
        emit('done');
        await loadItems();
        return;
      }
    }
    proxy?.$modal.msgSuccess(t('djs.warehouse.storeReturn.doneSuccess'));
    emit('done');
    visible.value = false;
  } finally {
    submitLoading.value = false;
  }
}
</script>

<style scoped>
.ops-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.cell-num {
  width: 115px;
}
</style>
