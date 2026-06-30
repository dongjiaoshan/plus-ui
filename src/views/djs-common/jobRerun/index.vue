<template>
  <div class="p-2">
    <!-- 重跑操作面板 -->
    <el-card v-hasPermi="['djs:job:rerun:exec']" shadow="never" class="mb-2.5">
      <template #header>
        <span class="font-medium">{{ t('jobRerun.panel.title') }}</span>
        <span class="ml-2 text-xs text-gray-400">{{ t('jobRerun.panel.tip') }}</span>
      </template>
      <el-form ref="rerunFormRef" :model="rerunForm" :rules="rerunRules" inline label-width="90px">
        <el-form-item :label="t('jobRerun.field.jobName')" prop="jobName">
          <el-select v-model="rerunForm.jobName" :placeholder="t('jobRerun.placeholder.jobName')" clearable style="width: 220px">
            <el-option v-for="job in jobOptions" :key="job" :label="jobLabel(job)" :value="job" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('jobRerun.field.dateRange')">
          <el-date-picker
            v-model="rerunForm.dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            :start-placeholder="t('jobRerun.placeholder.begin')"
            :end-placeholder="t('jobRerun.placeholder.end')"
            range-separator="~"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="rerunLoading" icon="VideoPlay" @click="handleRerun">
            {{ t('jobRerun.action.rerun') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 执行日志列表 -->
    <el-card shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item :label="t('jobRerun.field.jobName')">
          <el-select v-model="queryParams.jobName" :placeholder="t('jobRerun.placeholder.jobName')" clearable style="width: 200px">
            <el-option v-for="job in jobOptions" :key="job" :label="jobLabel(job)" :value="job" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('jobRerun.field.status')">
          <el-select v-model="queryParams.status" :placeholder="t('jobRerun.placeholder.status')" clearable style="width: 150px">
            <el-option :label="t('jobRerun.status.running')" value="running" />
            <el-option :label="t('jobRerun.status.success')" value="success" />
            <el-option :label="t('jobRerun.status.fail')" value="fail" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('jobRerun.field.triggerType')">
          <el-select v-model="queryParams.triggerType" :placeholder="t('jobRerun.placeholder.triggerType')" clearable style="width: 150px">
            <el-option :label="t('jobRerun.trigger.schedule')" value="schedule" />
            <el-option :label="t('jobRerun.trigger.manual')" value="manual" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">{{ t('jobRerun.action.search') }}</el-button>
          <el-button icon="Refresh" @click="resetQuery">{{ t('jobRerun.action.reset') }}</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="logList" border>
        <el-table-column :label="t('jobRerun.column.jobName')" align="center" min-width="140">
          <template #default="{ row }">{{ jobLabel(row.jobName) }}</template>
        </el-table-column>
        <el-table-column :label="t('jobRerun.column.targetDate')" prop="targetDate" align="center" min-width="120">
          <template #default="{ row }">{{ row.targetDate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('jobRerun.column.status')" align="center" min-width="90">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('jobRerun.column.costMs')" align="center" min-width="100">
          <template #default="{ row }">{{ row.costMs == null ? '-' : row.costMs + ' ms' }}</template>
        </el-table-column>
        <el-table-column :label="t('jobRerun.column.triggerType')" align="center" min-width="100">
          <template #default="{ row }">{{ triggerLabel(row.triggerType) }}</template>
        </el-table-column>
        <el-table-column :label="t('jobRerun.column.runTime')" prop="runTime" align="center" min-width="160" />
        <el-table-column :label="t('jobRerun.column.errorMsg')" prop="errorMsg" align="left" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.errorMsg || '-' }}</template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-show="total > 0"
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        class="mt-3 justify-end flex"
        @size-change="getLogList"
        @current-change="getLogList"
      />
    </el-card>
  </div>
</template>

<script setup name="JobRerun" lang="ts">
import { listJobLog, listRerunJobs, runJob } from '@/api/djs-common/jobRerun';
import type { JobLogQuery, JobLogVO, JobRerunForm } from '@/api/djs-common/jobRerun/types';
import { useI18n } from 'vue-i18n';
import type { FormInstance, FormRules } from 'element-plus';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const logList = ref<JobLogVO[]>([]);
const total = ref(0);

const queryParams = reactive<JobLogQuery>({
  pageNum: 1,
  pageSize: 10,
  jobName: undefined,
  status: undefined,
  triggerType: undefined
});

const jobOptions = ref<string[]>([]);

const rerunFormRef = ref<FormInstance>();
const rerunLoading = ref(false);
const rerunForm = reactive<{ jobName?: string; dateRange: string[] }>({
  jobName: undefined,
  dateRange: []
});
const rerunRules = reactive<FormRules>({
  jobName: [{ required: true, message: t('jobRerun.rule.jobName'), trigger: 'change' }]
});

/** job 名 → 中文展示标签（未知 job 原样回显） */
function jobLabel(name: string): string {
  const key = `jobRerun.jobName.${name}`;
  const label = t(key);
  return label === key ? name : label;
}

function statusLabel(status: string): string {
  return t(`jobRerun.status.${status}`) === `jobRerun.status.${status}` ? status : t(`jobRerun.status.${status}`);
}
function statusTag(status: string): 'success' | 'danger' | 'info' {
  if (status === 'success') return 'success';
  if (status === 'fail') return 'danger';
  return 'info';
}
function triggerLabel(trigger: string): string {
  return t(`jobRerun.trigger.${trigger}`) === `jobRerun.trigger.${trigger}` ? trigger : t(`jobRerun.trigger.${trigger}`);
}

async function getJobOptions() {
  const res = await listRerunJobs();
  jobOptions.value = res.data ?? [];
}

async function getLogList() {
  loading.value = true;
  try {
    const res = await listJobLog(queryParams);
    logList.value = (res.rows ?? []) as JobLogVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  queryParams.pageNum = 1;
  getLogList();
}

function resetQuery() {
  queryParams.jobName = undefined;
  queryParams.status = undefined;
  queryParams.triggerType = undefined;
  handleQuery();
}

async function handleRerun() {
  await rerunFormRef.value?.validate();
  const payload: JobRerunForm = { jobName: rerunForm.jobName as string };
  if (rerunForm.dateRange && rerunForm.dateRange.length === 2) {
    payload.begin = rerunForm.dateRange[0];
    payload.end = rerunForm.dateRange[1];
  }
  await proxy?.$modal.confirm(t('jobRerun.confirm.rerun', { job: jobLabel(payload.jobName) }));
  rerunLoading.value = true;
  try {
    await runJob(payload);
    proxy?.$modal.msgSuccess(t('jobRerun.message.rerunSuccess'));
    getLogList();
  } finally {
    rerunLoading.value = false;
  }
}

onMounted(() => {
  getJobOptions();
  getLogList();
});
</script>
