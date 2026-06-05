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
      :dict-types="['djs_pick_activity_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:plant:pick:activity"
      :show-add="true"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @page-change="handlePageChange"
    >
      <template #cell-totalYield="{ row }">{{ row.totalYield != null ? `${row.totalYield} kg` : '-' }}</template>
      <template #cell-visitorCount="{ row }">{{ row.visitorCount ?? '-' }}</template>
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:pick:activity:edit']" link type="primary" size="small" @click="handleEdit(row as PickActivityVO)">
          {{ t('common.edit') }}
        </el-button>
        <el-button
          v-if="(row as PickActivityVO).activityStatus !== 'ended'"
          v-hasPermi="['djs:plant:pick:activity:edit']"
          link
          type="success"
          size="small"
          @click="handleSummary(row as PickActivityVO)"
        >
          {{ t('pickActivity.action.summary') }}
        </el-button>
        <el-button v-hasPermi="['djs:plant:pick:activity:remove']" link type="danger" size="small" @click="handleDel(row as PickActivityVO)">
          {{ t('common.delete') }}
        </el-button>
      </template>
    </BizTable>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="t('pickActivity.field.activityName')" prop="activityName">
          <el-input v-model="form.activityName" maxlength="128" />
        </el-form-item>
        <el-form-item :label="t('pickActivity.field.activityDate')" prop="activityDate">
          <el-date-picker v-model="form.activityDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('pickActivity.field.cropId')" prop="cropId">
          <el-select v-model="form.cropId" filterable style="width: 100%">
            <el-option v-for="c in cropOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('pickActivity.field.activityStatus')">
          <el-select v-model="form.activityStatus" style="width: 100%">
            <el-option v-for="d in djs_pick_activity_status" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('pickActivity.field.totalPlot')">
          <el-input-number v-model="form.totalPlot" :min="0" />
        </el-form-item>
        <el-form-item :label="t('pickActivity.field.totalYield')">
          <el-input-number v-model="form.totalYield" :min="0" :precision="3" />
        </el-form-item>
        <el-form-item :label="t('pickActivity.field.visitorCount')">
          <el-input-number v-model="form.visitorCount" :min="0" />
        </el-form-item>
        <el-form-item :label="t('pickActivity.field.remark')">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PickActivityIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listPickActivity, getPickActivity, addPickActivity, updatePickActivity, delPickActivity, summaryPickActivity } from '@/api/djs-plant/pick';
import type { PickActivityForm, PickActivityQuery, PickActivityVO } from '@/api/djs-plant/pick/types';
import { listCrop } from '@/api/djs-plant/crop';
import { useI18n } from 'vue-i18n';
import type { FormInstance, FormRules } from 'element-plus';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_pick_activity_status } = toRefs<any>(proxy?.useDict('djs_pick_activity_status'));

const tableRef = ref<BizTableExpose>();

const list = ref<PickActivityVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  activityNo: undefined,
  activityName: undefined,
  activityStatus: undefined,
  cropId: undefined,
  activityDateRange: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'activityNo', label: t('pickActivity.field.activityNo'), type: 'input' },
  { field: 'activityName', label: t('pickActivity.field.activityName'), type: 'input' },
  { field: 'activityStatus', label: t('pickActivity.field.activityStatus'), type: 'select', dictType: 'djs_pick_activity_status' },
  { field: 'activityDateRange', label: t('pickActivity.field.activityDate'), type: 'daterange' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'activityNo', label: t('pickActivity.column.activityNo'), width: 160 },
  { prop: 'activityName', label: t('pickActivity.column.activityName'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'activityDate', label: t('pickActivity.column.activityDate'), width: 120, align: 'center' },
  { prop: 'activityStatus', label: t('pickActivity.column.activityStatus'), width: 110, align: 'center', dictType: 'djs_pick_activity_status' },
  { prop: 'cropName', label: t('pickActivity.column.crop'), width: 120 },
  { prop: 'totalPlot', label: t('pickActivity.column.totalPlot'), width: 100, align: 'center' },
  { prop: 'totalYield', label: t('pickActivity.column.totalYield'), width: 120, align: 'right' },
  { prop: 'visitorCount', label: t('pickActivity.column.visitorCount'), width: 100, align: 'center' }
]);

interface CropOption {
  label: string;
  value: string;
}
const cropOptions = ref<CropOption[]>([]);

async function loadCrops() {
  const res = await listCrop({ pageNum: 1, pageSize: 100 });
  // 兼容：表格 API 通常返回 rows[]
  const rows = ((res as { rows?: unknown[] }).rows ?? []) as Array<{ id: string; cropName: string }>;
  cropOptions.value = rows.map((c) => ({ value: String(c.id), label: c.cropName }));
}

async function loadList() {
  loading.value = true;
  try {
    const params: PickActivityQuery = {
      activityNo: searchModel.activityNo,
      activityName: searchModel.activityName,
      activityStatus: searchModel.activityStatus,
      cropId: searchModel.cropId,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const range = searchModel.activityDateRange as [string, string] | undefined;
    if (range && range.length === 2) {
      params.dateFrom = range[0];
      params.dateTo = range[1];
    }
    const res = await listPickActivity(params);
    const r = res as unknown as { rows?: PickActivityVO[]; total?: number };
    list.value = r.rows ?? [];
    total.value = r.total ?? 0;
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
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

// ============================================================
// 新增 / 编辑
// ============================================================
const dialogVisible = ref(false);
const dialogTitle = ref('');
const submitting = ref(false);
const formRef = ref<FormInstance>();

const form = reactive<PickActivityForm>({
  activityName: '',
  activityDate: '',
  activityStatus: 'upcoming',
  cropId: '',
  totalPlot: 0,
  totalYield: 0,
  visitorCount: undefined,
  remark: ''
});

const rules: FormRules = {
  activityName: [{ required: true, message: t('pickActivity.rule.activityNameRequired'), trigger: 'blur' }],
  activityDate: [{ required: true, message: t('pickActivity.rule.activityDateRequired'), trigger: 'change' }],
  cropId: [{ required: true, message: t('pickActivity.rule.cropRequired'), trigger: 'change' }]
};

function resetForm() {
  form.id = undefined;
  form.activityName = '';
  form.activityDate = '';
  form.activityStatus = 'upcoming';
  form.cropId = '';
  form.totalPlot = 0;
  form.totalYield = 0;
  form.visitorCount = undefined;
  form.remark = '';
}

function handleAdd() {
  resetForm();
  dialogTitle.value = t('pickActivity.dialog.addTitle');
  dialogVisible.value = true;
}

async function handleEdit(row: PickActivityVO) {
  resetForm();
  const res = await getPickActivity(row.id);
  const v = (res.data ?? row) as PickActivityVO;
  form.id = v.id;
  form.activityName = v.activityName;
  form.activityDate = v.activityDate;
  form.activityStatus = v.activityStatus;
  form.cropId = v.cropId;
  form.totalPlot = v.totalPlot;
  form.totalYield = v.totalYield;
  form.visitorCount = v.visitorCount;
  form.remark = v.remark;
  dialogTitle.value = t('pickActivity.dialog.editTitle');
  dialogVisible.value = true;
}

async function submit() {
  if (!formRef.value) {
    return;
  }
  await formRef.value.validate();
  submitting.value = true;
  try {
    if (form.id) {
      await updatePickActivity({ ...form });
      ElMessage.success(t('pickActivity.tip.updateSuccess'));
    } else {
      await addPickActivity({ ...form });
      ElMessage.success(t('pickActivity.tip.addSuccess'));
    }
    dialogVisible.value = false;
    await loadList();
  } finally {
    submitting.value = false;
  }
}

async function handleDel(row: PickActivityVO) {
  await ElMessageBox.confirm(t('pickActivity.confirm.del', { name: row.activityName }), t('common.tip'), { type: 'warning' });
  await delPickActivity(row.id);
  ElMessage.success(t('common.deleteSuccess'));
  await loadList();
}

async function handleSummary(row: PickActivityVO) {
  await ElMessageBox.confirm(t('pickActivity.confirm.summary', { name: row.activityName }), t('common.tip'), { type: 'warning' });
  const res = await summaryPickActivity(row.id);
  const v = res.data as PickActivityVO;
  ElMessage.success(t('pickActivity.tip.summarySuccess', { yield: v.totalYield ?? 0 }));
  await loadList();
}

onMounted(() => {
  loadCrops();
  loadList();
});
</script>
