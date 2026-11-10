<template>
  <el-dialog v-model="visible" :title="t('djs.warehouse.storeReturn.addTitle')" width="90%" append-to-body destroy-on-close>
    <el-form inline label-width="100px" class="return-meta">
      <el-form-item :label="t('djs.warehouse.storeReturn.returnDate')" required
        ><el-date-picker v-model="returnDate" type="date" value-format="YYYY-MM-DD" :clearable="false"
      /></el-form-item>
      <el-form-item :label="t('djs.warehouse.storeReturn.returnUnit')" required
        ><el-select v-model="returnUnit" style="width: 220px"
          ><el-option v-for="u in unitOptions" :key="u.value" :label="u.label" :value="u.value" /></el-select
      ></el-form-item>
    </el-form>
    <div v-loading="loading" class="return-transfer">
      <section class="candidate-panel">
        <div class="filters">
          <el-input v-model="keyword" :placeholder="t('djs.warehouse.storeReturn.searchProduct')" clearable />
          <el-select v-model="belongType" clearable :placeholder="t('djs.warehouse.storeReturn.productCategory')"
            ><el-option v-for="o in typeOptions" :key="o.value" :label="o.label" :value="o.value"
          /></el-select>
        </div>
        <el-table :data="filteredCandidates" height="420" row-key="productId" @selection-change="onSelection">
          <el-table-column type="selection" width="42" />
          <el-table-column prop="productName" :label="t('djs.warehouse.storeReturn.productName')" min-width="130" />
          <el-table-column width="100" align="right">
            <template #header>
              <el-button type="primary" :disabled="!selection.length" @click="addSelected">{{
                t('djs.warehouse.storeReturn.selectProducts')
              }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
      <section class="selected-panel">
        <el-table :data="selected" row-key="productId" border height="470">
          <el-table-column prop="productName" :label="t('djs.warehouse.storeReturn.productName')" min-width="130" />
          <el-table-column :label="t('djs.warehouse.storeReturn.confirmQuantity')" min-width="170"
            ><template #default="{ row: r }"
              ><el-input-number v-model="r.receivedQty" :min="0" :precision="precision(r)" :controls="false" class="cell-num" />
              {{ r.materialUnit || r.productUnit }}</template
            ></el-table-column
          >
          <el-table-column :label="t('djs.warehouse.storeReturn.discardQuantity')" min-width="170"
            ><template #default="{ row: r }"
              ><el-input-number v-model="r.discardQty" :min="0" :precision="precision(r)" :controls="false" class="cell-num" />
              {{ r.materialUnit || r.productUnit }}</template
            ></el-table-column
          >
          <el-table-column :label="t('djs.warehouse.storeReturn.warehouseRemark')" min-width="160"
            ><template #default="{ row: r }"><el-input v-model="r.warehouseRemark" :maxlength="500" /></template
          ></el-table-column>
          <el-table-column :label="t('djs.warehouse.storeReturn.inboundLocation')" min-width="200"
            ><template #default="{ row: r }"
              ><LocationSelect v-model="r.locationId" :options="r.locationOptions || []" :disabled="r.canInbound === false" /></template
          ></el-table-column>
          <el-table-column width="80"
            ><template #default="{ row: r }"
              ><el-button link type="danger" @click="remove(r.productId)">{{ t('common.delete') }}</el-button></template
            ></el-table-column
          >
        </el-table>
      </section>
    </div>
    <template #footer
      ><el-button @click="visible = false">{{ t('common.cancel') }}</el-button
      ><el-button type="primary" :loading="submitLoading" :disabled="!selected.length" @click="handleSubmit">{{
        t('common.confirm')
      }}</el-button></template
    >
  </el-dialog>
</template>

<script setup name="StoreReturnUnitCreateDialog" lang="ts">
import { computed, ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { listRawReturnCandidates, createWarehouseUnitReturn } from '@/api/djs-warehouse/storeReturn';
import type { StoreReturnUnitCandidateVO } from '@/api/djs-store/return/types';
import LocationSelect from '@/components/LocationSelect/index.vue';
import { defaultLocationOf, isKgUnit } from '../metric';
interface UnitRow extends StoreReturnUnitCandidateVO {
  receivedQty: number;
  discardQty: number;
  warehouseRemark: string;
  locationId?: string;
}
interface DictOption {
  label: string;
  value: string;
}
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'done'): void }>();
const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const dictionaries = proxy?.useDict('djs_return_unit', 'djs_belong_type') as Record<string, DictOption[]>;
const { djs_return_unit, djs_belong_type } = toRefs(dictionaries);
const unitOptions = computed(() => djs_return_unit.value || []);
const typeOptions = computed(() => djs_belong_type.value || []);
const visible = computed({ get: () => props.modelValue, set: (v: boolean) => emit('update:modelValue', v) });
function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const returnDate = ref(todayLocal());
const returnUnit = ref('');
const keyword = ref('');
const belongType = ref<string>();
const loading = ref(false);
const submitLoading = ref(false);
const candidates = ref<StoreReturnUnitCandidateVO[]>([]);
const selected = ref<UnitRow[]>([]);
const selection = ref<StoreReturnUnitCandidateVO[]>([]);
const filteredCandidates = computed(() =>
  candidates.value.filter(
    (r) =>
      !selected.value.some((s) => String(s.productId) === String(r.productId)) &&
      (r.productName || '').includes(keyword.value.trim()) &&
      (!belongType.value || r.belongType === belongType.value)
  )
);
const precision = (r: UnitRow) => (isKgUnit(r.materialUnit || r.productUnit) ? 3 : 1);
function onSelection(rows: StoreReturnUnitCandidateVO[]) {
  selection.value = rows;
}
function addSelected() {
  selection.value.forEach((r) => {
    if (!selected.value.some((s) => String(s.productId) === String(r.productId)))
      selected.value.push({
        ...r,
        receivedQty: 0,
        discardQty: 0,
        warehouseRemark: '',
        locationId: defaultLocationOf(r.defaultLocationId, r.locationOptions)
      });
  });
  selection.value = [];
}
function remove(id: string) {
  selected.value = selected.value.filter((r) => String(r.productId) !== String(id));
}
async function load() {
  loading.value = true;
  returnDate.value = todayLocal();
  returnUnit.value = '';
  keyword.value = '';
  belongType.value = undefined;
  selected.value = [];
  selection.value = [];
  try {
    const { data } = await listRawReturnCandidates();
    candidates.value = data || [];
  } finally {
    loading.value = false;
  }
}
watch(
  () => props.modelValue,
  (open) => {
    if (open) load();
  },
  { immediate: true }
);
async function handleSubmit() {
  if (!returnDate.value) {
    proxy?.$modal.msgError(t('djs.warehouse.storeReturn.dateRequired'));
    return;
  }
  if (!returnUnit.value) {
    proxy?.$modal.msgError(t('djs.warehouse.storeReturn.unitRequired'));
    return;
  }
  if (!selected.value.length) {
    proxy?.$modal.msgError(t('djs.warehouse.storeReturn.amountRequired'));
    return;
  }
  if (selected.value.some((r) => Number(r.receivedQty || 0) + Number(r.discardQty || 0) <= 0)) {
    proxy?.$modal.msgError(t('djs.warehouse.storeReturn.amountRequired'));
    return;
  }
  submitLoading.value = true;
  try {
    await createWarehouseUnitReturn({
      returnDate: returnDate.value,
      returnUnit: returnUnit.value,
      items: selected.value.map((r) => ({
        productId: String(r.productId),
        receivedQty: Number(r.receivedQty || 0),
        discardQty: Number(r.discardQty || 0),
        locationId: r.locationId,
        warehouseRemark: r.warehouseRemark
      }))
    });
    proxy?.$modal.msgSuccess(t('djs.warehouse.storeReturn.doneSuccess'));
    emit('done');
    visible.value = false;
  } finally {
    submitLoading.value = false;
  }
}
</script>

<style scoped>
.return-meta :deep(.el-form-item__label) {
  white-space: nowrap;
}

.return-transfer {
  display: flex;
  gap: 20px;
}
.candidate-panel {
  flex: 0 0 32%;
  min-width: 240px;
}
.selected-panel {
  flex: 1;
  min-width: 0;
}
.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.cell-num {
  width: 110px;
}
@media (max-width: 900px) {
  .return-transfer {
    flex-direction: column;
  }
}
</style>
