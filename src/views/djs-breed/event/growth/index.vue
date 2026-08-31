<template>
  <div class="p-2">
    <el-alert type="info" :closable="false" class="mb-2" :title="t('breedEvent.growth.tip')" />

    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:breed:event:growth"
      :show-add="true"
      :show-batch-del="false"
      :show-export="false"
      @search="handleSearch"
      @reset="handleReset"
      @add="openAdd"
      @page-change="handlePageChange"
    >
      <template #cell-weight="{ row }">
        <span>{{ row.weight }} kg</span>
      </template>
      <template #cell-backfatThickness="{ row }">
        <span v-if="row.backfatThickness != null">{{ row.backfatThickness }} mm</span>
        <span v-else class="muted">—</span>
      </template>
      <template #cell-backHeight="{ row }">
        <span v-if="row.backHeight != null">{{ row.backHeight }} cm</span>
        <span v-else class="muted">—</span>
      </template>
      <template #cell-action="{ row }">
        <el-button v-hasPermi="['djs:breed:event:growth:remove']" type="danger" link size="small" @click="handleDelete(row)">
          {{ t('common.delete') }}
        </el-button>
      </template>
    </BizTable>

    <el-dialog v-model="addVisible" :title="t('breedEvent.growth.form.title')" width="540px">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="120px">
        <el-form-item :label="t('breedEvent.growth.form.pig')" prop="earNo">
          <el-select
            v-model="addForm.earNo"
            filterable
            remote
            reserve-keyword
            :remote-method="searchPig"
            :loading="pigSearching"
            :placeholder="t('breedEvent.growth.form.pigPlaceholder')"
            style="width: 100%"
            @change="onPigSelected"
          >
            <el-option v-for="p in pigOptions" :key="p.id" :label="p.earNo" :value="p.earNo" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('breedEvent.growth.form.measureDate')" prop="measureDate">
          <el-date-picker
            v-model="addForm.measureDate"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="t('breedEvent.growth.form.measureDatePlaceholder')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('breedEvent.growth.form.weight')" prop="weight">
          <el-input-number v-model="addForm.weight" :min="0.01" :max="999.99" :precision="2" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('breedEvent.growth.form.backfatThickness')">
          <el-input-number v-model="addForm.backfatThickness" :min="0" :max="999.99" :precision="2" :step="0.5" style="width: 100%" />
          <span class="form-hint">{{ t('breedEvent.growth.form.backfatHint') }}</span>
        </el-form-item>
        <el-form-item :label="t('breedEvent.growth.form.backHeight')">
          <el-input-number v-model="addForm.backHeight" :min="0" :max="999.99" :precision="2" :step="1" style="width: 100%" />
          <span class="form-hint">{{ t('breedEvent.growth.form.backHeightHint') }}</span>
        </el-form-item>
        <el-form-item :label="t('breedEvent.growth.form.remark')">
          <el-input v-model="addForm.remark" type="textarea" :rows="2" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="addSubmitting" @click="submitAdd">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DjsBreedEventGrowth" lang="ts">
import { todayYmd } from '@/utils/date';
import { useI18n } from 'vue-i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { addGrowth, delGrowth, listGrowth } from '@/api/djs-breed/event/growth';
import type { PigGrowthBody, PigGrowthQuery, PigGrowthVO } from '@/api/djs-breed/event/growth';
import { listPig } from '@/api/djs-breed/pig';
import type { PigVO } from '@/api/djs-breed/pig/types';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const list = ref<PigGrowthVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<PigGrowthQuery>({
  earNo: undefined,
  beginDate: undefined,
  endDate: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'earNo',
    label: t('breedEvent.growth.field.earNo'),
    type: 'input',
    placeholder: t('breedEvent.growth.placeholder.earNo'),
    clearable: true
  },
  { field: 'beginDate', label: t('breedEvent.growth.field.beginDate'), type: 'date', clearable: true },
  { field: 'endDate', label: t('breedEvent.growth.field.endDate'), type: 'date', clearable: true }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'id', label: t('breedEvent.growth.column.id'), width: 90, fixed: 'left', visible: false },
  { prop: 'earNo', label: t('breedEvent.growth.column.earNo'), minWidth: 140, fixed: 'left' },
  { prop: 'measureDate', label: t('breedEvent.growth.column.measureDate'), width: 120, align: 'center', formatter: 'date' },
  { prop: 'weight', label: t('breedEvent.growth.column.weight'), width: 110, align: 'right' },
  { prop: 'backfatThickness', label: t('breedEvent.growth.column.backfatThickness'), width: 100, align: 'right' },
  { prop: 'backHeight', label: t('breedEvent.growth.column.backHeight'), width: 100, align: 'right' },
  { prop: 'barnName', label: t('breedEvent.growth.column.barnName'), width: 100, align: 'center' },
  { prop: 'penName', label: t('breedEvent.growth.column.penName'), width: 100, align: 'center' },
  { prop: 'remark', label: t('breedEvent.growth.column.remark'), minWidth: 160 },
  { prop: 'createTime', label: t('breedEvent.growth.column.createTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'action', label: t('breedEvent.growth.column.action'), width: 90, align: 'center', fixed: 'right' }
]);

const addVisible = ref(false);
const addSubmitting = ref(false);
const addFormRef = ref<FormInstance>();

const pigOptions = ref<PigVO[]>([]);
const pigSearching = ref(false);

interface GrowthAddForm {
  earNo: string;
  pigId: string;
  measureDate: string;
  weight: number | undefined;
  backfatThickness: number | undefined;
  backHeight: number | undefined;
  remark: string;
}

const addForm = reactive<GrowthAddForm>({
  earNo: '',
  pigId: '',
  measureDate: '',
  weight: undefined,
  backfatThickness: undefined,
  backHeight: undefined,
  remark: ''
});

const addRules: FormRules = {
  earNo: [{ required: true, message: t('breedEvent.growth.rule.pig'), trigger: 'change' }],
  measureDate: [{ required: true, message: t('breedEvent.growth.rule.measureDate'), trigger: 'change' }],
  weight: [{ required: true, message: t('breedEvent.growth.rule.weight'), trigger: 'blur' }]
};

async function load() {
  loading.value = true;
  try {
    const params: PigGrowthQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listGrowth(params);
    list.value = (res.rows ?? []) as PigGrowthVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, string | undefined>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  load();
}

function handleReset() {
  Object.assign(searchModel, {
    earNo: undefined,
    beginDate: undefined,
    endDate: undefined
  });
  pageNum.value = 1;
  load();
}

function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  load();
}

async function searchPig(query: string) {
  if (!query) {
    pigOptions.value = [];
    return;
  }
  pigSearching.value = true;
  try {
    const res = await listPig({ earNo: query, pageNum: 1, pageSize: 20, excludeEnd: true });
    pigOptions.value = (res.rows ?? []) as PigVO[];
  } finally {
    pigSearching.value = false;
  }
}

function onPigSelected(earNo: string) {
  const target = pigOptions.value.find((p) => p.earNo === earNo);
  addForm.pigId = target ? String(target.id) : '';
}

function openAdd() {
  addForm.earNo = '';
  addForm.pigId = '';
  addForm.measureDate = todayYmd();
  addForm.weight = undefined;
  addForm.backfatThickness = undefined;
  addForm.backHeight = undefined;
  addForm.remark = '';
  pigOptions.value = [];
  addVisible.value = true;
}

async function submitAdd() {
  if (!addFormRef.value) return;
  await addFormRef.value.validate(async (valid) => {
    if (!valid) return;
    addSubmitting.value = true;
    try {
      const body: PigGrowthBody = {
        pigId: addForm.pigId,
        measureDate: addForm.measureDate,
        weight: Number(addForm.weight),
        backfatThickness: addForm.backfatThickness != null ? Number(addForm.backfatThickness) : undefined,
        backHeight: addForm.backHeight != null ? Number(addForm.backHeight) : undefined,
        remark: addForm.remark || undefined
      };
      await addGrowth(body);
      ElMessage.success(t('breedEvent.growth.msg.added'));
      addVisible.value = false;
      load();
    } finally {
      addSubmitting.value = false;
    }
  });
}

async function handleDelete(row: BizRow) {
  try {
    await ElMessageBox.confirm(
      t('breedEvent.growth.msg.delConfirm', { earNo: row.earNo, date: row.measureDate }),
      t('breedEvent.growth.msg.delConfirmTitle'),
      {
        type: 'warning'
      }
    );
    await delGrowth([row.id]);
    ElMessage.success(t('breedEvent.growth.msg.delSuccess'));
    load();
  } catch (e) {
    // 取消 / 业务异常（如超期）由 axios 拦截器统一提示；用户主动取消时静默
    if (e !== 'cancel') {
      // 非取消的异常已由请求拦截器弹出，这里不重复处理
    }
  }
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.muted {
  color: #aaa;
}
.form-hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
