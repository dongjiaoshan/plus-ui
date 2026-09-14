<template>
  <!--
    STR-RETURN-OPS-001 · 门店退回处理 / 查看详情抽屉（甲方 row213 第 4 条）

    右侧 el-drawer（admin 录入一律弹框/抽屉，不做整页；蒙层可点关闭，不设 close-on-click-modal=false）。

    两种形态共用同一份数据、同一个组件：
      · mode='handle'：待处理行的「仓库确认量 / 入库库位 / 处理方式」可编辑，底部出「处理完成」；
      · mode='detail'：全部行渲染为只读文本。
    已处理行（returnStatus='received'）在 handle 模式下**同样是只读**——它已经入过库，再让改就会
    与已落库的库存流水不一致（后端 confirm 的状态守卫也会拒）。
  -->
  <el-drawer v-model="visible" :title="drawerTitle" direction="rtl" size="960px" append-to-body destroy-on-close>
    <div v-loading="loading" class="ops-drawer">
      <div class="ops-head">
        <span class="ops-head__meta">
          {{ row?.returnType === 'unit' ? t('djs.warehouse.storeReturn.returnUnit') : t('djs.warehouse.storeReturn.returnStore') }}：{{
            row?.storeName || '—'
          }}
          <el-divider direction="vertical" />
          {{ t('djs.warehouse.storeReturn.returnDate') }}：{{ row?.returnDate || '—' }}
          <el-divider direction="vertical" />
          {{ t('djs.warehouse.storeReturn.returnStatus') }}：
          <dict-tag :options="djs_store_return_status" :value="row?.returnStatus" />
        </span>
      </div>

      <el-table :data="items" row-key="id" border height="480" class="ops-table">
        <el-table-column prop="productName" :label="t('djs.warehouse.storeReturn.productName')" min-width="150" show-overflow-tooltip align="center" header-align="center" />
        <el-table-column prop="productSpec" :label="t('djs.warehouse.storeReturn.productSpec')" min-width="110" align="center" header-align="center">
          <template #default="{ row: r }">{{ r.productSpec || '—' }}</template>
        </el-table-column>
        <el-table-column :label="t('djs.warehouse.storeReturn.returnQuantity')" min-width="120" align="center" header-align="center">
          <template #default="{ row: r }">{{ formatQty(r.returnQuantity, r) }}</template>
        </el-table-column>

        <!-- 仓库确认量：待处理行可填（默认 = 退回量），已处理行回显当时确认量 -->
        <el-table-column :label="t('djs.warehouse.storeReturn.confirmQuantity')" min-width="200" align="center" header-align="center">
          <template #default="{ row: r }">
            <div class="confirm-cell">
              <el-input-number
                v-if="isEditable(r)"
                v-model="r.confirmInput"
                :min="0"
                :precision="precisionOf(r)"
                :step="stepOf(r)"
                :max="maxOf(r)"
                :controls="false"
                class="cell-num"
              />
              <span v-else>{{ readonlyConfirmText(r) }}</span>
              <span class="cell-suffix">{{ metricSuffix(r) }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 入库库位：待处理行可下拉（默认 = 产品对应存储库位；猪肉只给鲜品库/冻品库） -->
        <el-table-column :label="t('djs.warehouse.storeReturn.inboundLocation')" min-width="200" align="center" header-align="center">
          <template #default="{ row: r }">
            <LocationSelect
              v-if="isEditable(r) && !isDiscardRow(r)"
              v-model="r.locationId"
              :options="r.locationOptions || []"
              :placeholder="t('djs.warehouse.storeReturn.locationPlaceholder')"
            />
            <span v-else>{{ r.locationName || (isEditable(r) && isDiscardRow(r) ? t('djs.warehouse.storeReturn.discardNoLocation') : '—') }}</span>
          </template>
        </el-table-column>

        <!-- 处理方式：待处理行可下拉（默认 产品入库）；置弃/无法换算的行锁死为产品丢弃 -->
        <el-table-column :label="t('djs.warehouse.storeReturn.handleMode')" min-width="160" align="center" header-align="center">
          <template #default="{ row: r }">
            <el-select v-if="isEditable(r) && !mustDiscard(r)" v-model="r.isDiscard" class="cell-select">
              <el-option :label="t('djs.warehouse.storeReturn.handleInbound')" :value="0" />
              <el-option :label="t('djs.warehouse.storeReturn.handleDiscard')" :value="1" />
            </el-select>
            <template v-else>
              <span>{{ Number(r.isDiscard) === 1 ? t('djs.warehouse.storeReturn.handleDiscard') : t('djs.warehouse.storeReturn.handleInbound') }}</span>
              <el-tooltip v-if="isEditable(r) && mustDiscard(r)" :content="mustDiscardReason(r)" placement="top">
                <el-icon class="hint-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && !items.length" :description="t('djs.warehouse.storeReturn.emptyItems')" />
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button v-if="mode === 'handle'" type="primary" :loading="submitLoading" :disabled="!pendingItems.length" @click="handleSubmit">
        {{ t('djs.warehouse.storeReturn.done') }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup name="StoreReturnOpsDrawer" lang="ts">
import { listReturnOpsItems, confirmStoreReturn } from '@/api/djs-store/return';
import type { StoreReturnOpsItemVO } from '@/api/djs-store/return/types';
import type { ReturnStoreDailyVO } from '@/api/djs-warehouse/return/types';
import LocationSelect from '@/components/LocationSelect/index.vue';
import { useI18n } from 'vue-i18n';
import {
  decimalsFor,
  defaultConfirmInput,
  defaultLocationOf,
  fromConfirmWeight,
  maxQty,
  metricIsKg,
  metricSuffix,
  toConfirmWeight,
  toNum
} from '../metric';

/** 行 + 前端编辑态（confirmInput / locationId / isDiscard 都是本地的，提交时才组装） */
interface OpsRow extends StoreReturnOpsItemVO {
  confirmInput?: number;
  locationId?: string;
  isDiscard?: number;
}

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_store_return_status } = toRefs<any>(proxy?.useDict('djs_store_return_status'));

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    /** handle=退回处理（可编辑 + 处理完成） / detail=查看详情（全只读） */
    mode?: 'handle' | 'detail';
    /** 外层列表行（提供 退回类型 / 日期 / 门店或退回单位 定位这张单） */
    row?: ReturnStoreDailyVO | null;
  }>(),
  { mode: 'handle', row: null }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'done'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
});

const drawerTitle = computed(() =>
  props.mode === 'detail' ? t('djs.warehouse.storeReturn.detailTitle') : t('djs.warehouse.storeReturn.handleTitle')
);

const loading = ref(false);
const submitLoading = ref(false);
const items = ref<OpsRow[]>([]);

/** 只有 handle 模式下、且这一行还没处理过，才允许编辑。 */
function isEditable(r: OpsRow): boolean {
  return props.mode === 'handle' && r.returnStatus !== 'received';
}

function isDiscardRow(r: OpsRow): boolean {
  return Number(r.isDiscard) === 1;
}

/**
 * 该行是否被强制「产品丢弃」：
 *   · canInbound=false —— 生产产品没配原材料，仓库不知道往哪个原材料头上记，只能丢弃；
 *   · canConvert=false —— 退回单位与原材料单位不同又没配计量规则，任何换算都是瞎猜。
 */
function mustDiscard(r: OpsRow): boolean {
  return r.canInbound === false || r.canConvert === false;
}

function mustDiscardReason(r: OpsRow): string {
  return r.canInbound === false
    ? t('djs.warehouse.storeReturn.onlyDiscardNoMaterial')
    : t('djs.warehouse.storeReturn.onlyDiscardNoRatio');
}

/** 第三列小数位：kg → 3 位（D-0017）；非 kg → 清单内 2 位 / 否则整数（D-0054）。 */
function precisionOf(r: OpsRow): number {
  return metricIsKgRow(r) ? 3 : decimalsFor(r);
}

function stepOf(r: OpsRow): number {
  const p = precisionOf(r);
  return p === 0 ? 1 : Number((1 / 10 ** p).toFixed(p));
}

function maxOf(r: OpsRow): number | undefined {
  return maxQty(r) ?? undefined;
}

function metricIsKgRow(r: OpsRow): boolean {
  return metricIsKg(r);
}

/** 已处理行的确认量回显：库里是原材料量，换算回退回单位再显示（与 mp fromConfirmWeight 同源）。 */
function readonlyConfirmText(r: OpsRow): string {
  const text = fromConfirmWeight(r, r.receivedWeight);
  return text === '' ? '—' : text;
}

function formatQty(v: number | string | undefined | null, r: OpsRow): string {
  const n = toNum(v);
  if (n === null) return '—';
  const unit = r.productUnit || '';
  const text = metricIsKgRow(r) ? n.toFixed(3) : String(Number(n.toFixed(decimalsFor(r) || 3)));
  return `${text}${unit}`;
}

const pendingItems = computed(() => items.value.filter((r) => r.returnStatus !== 'received'));

/** 后端下推的判据落成本地可编辑态：默认确认量 = 退回量；默认库位 = 产品对应存储库位；默认处理方式 = 产品入库。 */
function hydrate(rows: StoreReturnOpsItemVO[]) {
  items.value = rows.map((r) => {
    const row: OpsRow = { ...r };
    row.isDiscard = mustDiscard(row) ? 1 : Number(r.isDiscard ?? 0);
    const dft = defaultConfirmInput(row);
    const n = toNum(dft);
    row.confirmInput = n === null ? undefined : n;
    row.locationId = defaultLocationOf(r.defaultLocationId, r.locationOptions);
    return row;
  });
}

async function loadItems() {
  if (!props.row) return;
  loading.value = true;
  try {
    const res: any = await listReturnOpsItems({
      returnType: props.row.returnType,
      // 单位退回没有门店，用「退回单位」定位这张单；门店退回用门店 id。
      storeId: props.row.returnType === 'unit' ? undefined : props.row.storeId,
      returnUnit: props.row.returnType === 'unit' ? props.row.returnUnit : undefined,
      returnDateFrom: props.row.returnDate,
      returnDateTo: props.row.returnDate,
      pageNum: 1,
      pageSize: 500
    });
    hydrate((res?.data ?? res ?? []) as StoreReturnOpsItemVO[]);
  } finally {
    loading.value = false;
  }
}

watch(
  () => [props.modelValue, props.row] as const,
  ([open]) => {
    if (open) {
      loadItems();
    } else {
      items.value = [];
    }
  },
  { immediate: true }
);

/**
 * 处理完成 = 整单逐行调 confirm（沿用既有的并发守卫 + 丢弃分支 + 入库链路，不自己写库存）。
 *
 * 已处理行不重发（后端 confirm 会以状态守卫幂等跳过，但前端少一次无谓请求）。
 */
async function handleSubmit() {
  const targets = pendingItems.value.slice();
  if (!targets.length) return;

  for (const r of targets) {
    const n = toNum(r.confirmInput);
    if (n === null || n <= 0) {
      proxy?.$modal.msgError(t('djs.warehouse.storeReturn.confirmRequired', { name: r.productName ?? '' }));
      return;
    }
    // 换算成原材料量后必须仍 > 0：0.001 份 × 0.25 = 0.000，后端 @Positive 会拒。
    // 这里先拦，比让整单跑到一半吃 400 好（后面的行已经入库了）。
    if (!isDiscardRow(r) && toConfirmWeight(r, n) <= 0) {
      proxy?.$modal.msgError(t('djs.warehouse.storeReturn.confirmTooSmall', { name: r.productName ?? '' }));
      return;
    }
    if (!isDiscardRow(r) && !r.locationId) {
      proxy?.$modal.msgError(t('djs.warehouse.storeReturn.locationRequired', { name: r.productName ?? '' }));
      return;
    }
  }

  submitLoading.value = true;
  let done = 0;
  try {
    for (const r of targets) {
      // 界面按**退回单位**录，提交给后端的 receivedQty/receivedWeight 必须是**原材料量** ——
      // 与 mp metric.ts#toConfirmWeight 同一套换算，否则同一张单两端口径不同。
      const confirmWeight = toConfirmWeight(r, r.confirmInput);
      try {
        await confirmStoreReturn({
          id: r.id,
          locationId: isDiscardRow(r) ? undefined : r.locationId,
          receivedQty: confirmWeight,
          receivedWeight: confirmWeight,
          isDiscard: isDiscardRow(r) ? 1 : 0
        });
        done += 1;
      } catch {
        // 单行失败（多为并发确认 / 库位失效）：已成功的行不回滚，如实报出进度后刷新列表，
        // 让用户看到「哪几行已经处理完」，而不是一句「处理失败」把已做的活说没了。
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
.ops-drawer {
  min-height: 200px;
}

.ops-head {
  margin-bottom: 8px;
}

.ops-head__meta {
  display: inline-flex;
  align-items: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.confirm-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cell-num {
  width: 120px;
}

.cell-suffix {
  color: var(--el-text-color-secondary);
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
