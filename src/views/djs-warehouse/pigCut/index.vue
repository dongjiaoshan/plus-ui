<template>
  <div class="p-2">
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_bar_status', 'djs_pig_cut_part', 'djs_pig_cut_status', 'djs_pig_cut_out_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:pigCut"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- 顶部白条领用入口 -->
      <template #toolbar-extra>
        <el-button v-hasPermi="['djs:applet:warehouse:pigCut:in']" type="primary" plain @click="openPickup">
          {{ t('djs.warehouse.pigCut.pickupAction') }}
        </el-button>
      </template>
      <!-- P5 外购标注：外购行显「普通白条」+ 供应商名，自养行显耳号 -->
      <template #cell-earNo="{ row }">
        <template v-if="row.isOutsource">
          <el-tag type="warning" size="small" disable-transitions>{{ t('djs.warehouse.pigCut.outsourceBar') }}</el-tag>
          <span v-if="row.supplierName" class="supplier-name">{{ row.supplierName }}</span>
        </template>
        <span v-else>{{ row.earNo ?? '—' }}</span>
      </template>
      <!-- 按行 cutStatus 渲染分割出库 / 分割完成入口 -->
      <template #action="{ row }">
        <el-button
          v-if="['picked', 'cutting'].includes(row.cutStatus)"
          v-hasPermi="['djs:applet:warehouse:pigCut:out']"
          link
          type="primary"
          @click="openCutOut(row)"
        >
          {{ t('djs.warehouse.pigCut.cutOutAction') }}
        </el-button>
        <el-button
          v-if="row.cutStatus === 'cutting'"
          v-hasPermi="['djs:applet:warehouse:pigCut:done']"
          link
          type="success"
          @click="openCutDone(row)"
        >
          {{ t('djs.warehouse.pigCut.cutDoneAction') }}
        </el-button>
        <span v-if="!['picked', 'cutting'].includes(row.cutStatus)">—</span>
      </template>
    </BizTable>

    <!-- 白条领用弹窗 -->
    <el-dialog v-model="pickupVisible" :title="t('djs.warehouse.pigCut.pickupAction')" width="560px" destroy-on-close append-to-body>
      <el-form ref="pickupFormRef" :model="pickupForm" :rules="pickupRules" label-width="120px">
        <el-form-item :label="t('djs.warehouse.pigCut.selectBar')" prop="barInfoId">
          <el-select
            v-model="pickupForm.barInfoId"
            :placeholder="t('djs.warehouse.pigCut.selectBarPlaceholder')"
            filterable
            style="width: 100%"
            @change="onBarChange"
          >
            <el-option v-for="b in availableBars" :key="b.id" :label="barLabel(b)" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.pigCut.location')" prop="locationId">
          <el-select v-model="pickupForm.locationId" :placeholder="t('djs.warehouse.pigCut.selectLocation')" filterable clearable style="width: 100%">
            <el-option v-for="loc in frozenLocations" :key="loc.id" :label="loc.locationName" :value="loc.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.pigCut.pickupWeight')" prop="pickupWeight">
          <el-input-number v-model="pickupForm.pickupWeight" :min="0" :precision="2" :step="0.5" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.pigCut.remark')">
          <el-input v-model="pickupForm.remark" type="textarea" :rows="2" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pickupVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submitPickup">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 分割出库弹窗 -->
    <el-dialog v-model="cutOutVisible" :title="t('djs.warehouse.pigCut.cutOutAction')" width="820px" destroy-on-close append-to-body>
      <el-form ref="cutOutFormRef" :model="cutOutForm" :rules="cutOutRules" label-width="120px">
        <el-form-item :label="t('djs.warehouse.pigCut.location')" prop="locationId">
          <el-select v-model="cutOutForm.locationId" :placeholder="t('djs.warehouse.pigCut.selectLocation')" filterable style="width: 100%">
            <el-option v-for="loc in frozenLocations" :key="loc.id" :label="loc.locationName" :value="loc.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.pigCut.partItems')" prop="partItems">
          <el-table :data="cutOutForm.partItems" border size="small" style="width: 100%">
            <el-table-column :label="t('djs.warehouse.pigCut.selectProduct')" min-width="200">
              <template #default="{ row }">
                <el-select v-model="row.productId" :placeholder="t('djs.warehouse.pigCut.selectProduct')" filterable style="width: 100%">
                  <el-option v-for="p in porkProducts" :key="p.id" :label="p.productName" :value="p.id" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="t('djs.warehouse.pigCut.partWeight')" width="160">
              <template #default="{ row }">
                <el-input-number v-model="row.productWeight" :min="0.001" :precision="3" :step="0.5" controls-position="right" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column :label="t('djs.warehouse.pigCut.partSpec')" width="150">
              <template #default="{ row }">
                <el-input v-model="row.productSpec" maxlength="64" />
              </template>
            </el-table-column>
            <el-table-column :label="t('common.operate')" width="70" align="center">
              <template #default="{ $index }">
                <el-button link type="danger" :disabled="cutOutForm.partItems.length <= 1" @click="removePart($index)">
                  {{ t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button link type="primary" class="mt-2" @click="addPart">{{ t('djs.warehouse.pigCut.addPart') }}</el-button>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.pigCut.proof')">
          <OssUpload v-model="cutOutProofModel" biz-type="pig_cut_proof" :limit="6" :file-size="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cutOutVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submitCutOut">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 分割完成弹窗 -->
    <el-dialog v-model="cutDoneVisible" :title="t('djs.warehouse.pigCut.cutDoneAction')" width="560px" destroy-on-close append-to-body>
      <el-form ref="cutDoneFormRef" :model="cutDoneForm" label-width="120px">
        <el-alert :title="t('djs.warehouse.pigCut.dripLossAutoHint')" type="info" :closable="false" show-icon class="mb-3" />
        <el-form-item :label="t('djs.warehouse.pigCut.proof')">
          <OssUpload v-model="cutDoneProofModel" biz-type="pig_cut_proof" :limit="6" :file-size="10" />
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.pigCut.remark')">
          <el-input v-model="cutDoneForm.remark" type="textarea" :rows="2" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cutDoneVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submitCutDone">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PigCut" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import BizTable from '@/components/BizTable/index.vue';
import OssUpload from '@/components/OssUpload/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import {
  listPigCut,
  listAvailableBars,
  pickupPigCut,
  cutOutPigCut,
  cutDonePigCut
} from '@/api/djs-warehouse/pigCut';
import type {
  PigCutRecordQuery,
  PigCutRecordVO,
  AvailableBarVO,
  PigCutPickupForm,
  PigCutOutForm,
  PigCutDoneForm,
  PigCutPartItem
} from '@/api/djs-warehouse/pigCut/types';
import { listProduct } from '@/api/djs-warehouse/product';
import { listLocation } from '@/api/djs-warehouse/location';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import type { LocationInfoVO } from '@/api/djs-warehouse/location/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<PigCutRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  cutId: undefined,
  barId: undefined,
  earNo: undefined,
  // R70 分割状态下拉多选 → 默认空数组
  cutStatus: [],
  pickupTimeFrom: undefined,
  pickupTimeTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'cutId', label: t('djs.warehouse.pigCut.cutId'), type: 'input' },
  { field: 'barId', label: t('djs.warehouse.pigCut.barId'), type: 'input' },
  { field: 'earNo', label: t('djs.warehouse.pigCut.earNo'), type: 'input' },
  { field: 'cutStatus', label: t('djs.warehouse.pigCut.cutStatus'), type: 'select', multiple: true, dictType: 'djs_pig_cut_status' }
]);

/** searchModel → 后端 query：R70 cutStatus 多选转复数 cutStatuses（后端 IN），删单值发送。 */
function buildQuery(): PigCutRecordQuery {
  const cutStatuses = Array.isArray(searchModel.cutStatus) && searchModel.cutStatus.length ? searchModel.cutStatus : undefined;
  return {
    cutId: searchModel.cutId || undefined,
    barId: searchModel.barId || undefined,
    earNo: searchModel.earNo || undefined,
    cutStatuses,
    pickupTimeFrom: searchModel.pickupTimeFrom || undefined,
    pickupTimeTo: searchModel.pickupTimeTo || undefined
  };
}

/** 比率 → 百分比文本；分母缺失（后端返 null/undefined）显「—」 */
function fmtRate(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

/** 重量 → kg 文本（2 位小数）；缺失显「—」 */
function fmtKg(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return n.toFixed(2);
}

/** 分钟 → 文本；缺失显「—」 */
function fmtMinutes(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return String(n);
}

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cutId', label: t('djs.warehouse.pigCut.cutId'), minWidth: 140 },
  { prop: 'barId', label: t('djs.warehouse.pigCut.barId'), minWidth: 140 },
  { prop: 'whiteBarNo', label: t('djs.warehouse.pigCut.whiteBarNo'), minWidth: 150, formatter: (row) => row.whiteBarNo ?? '—' },
  { prop: 'earNo', label: t('djs.warehouse.pigCut.earNo'), minWidth: 140 },
  { prop: 'supplierName', label: t('djs.warehouse.pigCut.supplierName'), minWidth: 120, formatter: (row) => row.supplierName ?? '—' },
  { prop: 'pickupTime', label: t('djs.warehouse.pigCut.pickupTime'), minWidth: 160 },
  { prop: 'cutStartTime', label: t('djs.warehouse.pigCut.cutStartTime'), minWidth: 160 },
  { prop: 'cutDoneTime', label: t('djs.warehouse.pigCut.cutDoneTime'), minWidth: 160 },
  { prop: 'pickupWeight', label: t('djs.warehouse.pigCut.pickupWeight'), minWidth: 100 },
  { prop: 'headSkinYieldRate', label: t('djs.warehouse.pigCut.headSkinYieldRate'), minWidth: 110, formatter: (row) => fmtRate(row.headSkinYieldRate) },
  { prop: 'whiteBarYieldRate', label: t('djs.warehouse.pigCut.whiteBarYieldRate'), minWidth: 110, formatter: (row) => fmtRate(row.whiteBarYieldRate) },
  { prop: 'precoolLossWeight', label: t('djs.warehouse.pigCut.precoolLossWeight'), minWidth: 110, formatter: (row) => fmtKg(row.precoolLossWeight) },
  { prop: 'precoolLossRate', label: t('djs.warehouse.pigCut.precoolLossRate'), minWidth: 110, formatter: (row) => fmtRate(row.precoolLossRate) },
  { prop: 'coldStorageMinutes', label: t('djs.warehouse.pigCut.coldStorageMinutes'), minWidth: 110, formatter: (row) => fmtMinutes(row.coldStorageMinutes) },
  { prop: 'cutProductTotalWeight', label: t('djs.warehouse.pigCut.cutProductTotalWeight'), minWidth: 110, formatter: (row) => fmtKg(row.cutProductTotalWeight) },
  { prop: 'cutLossWeight', label: t('djs.warehouse.pigCut.cutLossWeight'), minWidth: 100, formatter: (row) => fmtKg(row.cutLossWeight) },
  { prop: 'dripLoss', label: t('djs.warehouse.pigCut.dripLoss'), minWidth: 100 },
  { prop: 'acidRemoveMinutes', label: t('djs.warehouse.pigCut.acidRemoveMinutes'), minWidth: 100 },
  { prop: 'cutStatus', label: t('djs.warehouse.pigCut.cutStatus'), minWidth: 100, dictType: 'djs_pig_cut_status' },
  { prop: 'outType', label: t('djs.warehouse.pigCut.outType'), minWidth: 100, dictType: 'djs_pig_cut_out_type' },
  { prop: 'operatorName', label: t('djs.warehouse.pigCut.operator'), minWidth: 100 },
  { prop: 'locationName', label: t('djs.warehouse.pigCut.location'), minWidth: 120 },
  { prop: 'remark', label: t('djs.warehouse.pigCut.remark'), minWidth: 160 }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: PigCutRecordQuery = {
      ...buildQuery(),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listPigCut(params);
    list.value = (res as any).rows ?? [];
    total.value = (res as any).total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => {
    searchModel[k] = undefined;
  });
  handleSearch();
}

function handlePageChange(p: { pageNum: number; pageSize: number }) {
  pageNum.value = p.pageNum;
  pageSize.value = p.pageSize;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/pigCut/export', buildQuery(), `白条领用记录_${new Date().getTime()}.xlsx`);
}

// ============ 写动作共享数据源 ============

const submitting = ref(false);
/** 冻品库库位（locationType='frozen'） */
const frozenLocations = ref<LocationInfoVO[]>([]);
/** 分割成品产品（productType=1 自产 / productWorkshop=2 分割车间 / belongType=pork） */
const porkProducts = ref<ProductInfoVO[]>([]);

async function ensureFrozenLocations() {
  if (frozenLocations.value.length) return;
  const res = await listLocation({ locationType: 'frozen', pageNum: 1, pageSize: 200 });
  frozenLocations.value = (res as any).rows ?? [];
}

async function ensurePorkProducts() {
  if (porkProducts.value.length) return;
  const res = await listProduct({ productType: 1, productWorkshop: '2', belongType: 'pork', pageNum: 1, pageSize: 200 });
  porkProducts.value = (res as any).rows ?? [];
}

// ============ 阶段 1：白条领用 ============

const pickupVisible = ref(false);
const pickupFormRef = ref<FormInstance>();
const availableBars = ref<AvailableBarVO[]>([]);
const pickupForm = reactive<PigCutPickupForm>({
  barInfoId: undefined,
  locationId: undefined,
  pickupWeight: undefined,
  remark: undefined
});

const pickupRules: FormRules = {
  barInfoId: [{ required: true, message: t('djs.warehouse.pigCut.selectBarPlaceholder'), trigger: 'change' }]
};

function barLabel(b: AvailableBarVO): string {
  const wt = b.marketingWeight ?? b.inWeight;
  return `${b.barId}${b.earNo ? ' / ' + b.earNo : ''}${wt != null ? ' (' + Number(wt).toFixed(2) + 'kg)' : ''}`;
}

/** 选白条后默认带出出栏重量到领用称重 */
function onBarChange(id: number) {
  const bar = availableBars.value.find((b) => b.id === id);
  if (bar) {
    pickupForm.pickupWeight = bar.marketingWeight ?? bar.inWeight ?? undefined;
  }
}

async function openPickup() {
  Object.assign(pickupForm, { barInfoId: undefined, locationId: undefined, pickupWeight: undefined, remark: undefined });
  pickupVisible.value = true;
  const [barRes] = await Promise.all([listAvailableBars(), ensureFrozenLocations()]);
  availableBars.value = (barRes as any).data ?? [];
}

async function submitPickup() {
  await pickupFormRef.value?.validate();
  submitting.value = true;
  try {
    await pickupPigCut({ ...pickupForm });
    proxy?.$modal.msgSuccess(t('djs.warehouse.pigCut.pickupSuccess'));
    pickupVisible.value = false;
    loadList();
  } finally {
    submitting.value = false;
  }
}

// ============ 阶段 2：分割出库 ============

const cutOutVisible = ref(false);
const cutOutFormRef = ref<FormInstance>();
const cutOutProofModel = ref<string[]>([]);
const cutOutForm = reactive<PigCutOutForm>({
  cutRecordId: undefined,
  locationId: undefined,
  partItems: []
});

const cutOutRules: FormRules = {
  locationId: [{ required: true, message: t('djs.warehouse.pigCut.selectLocation'), trigger: 'change' }]
};

function newPart(): PigCutPartItem {
  return { productId: undefined, productWeight: undefined, productSpec: undefined };
}

function addPart() {
  cutOutForm.partItems.push(newPart());
}

function removePart(idx: number) {
  cutOutForm.partItems.splice(idx, 1);
}

async function openCutOut(row: PigCutRecordVO) {
  cutOutForm.cutRecordId = row.id;
  cutOutForm.locationId = row.locationId ?? undefined;
  cutOutForm.partItems = [newPart()];
  cutOutProofModel.value = [];
  cutOutVisible.value = true;
  await Promise.all([ensureFrozenLocations(), ensurePorkProducts()]);
}

async function submitCutOut() {
  await cutOutFormRef.value?.validate();
  const valid = cutOutForm.partItems.filter((p) => p.productId && p.productWeight && Number(p.productWeight) > 0);
  if (!valid.length) {
    proxy?.$modal.msgWarning(t('djs.warehouse.pigCut.partItemsRequired'));
    return;
  }
  submitting.value = true;
  try {
    const payload: PigCutOutForm = {
      cutRecordId: cutOutForm.cutRecordId,
      locationId: cutOutForm.locationId,
      partItems: valid,
      proofOssIds: cutOutProofModel.value.join(',') || undefined
    };
    await cutOutPigCut(payload);
    proxy?.$modal.msgSuccess(t('djs.warehouse.pigCut.cutOutSuccess'));
    cutOutVisible.value = false;
    loadList();
  } finally {
    submitting.value = false;
  }
}

// ============ 阶段 3：分割完成 ============

const cutDoneVisible = ref(false);
const cutDoneFormRef = ref<FormInstance>();
const cutDoneProofModel = ref<string[]>([]);
const cutDoneForm = reactive<PigCutDoneForm>({
  cutRecordId: undefined,
  remark: undefined
});

function openCutDone(row: PigCutRecordVO) {
  cutDoneForm.cutRecordId = row.id;
  cutDoneForm.remark = undefined;
  cutDoneProofModel.value = [];
  cutDoneVisible.value = true;
}

async function submitCutDone() {
  await cutDoneFormRef.value?.validate();
  submitting.value = true;
  try {
    const payload: PigCutDoneForm = {
      cutRecordId: cutDoneForm.cutRecordId,
      remark: cutDoneForm.remark,
      proofOssIds: cutDoneProofModel.value.join(',') || undefined
    };
    await cutDonePigCut(payload);
    proxy?.$modal.msgSuccess(t('djs.warehouse.pigCut.cutDoneSuccess'));
    cutDoneVisible.value = false;
    loadList();
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadList();
});
</script>

<style scoped>
.supplier-name {
  margin-left: 6px;
  color: var(--el-text-color-regular);
}
</style>
