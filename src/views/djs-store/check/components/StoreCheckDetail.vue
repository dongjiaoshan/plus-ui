<template>
  <el-drawer v-model="visible" :title="t('storeCheck.detail.title')" size="780px" destroy-on-close>
    <!-- 盘点单概要 -->
    <el-descriptions :column="2" border size="small" class="mb-3">
      <el-descriptions-item :label="t('storeCheck.detail.checkId')">{{ header?.checkId || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('storeCheck.detail.store')">{{ header?.storeName || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('storeCheck.detail.checkDate')">{{ header?.checkDate || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('storeCheck.detail.checkStatus')">
        <dict-tag :options="djs_check_status" :value="header?.checkStatus" />
      </el-descriptions-item>
    </el-descriptions>

    <!-- 录入实盘明细（仅进行中可录） -->
    <el-card v-if="editable" shadow="never" class="mb-3">
      <template #header>
        <span class="font-medium">{{ t('storeCheck.detail.entryTitle') }}</span>
      </template>
      <el-form ref="lineFormRef" :model="lineForm" :rules="lineRules" :inline="true" label-width="80px">
        <el-form-item :label="t('storeCheck.detail.product')" prop="productId">
          <el-select v-model="lineForm.productId" filterable :placeholder="t('storeCheck.detail.productPlaceholder')" style="width: 200px">
            <el-option v-for="p in productOptions" :key="String(p.id)" :label="p.productName" :value="String(p.id)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('storeCheck.detail.checkStock')" prop="checkStock">
          <el-input-number v-model="lineForm.checkStock" :precision="3" :min="0" :step="1" controls-position="right" style="width: 150px" />
        </el-form-item>
        <el-form-item :label="t('storeCheck.detail.diffReason')">
          <el-input v-model="lineForm.diffReason" :placeholder="t('storeCheck.detail.diffReasonPlaceholder')" style="width: 180px" maxlength="255" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="lineSubmitting" icon="Plus" @click="handleSubmitLine">
            {{ t('storeCheck.detail.entrySubmit') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 明细列表 -->
    <el-table v-loading="loading" :data="lines" border size="small" :empty-text="t('storeCheck.detail.empty')">
      <el-table-column :label="t('storeCheck.detail.column.productName')" prop="productName" min-width="130" show-overflow-tooltip />
      <el-table-column :label="t('storeCheck.detail.column.productUnit')" prop="productUnit" width="70" align="center" />
      <el-table-column :label="t('storeCheck.detail.column.sysStock')" prop="sysStock" width="90" align="right" />
      <el-table-column :label="t('storeCheck.detail.column.checkStock')" prop="checkStock" width="90" align="right" />
      <el-table-column :label="t('storeCheck.detail.column.diffStock')" width="90" align="right">
        <template #default="{ row }">
          <span :class="diffClass(row.diffStock)">{{ formatDiff(row.diffStock) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('storeCheck.detail.column.checkResultType')" width="90" align="center">
        <template #default="{ row }">
          <dict-tag :options="djs_check_result" :value="row.checkResultType" />
        </template>
      </el-table-column>
      <el-table-column :label="t('storeCheck.detail.column.diffReason')" prop="diffReason" min-width="120" show-overflow-tooltip />
      <el-table-column v-if="editable" :label="t('common.operate')" width="70" align="center">
        <template #default="{ row }">
          <el-button v-hasPermi="['djs:store:check:add']" link type="danger" icon="Delete" @click="handleRemoveLine(row)">
            {{ t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
      <el-button
        v-if="editable"
        v-hasPermi="['djs:store:check:complete']"
        type="success"
        :loading="completing"
        icon="CircleCheck"
        @click="handleComplete"
      >
        {{ t('storeCheck.detail.complete') }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup name="StoreCheckDetail" lang="ts">
import { listStoreCheck, listStoreCheckLines, submitStoreCheckLine, removeStoreCheckLine, completeStoreCheck } from '@/api/djs-store/check';
import type { StoreCheckHeaderVO, StoreCheckLineForm, StoreCheckRecordVO } from '@/api/djs-store/check/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{ changed: [] }>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_check_status, djs_check_result } = toRefs<any>(proxy?.useDict('djs_check_status', 'djs_check_result'));

const visible = ref(false);
const loading = ref(false);
const completing = ref(false);
const lineSubmitting = ref(false);

const header = ref<StoreCheckHeaderVO>();
const lines = ref<StoreCheckRecordVO[]>([]);
const productOptions = ref<ProductInfoVO[]>([]);
const lineFormRef = ref<FormInstance>();

const editable = computed(() => header.value?.checkStatus === 'in_progress');

const defaultLineForm = (): StoreCheckLineForm => ({ checkId: '', productId: '', checkStock: 0, diffReason: '' });
const lineForm = reactive<StoreCheckLineForm>(defaultLineForm());

const lineRules: FormRules = {
  productId: [{ required: true, message: t('storeCheck.detail.productRequired'), trigger: 'change' }],
  checkStock: [{ required: true, message: t('storeCheck.detail.checkStockRequired'), trigger: 'blur' }]
};

function formatDiff(v: number | string | undefined): string {
  const n = Number(v ?? 0);
  if (Number.isNaN(n) || n === 0) return '0';
  return n > 0 ? `+${n}` : String(n);
}
function diffClass(v: number | string | undefined): string {
  const n = Number(v ?? 0);
  if (n > 0) return 'text-green-600';
  if (n < 0) return 'text-red-500';
  return '';
}

async function loadLines() {
  if (!header.value) return;
  loading.value = true;
  try {
    const res = await listStoreCheckLines({ storeId: header.value.storeId, checkId: header.value.checkId || undefined });
    lines.value = (res.data ?? []) as StoreCheckRecordVO[];
    // 新建后 header.checkId 可能为空，从首条明细回填（同 checkId）
    if (!header.value.checkId && lines.value.length) {
      header.value.checkId = lines.value[0].checkId;
    }
  } finally {
    loading.value = false;
  }
}

async function loadProductOptions() {
  try {
    const res = await listProduct({ pageNum: 1, pageSize: 500 });
    productOptions.value = ((res as unknown as { rows?: ProductInfoVO[] }).rows ?? []) as ProductInfoVO[];
  } catch (e) {
    console.warn('[StoreCheckDetail] loadProductOptions failed', e);
    productOptions.value = [];
  }
}

async function open(row: StoreCheckHeaderVO) {
  header.value = { ...row };
  Object.assign(lineForm, defaultLineForm());
  visible.value = true;
  // 新建后 checkId 为空（createCheck 只返回 header id）→ 按 storeId 查进行中单回填真实 checkId
  if (!header.value.checkId) {
    await fillCheckIdByStore();
  }
  await Promise.all([loadProductOptions(), loadLines()]);
}

async function fillCheckIdByStore() {
  if (!header.value) return;
  try {
    const res = await listStoreCheck({ pageNum: 1, pageSize: 5, storeId: header.value.storeId, checkStatus: 'in_progress' });
    const rows = (res.rows ?? res.data ?? []) as StoreCheckHeaderVO[];
    const hit = rows.find((r) => String(r.id) === String(header.value?.id)) ?? rows[0];
    if (hit) {
      header.value.checkId = hit.checkId;
      header.value.checkDate = hit.checkDate || header.value.checkDate;
    }
  } catch (e) {
    console.warn('[StoreCheckDetail] fillCheckIdByStore failed', e);
  }
}

async function handleSubmitLine() {
  await lineFormRef.value?.validate();
  if (!header.value) return;
  // checkId 优先用 header，回填后用明细的；新建首条时后端按 storeId 进行中单归并
  lineForm.checkId = header.value.checkId || '';
  if (!lineForm.checkId) {
    // 无 checkId（新建后未录任何明细）→ 后端按门店进行中单归并不需要 checkId 时，提示先重载
    proxy?.$modal.msgWarning(t('storeCheck.detail.noCheckId'));
    return;
  }
  lineSubmitting.value = true;
  try {
    await submitStoreCheckLine({ ...lineForm });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    Object.assign(lineForm, defaultLineForm());
    lineFormRef.value?.clearValidate();
    await loadLines();
    emit('changed');
  } finally {
    lineSubmitting.value = false;
  }
}

async function handleRemoveLine(row: StoreCheckRecordVO) {
  await proxy?.$modal.confirm(t('storeCheck.detail.confirmRemoveLine', { name: row.productName }));
  await removeStoreCheckLine(String(row.id));
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  await loadLines();
  emit('changed');
}

async function handleComplete() {
  if (!header.value) return;
  if (!lines.value.length) {
    proxy?.$modal.msgWarning(t('storeCheck.detail.noLineToComplete'));
    return;
  }
  await proxy?.$modal.confirm(t('storeCheck.confirm.complete', { id: header.value.checkId }));
  completing.value = true;
  try {
    await completeStoreCheck(String(header.value.id));
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    header.value.checkStatus = 'completed';
    emit('changed');
  } finally {
    completing.value = false;
  }
}

defineExpose({ open });
</script>
