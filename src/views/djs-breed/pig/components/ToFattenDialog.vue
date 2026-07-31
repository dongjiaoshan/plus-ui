<template>
  <!-- admin row162：后备种母猪「转为育肥猪」录入弹框（CLAUDE.md §6-13：录入一律弹框，点蒙层可关） -->
  <el-dialog v-model="visible" :title="t('pig.toFatten.title')" width="520px" append-to-body @closed="onClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item :label="t('pig.column.earNo')">
        <span class="ear-no">{{ pigRow?.earNo }}</span>
      </el-form-item>
      <el-form-item :label="t('pig.toFatten.transferDate')" prop="transferDate">
        <el-date-picker
          v-model="form.transferDate"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="t('pig.toFatten.transferDatePlaceholder')"
          class="w-full"
        />
      </el-form-item>
      <el-form-item :label="t('pig.toFatten.operator')" prop="operator">
        <el-select
          v-model="form.operator"
          filterable
          clearable
          :loading="employeeLoading"
          :placeholder="t('pig.toFatten.operatorPlaceholder')"
          class="w-full"
        >
          <el-option v-for="e in employees" :key="e.userId" :label="e.nickName || e.userName || e.userId" :value="e.userId" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('pig.toFatten.newBarn')" prop="newBarnId">
        <el-select
          v-model="form.newBarnId"
          filterable
          :loading="barnLoading"
          :placeholder="t('pig.toFatten.newBarnPlaceholder')"
          class="w-full"
          @change="onBarnChange"
        >
          <el-option v-for="b in barns" :key="String(b.id)" :label="b.barnName" :value="b.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('pig.toFatten.newPen')" prop="newPenId">
        <el-select
          v-model="form.newPenId"
          filterable
          clearable
          :loading="penLoading"
          :placeholder="t('pig.toFatten.newPenPlaceholder')"
          class="w-full"
        >
          <el-option v-for="p in pens" :key="String(p.id)" :label="p.penName" :value="p.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="ToFattenDialog" lang="ts">
/**
 * 后备种母猪「转为育肥猪」（admin row162）。
 *
 * 录入：转移日期（默认当日）/ 转移负责人（养殖部人员下拉）/ 转移栋舍 + 栏位（默认猪只当前位置）。
 * 确认后后端把状态 后备(HB) → 育肥(YF)、类型 种母猪 → 育肥猪，并写事件台账。
 */
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { listBarn, listPen } from '@/api/djs-breed/farm';
import type { BarnVO, PenVO } from '@/api/djs-breed/farm/types';
import { listEmployee, toFatten, type EmployeeItem } from '@/api/djs-breed/event/transfer';
import type { PigVO } from '@/api/djs-breed/pig/types';

/** 养殖部部门 id（sys_dept 200 东角山-养殖部）——转移负责人只列本部门人员。 */
const BREED_DEPT_ID = 200;

const { t } = useI18n();
const emit = defineEmits<{ (e: 'success'): void }>();

const visible = ref(false);
const submitting = ref(false);
const pigRow = ref<PigVO>();
const formRef = ref<FormInstance>();

const form = reactive<{
  transferDate: string;
  operator: string | undefined;
  newBarnId: number | string | undefined;
  newPenId: number | string | undefined;
}>({
  transferDate: '',
  operator: undefined,
  newBarnId: undefined,
  newPenId: undefined
});

const rules: FormRules = {
  transferDate: [{ required: true, message: t('pig.toFatten.transferDateRequired'), trigger: 'change' }],
  operator: [{ required: true, message: t('pig.toFatten.operatorRequired'), trigger: 'change' }],
  newBarnId: [{ required: true, message: t('pig.toFatten.newBarnRequired'), trigger: 'change' }]
};

const employees = ref<EmployeeItem[]>([]);
const employeeLoading = ref(false);
const barns = ref<BarnVO[]>([]);
const barnLoading = ref(false);
const pens = ref<PenVO[]>([]);
const penLoading = ref(false);

/** yyyy-MM-dd（本地时区，不用 toISOString 以免 UTC 偏移退一天）。 */
function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function loadEmployees() {
  employeeLoading.value = true;
  try {
    const res: any = await listEmployee(BREED_DEPT_ID);
    employees.value = (res.data ?? res.rows ?? []) as EmployeeItem[];
  } finally {
    employeeLoading.value = false;
  }
}

// 栋舍 / 栏位列表接口是分页的（barn 19 条、单栋 pen 可达 128 条），不给 pageSize 只回 10 条 ——
// 猪只当前所在栋舍/栏位常不在前 10 条里，默认值就选不中、下拉显空。取足量一次拉完。
const OPTION_PAGE_SIZE = 500;

async function loadBarns() {
  barnLoading.value = true;
  try {
    const res: any = await listBarn({ pageNum: 1, pageSize: OPTION_PAGE_SIZE } as any);
    barns.value = (res.rows ?? res.data ?? []) as BarnVO[];
  } finally {
    barnLoading.value = false;
  }
}

async function loadPens(barnId?: number | string) {
  if (barnId == null || barnId === '') {
    pens.value = [];
    return;
  }
  penLoading.value = true;
  try {
    const res: any = await listPen({ barnId, pageNum: 1, pageSize: OPTION_PAGE_SIZE } as any);
    pens.value = (res.rows ?? res.data ?? []) as PenVO[];
  } finally {
    penLoading.value = false;
  }
}

/** 换栋舍 → 重拉栏位并清掉已选栏位（旧栏位不属于新栋舍）。 */
async function onBarnChange(barnId: number | string) {
  form.newPenId = undefined;
  await loadPens(barnId);
}

/** 打开弹框：日期默认当日，栋舍/栏位默认猪只当前位置。 */
async function open(row: PigVO) {
  pigRow.value = row;
  form.transferDate = todayYmd();
  form.operator = undefined;
  form.newBarnId = row.barnId ?? undefined;
  form.newPenId = row.penId ?? undefined;
  visible.value = true;
  await Promise.all([loadEmployees(), loadBarns(), loadPens(row.barnId)]);
}

function onClosed() {
  formRef.value?.resetFields();
  pens.value = [];
}

async function handleSubmit() {
  if (!pigRow.value) return;
  await formRef.value?.validate();
  submitting.value = true;
  try {
    await toFatten({
      pigId: pigRow.value.id,
      // 后端字段是 LocalDateTime，日期选择器给的是 yyyy-MM-dd，补 00:00:00 到秒
      transferDate: `${form.transferDate} 00:00:00`,
      newBarnId: form.newBarnId,
      newPenId: form.newPenId,
      operator: form.operator
    });
    ElMessage.success(t('pig.toFatten.success'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>

<style scoped>
.ear-no {
  font-weight: 600;
}
.w-full {
  width: 100%;
}
</style>
