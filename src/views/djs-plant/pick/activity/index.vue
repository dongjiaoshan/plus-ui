<template>
  <div class="p-2">
    <el-card shadow="never" class="mb-3">
      <el-form :inline="true" :model="searchModel">
        <el-form-item :label="t('pickActivity.field.activityNo')">
          <el-input v-model="searchModel.activityNo" :placeholder="t('pickActivity.placeholder.activityNo')" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item :label="t('pickActivity.field.activityName')">
          <el-input v-model="searchModel.activityName" :placeholder="t('pickActivity.placeholder.activityName')" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item :label="t('pickActivity.field.activityStatus')">
          <el-select v-model="searchModel.activityStatus" clearable style="width: 140px">
            <el-option v-for="d in djs_pick_activity_status" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('pickActivity.field.activityDate')">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            :range-separator="t('common.to')"
            :start-placeholder="t('pickActivity.placeholder.dateFrom')"
            :end-placeholder="t('pickActivity.placeholder.dateTo')"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div class="mb-3 flex justify-end gap-2">
        <el-button v-hasPermi="['djs:plant:pick:activity:add']" type="primary" @click="handleAdd">
          {{ t('common.add') }}
        </el-button>
      </div>

      <el-table v-loading="loading" :data="list" border stripe row-key="id" :empty-text="t('common.empty')">
        <el-table-column :label="t('pickActivity.column.activityNo')" prop="activityNo" width="160" />
        <el-table-column :label="t('pickActivity.column.activityName')" prop="activityName" min-width="160" show-overflow-tooltip />
        <el-table-column :label="t('pickActivity.column.activityDate')" prop="activityDate" width="120" align="center" />
        <el-table-column :label="t('pickActivity.column.activityStatus')" width="110" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_pick_activity_status" :value="row.activityStatus" />
          </template>
        </el-table-column>
        <el-table-column :label="t('pickActivity.column.crop')" prop="cropName" width="120" />
        <el-table-column :label="t('pickActivity.column.totalPlot')" prop="totalPlot" width="100" align="center" />
        <el-table-column :label="t('pickActivity.column.totalYield')" prop="totalYield" width="120" align="right">
          <template #default="{ row }">{{ row.totalYield != null ? `${row.totalYield} kg` : '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('pickActivity.column.visitorCount')" prop="visitorCount" width="100" align="center">
          <template #default="{ row }">{{ row.visitorCount ?? '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('pickActivity.column.action')" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-hasPermi="['djs:plant:pick:activity:edit']" link type="primary" size="small" @click="handleEdit(row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button
              v-hasPermi="['djs:plant:pick:activity:edit']"
              v-if="row.activityStatus !== 'ended'"
              link
              type="success"
              size="small"
              @click="handleSummary(row)"
            >
              {{ t('pickActivity.action.summary') }}
            </el-button>
            <el-button v-hasPermi="['djs:plant:pick:activity:remove']" link type="danger" size="small" @click="handleDel(row)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-3 flex justify-end">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadList"
          @current-change="loadList"
        />
      </div>
    </el-card>

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
import { listPickActivity, getPickActivity, addPickActivity, updatePickActivity, delPickActivity, summaryPickActivity } from '@/api/djs-plant/pick';
import type { PickActivityForm, PickActivityQuery, PickActivityVO } from '@/api/djs-plant/pick/types';
import { listCrop } from '@/api/djs-plant/crop';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';
import type { FormInstance, FormRules } from 'element-plus';

const { t } = useI18n();
const { djs_pick_activity_status } = useDict('djs_pick_activity_status');

const list = ref<PickActivityVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<PickActivityQuery>({
  activityNo: undefined,
  activityName: undefined,
  activityStatus: undefined,
  cropId: undefined
});

const dateRange = ref<[string, string] | null>(null);

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
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    if (dateRange.value) {
      params.dateFrom = dateRange.value[0];
      params.dateTo = dateRange.value[1];
    }
    const res = await listPickActivity(params);
    const r = res as unknown as { rows?: PickActivityVO[]; total?: number };
    list.value = r.rows ?? [];
    total.value = r.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  searchModel.activityNo = undefined;
  searchModel.activityName = undefined;
  searchModel.activityStatus = undefined;
  searchModel.cropId = undefined;
  dateRange.value = null;
  handleSearch();
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
