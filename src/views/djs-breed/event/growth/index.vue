<template>
  <div class="p-2">
    <el-alert type="info" :closable="false" class="mb-2">
      <template #title>
        生长记录：mp 端饲养员录 <strong>体重</strong>；admin 端可补录 <strong>背膘</strong> / <strong>背高</strong>（专业设备）。删除窗口：录入后 3
        天内可删，超期不可删。
      </template>
    </el-alert>

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
        <el-button v-hasPermi="['djs:breed:event:growth:remove']" type="danger" link size="small" @click="handleDelete(row)"> 删除 </el-button>
      </template>
    </BizTable>

    <el-dialog v-model="addVisible" title="新增生长记录（admin 端可录背膘 / 背高）" width="540px">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="120px">
        <el-form-item label="猪只 ID" prop="pigId">
          <el-input v-model="addForm.pigId" placeholder="t_farm_pig_info.id（数字）" />
        </el-form-item>
        <el-form-item label="测量日期" prop="measureDate">
          <el-date-picker v-model="addForm.measureDate" type="date" value-format="YYYY-MM-DD" placeholder="选择测量日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="体重 (kg)" prop="weight">
          <el-input-number v-model="addForm.weight" :min="0.01" :max="999.99" :precision="2" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="背膘厚 (mm)">
          <el-input-number v-model="addForm.backfatThickness" :min="0" :max="999.99" :precision="2" :step="0.5" style="width: 100%" />
          <span class="form-hint">可选，admin 端专业设备测得</span>
        </el-form-item>
        <el-form-item label="背高 (cm)">
          <el-input-number v-model="addForm.backHeight" :min="0" :max="999.99" :precision="2" :step="1" style="width: 100%" />
          <span class="form-hint">可选</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="addForm.remark" type="textarea" :rows="2" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="addSubmitting" @click="submitAdd">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DjsBreedEventGrowth" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { addGrowth, delGrowth, listGrowth } from '@/api/djs-breed/event/growth';
import type { PigGrowthBody, PigGrowthQuery, PigGrowthVO } from '@/api/djs-breed/event/growth';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';

const tableRef = ref<BizTableExpose>();
const list = ref<PigGrowthVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<PigGrowthQuery>({
  pigId: undefined,
  earNo: undefined,
  beginDate: undefined,
  endDate: undefined
});

const searchSchema: SearchFieldSchema[] = [
  { field: 'earNo', label: '耳号', type: 'input', placeholder: '如 260520-001', clearable: true },
  { field: 'pigId', label: '猪只 ID', type: 'input', placeholder: 'pig_info.id', clearable: true },
  { field: 'beginDate', label: '起始日期', type: 'date', clearable: true },
  { field: 'endDate', label: '结束日期', type: 'date', clearable: true }
];

const columns: BizTableColumn[] = [
  { prop: 'id', label: 'ID', width: 90, fixed: 'left' },
  { prop: 'earNo', label: '耳号', minWidth: 140, fixed: 'left' },
  { prop: 'measureDate', label: '测量日期', width: 120, align: 'center', formatter: 'date' },
  { prop: 'weight', label: '体重', width: 110, align: 'right' },
  { prop: 'backfatThickness', label: '背膘', width: 100, align: 'right' },
  { prop: 'backHeight', label: '背高', width: 100, align: 'right' },
  { prop: 'barnName', label: '栋舍', width: 100, align: 'center' },
  { prop: 'penName', label: '栏位', width: 100, align: 'center' },
  { prop: 'remark', label: '备注', minWidth: 160 },
  { prop: 'createTime', label: '录入时间', width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'action', label: '操作', width: 90, align: 'center', fixed: 'right' }
];

const addVisible = ref(false);
const addSubmitting = ref(false);
const addFormRef = ref<FormInstance>();
const addForm = reactive<{
  pigId: string;
  measureDate: string;
  weight: number | undefined;
  backfatThickness: number | undefined;
  backHeight: number | undefined;
  remark: string;
}>({
  pigId: '',
  measureDate: '',
  weight: undefined,
  backfatThickness: undefined,
  backHeight: undefined,
  remark: ''
});

const addRules: FormRules = {
  pigId: [{ required: true, message: '请输入猪只 ID', trigger: 'blur' }],
  measureDate: [{ required: true, message: '请选择测量日期', trigger: 'change' }],
  weight: [{ required: true, message: '请输入体重 (kg)', trigger: 'blur' }]
};

async function load() {
  loading.value = true;
  try {
    const params: PigGrowthQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res: any = await listGrowth(params);
    list.value = (res.rows ?? []) as PigGrowthVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: PigGrowthQuery) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  load();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => ((searchModel as any)[k] = undefined));
  pageNum.value = 1;
  load();
}

function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  load();
}

function openAdd() {
  addForm.pigId = '';
  addForm.measureDate = new Date().toISOString().slice(0, 10);
  addForm.weight = undefined;
  addForm.backfatThickness = undefined;
  addForm.backHeight = undefined;
  addForm.remark = '';
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
      ElMessage.success('生长记录已录入');
      addVisible.value = false;
      load();
    } finally {
      addSubmitting.value = false;
    }
  });
}

async function handleDelete(row: PigGrowthVO) {
  try {
    await ElMessageBox.confirm(`确定删除耳号 [${row.earNo}] 在 ${row.measureDate} 的生长记录？（录入后 3 天内可删，超期会失败）`, '删除确认', {
      type: 'warning'
    });
    await delGrowth([row.id]);
    ElMessage.success('删除成功');
    load();
  } catch (e: any) {
    if (e !== 'cancel' && e?.message) {
      // 业务异常（如超期）由 service 抛，request 拦截器会弹错
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
