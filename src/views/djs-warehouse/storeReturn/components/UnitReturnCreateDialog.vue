<template>
  <!--
    STR-RETURN-OPS-001 · 新增「单位退回」弹框（甲方 row213 第 5 条）

    必填：退回日期 + 退回单位（字典「退回单位配置」djs_return_unit，数据源为「出库去向」）。
    退回列表：产品名称 / 产品规格 / 退回量（手填）/ 产品单位 / 入库库位 / 处理方式。
    产品数据取字典「退回产品清单」djs_return_product_list（按产品编码 resolve）。

    确认后：在门店退回操作列表里新增一张 return_type='unit'、return_status='received' 的单，
    退回门店列显退回单位名；填了退回量且未丢弃的行同事务写入库（入库方式「门店退回」）。
  -->
  <el-dialog
    v-model="visible"
    :title="t('djs.warehouse.storeReturn.addTitle')"
    width="1080px"
    append-to-body
    destroy-on-close
  >
    <div class="unit-form">
      <el-form :inline="true" label-width="80px">
        <el-form-item :label="t('djs.warehouse.storeReturn.returnDate')" required>
          <el-date-picker
            v-model="returnDate"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="t('djs.warehouse.storeReturn.datePlaceholder')"
            :clearable="false"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.storeReturn.returnUnit')" required>
          <el-select
            v-model="returnUnit"
            filterable
            :placeholder="t('djs.warehouse.storeReturn.unitPlaceholder')"
            style="width: 240px"
          >
            <el-option v-for="u in unitOptions" :key="u.value" :label="u.label" :value="u.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.storeReturn.productName')">
          <el-input v-model="keyword" clearable :placeholder="t('djs.warehouse.storeReturn.searchProduct')" style="width: 200px" />
        </el-form-item>
      </el-form>
      <div class="unit-hint">{{ t('djs.warehouse.storeReturn.addHint') }}</div>

      <el-table v-loading="loading" :data="filteredRows" row-key="productId" border height="420">
        <el-table-column prop="productName" :label="t('djs.warehouse.storeReturn.productName')" min-width="160" show-overflow-tooltip align="center" header-align="center" />
        <el-table-column prop="productSpec" :label="t('djs.warehouse.storeReturn.productSpec')" min-width="110" align="center" header-align="center">
          <template #default="{ row: r }">{{ r.productSpec || '—' }}</template>
        </el-table-column>
        <el-table-column :label="t('djs.warehouse.storeReturn.returnQuantity')" min-width="160" align="center" header-align="center">
          <template #default="{ row: r }">
            <el-input-number
              v-model="r.returnQuantity"
              :min="0"
              :precision="returnQtyPrecision(r)"
              :step="returnQtyPrecision(r) === 0 ? 1 : Number((1 / 10 ** returnQtyPrecision(r)).toFixed(returnQtyPrecision(r)))"
              :controls="false"
              class="cell-num"
            />
          </template>
        </el-table-column>
        <el-table-column prop="productUnit" :label="t('djs.warehouse.storeReturn.productUnit')" min-width="90" align="center" header-align="center">
          <template #default="{ row: r }">{{ r.productUnit || '—' }}</template>
        </el-table-column>
        <el-table-column :label="t('djs.warehouse.storeReturn.inboundLocation')" min-width="200" align="center" header-align="center">
          <template #default="{ row: r }">
            <LocationSelect
              v-if="!isDiscardRow(r) && hasQuantity(r)"
              v-model="r.locationId"
              :options="r.locationOptions || []"
              :placeholder="t('djs.warehouse.storeReturn.locationPlaceholder')"
            />
            <span v-else>{{ isDiscardRow(r) && hasQuantity(r) ? t('djs.warehouse.storeReturn.discardNoLocation') : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('djs.warehouse.storeReturn.handleMode')" min-width="150" align="center" header-align="center">
          <template #default="{ row: r }">
            <template v-if="hasQuantity(r)">
              <el-select v-if="!mustDiscard(r)" v-model="r.isDiscard" class="cell-select">
                <el-option :label="t('djs.warehouse.storeReturn.handleInbound')" :value="0" />
                <el-option :label="t('djs.warehouse.storeReturn.handleDiscard')" :value="1" />
              </el-select>
              <template v-else>
                <span>{{ t('djs.warehouse.storeReturn.handleDiscard') }}</span>
                <el-tooltip :content="mustDiscardReason(r)" placement="top">
                  <el-icon class="hint-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </template>
            </template>
            <span v-else>—</span>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && !rows.length" :description="t('djs.warehouse.storeReturn.noCandidates')" />
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="StoreReturnUnitCreateDialog" lang="ts">
import { createUnitReturn, listReturnUnitCandidates } from '@/api/djs-store/return';
import type { StoreReturnUnitCandidateVO, StoreReturnUnitItemForm } from '@/api/djs-store/return/types';
import LocationSelect from '@/components/LocationSelect/index.vue';
import { useI18n } from 'vue-i18n';
import { defaultLocationOf, isKgUnit, toNum } from '../metric';

/** 候选 + 前端录入态 */
interface UnitRow extends StoreReturnUnitCandidateVO {
  /** 退回量（用户手填；null = 不参与本次退回） */
  returnQuantity?: number;
  locationId?: string;
  isDiscard?: number;
}

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 退回单位配置：值取自「出库去向」，由客户在字典管理自配
const { djs_return_unit } = toRefs<any>(proxy?.useDict('djs_return_unit'));

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'done'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
});

const unitOptions = computed<Array<{ label: string; value: string }>>(() =>
  (djs_return_unit?.value ?? []).map((d: any) => ({ label: d.label, value: d.value }))
);

const returnDate = ref<string>(todayLocal());
const returnUnit = ref<string>('');
const keyword = ref('');
const loading = ref(false);
const submitLoading = ref(false);
const rows = ref<UnitRow[]>([]);

/**
 * 本地「今天」（yyyy-MM-dd）。
 *
 * ⚠️ 不能用 `new Date().toISOString().slice(0,10)` —— toISOString 是 UTC，东八区 08:00 之前会给出**昨天**，
 * 用户一进弹框看到的退回日期就已经错了一天。
 */
function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const filteredRows = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return rows.value;
  return rows.value.filter((r) => (r.productName ?? '').includes(kw));
});

/** 是否填了退回量 —— 只有填了的行才参与统计与提交（甲方「根据用户填写了产品退回量的产品进行统计」）。 */
function hasQuantity(r: UnitRow): boolean {
  const n = toNum(r.returnQuantity);
  return n !== null && n > 0;
}

function isDiscardRow(r: UnitRow): boolean {
  return Number(r.isDiscard) === 1;
}

/** 生产产品没配原材料 / 单位不通又没配计量规则 → 只能丢弃（与后端提交闸同一条规则）。 */
function mustDiscard(r: UnitRow): boolean {
  return r.canInbound === false || r.canConvert === false;
}

function mustDiscardReason(r: UnitRow): string {
  return r.canInbound === false
    ? t('djs.warehouse.storeReturn.onlyDiscardNoMaterial')
    : t('djs.warehouse.storeReturn.onlyDiscardNoRatio');
}

/** 退回量精度（甲方第 6 条「支持录入两位小数」+ D-0017 的 kg 三位小数）。 */
function returnQtyPrecision(r: UnitRow): number {
  return isKgUnit(r.productUnit) ? 3 : 2;
}

async function loadCandidates() {
  loading.value = true;
  try {
    const res: any = await listReturnUnitCandidates();
    const list = (res?.data ?? res ?? []) as StoreReturnUnitCandidateVO[];
    rows.value = list.map((c) => {
      const row: UnitRow = { ...c, returnQuantity: undefined, isDiscard: 0 };
      if (mustDiscard(row)) {
        row.isDiscard = 1;
      }
      row.locationId = defaultLocationOf(c.defaultLocationId, c.locationOptions);
      return row;
    });
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      keyword.value = '';
      returnDate.value = todayLocal();
      loadCandidates();
    }
  }
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
  const picked = rows.value.filter(hasQuantity);
  if (!picked.length) {
    proxy?.$modal.msgError(t('djs.warehouse.storeReturn.quantityRequired'));
    return;
  }
  const missingLocation = picked.find((r) => !isDiscardRow(r) && !r.locationId);
  if (missingLocation) {
    proxy?.$modal.msgError(t('djs.warehouse.storeReturn.locationRequired', { name: missingLocation.productName ?? '' }));
    return;
  }

  const items: StoreReturnUnitItemForm[] = picked.map((r) => ({
    productId: r.productId,
    returnQuantity: toNum(r.returnQuantity) as number,
    locationId: isDiscardRow(r) ? undefined : r.locationId,
    isDiscard: isDiscardRow(r) ? 1 : 0
  }));

  submitLoading.value = true;
  try {
    await createUnitReturn({ returnDate: returnDate.value, returnUnit: returnUnit.value, items });
    proxy?.$modal.msgSuccess(t('djs.warehouse.storeReturn.addSuccess'));
    emit('done');
    visible.value = false;
  } finally {
    submitLoading.value = false;
  }
}
</script>

<style scoped>
.unit-hint {
  margin: 0 0 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.cell-num {
  width: 120px;
}

.cell-select {
  width: 120px;
}

.hint-icon {
  margin-left: 4px;
  color: var(--el-color-warning);
  vertical-align: middle;
}
</style>
