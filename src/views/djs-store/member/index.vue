<template>
  <div class="p-2">
    <!-- 2 个 KPI 卡片：本月会员数 / 本月录入消费记录数（V1 不做 RFM / 营销分析） -->
    <el-row :gutter="12" class="mb-3">
      <el-col :span="12">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">{{ t('storeMember.kpi.monthlyMember') }}</div>
          <div class="kpi-value">{{ stats.monthlyMemberCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">{{ t('storeMember.kpi.monthlyConsumption') }}</div>
          <div class="kpi-value">{{ stats.monthlyConsumptionCount }}</div>
        </el-card>
      </el-col>
    </el-row>

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
      :selectable="false"
      :show-row-edit="false"
      :show-export="true"
      perm-prefix="djs:store:member"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-memberLevel="{ row }">
        <dict-tag :options="djs_member_level" :value="row.memberLevel" />
      </template>
      <template #cell-memberStatus="{ row }">
        <el-tag :type="row.memberStatus === 1 ? 'success' : 'info'">
          {{ row.memberStatus === 1 ? t('storeMember.status.normal') : t('storeMember.status.disabled') }}
        </el-tag>
      </template>
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:store:member:edit']" link type="primary" icon="Edit" @click="handleEdit(row)">
          {{ t('common.edit') }}
        </el-button>
        <el-button v-hasPermi="['djs:store:member:consume:list']" link type="success" icon="List" @click="openConsume(row)">
          {{ t('storeMember.action.consumeRecord') }}
        </el-button>
        <el-button v-hasPermi="['djs:store:member:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">
          {{ t('common.delete') }}
        </el-button>
      </template>
    </BizTable>

    <MemberForm ref="formRef" @success="onSaved" />

    <ConsumeRecordDialog ref="consumeRef" />
  </div>
</template>

<script setup name="StoreMember" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import MemberForm from './components/MemberForm.vue';
import ConsumeRecordDialog from './components/ConsumeRecordDialog.vue';
import { listStoreMember, delStoreMember, getStoreMemberStats } from '@/api/djs-store/member';
import type { StoreMemberVO, StoreMemberQuery, StoreMemberStatsVO } from '@/api/djs-store/member/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_member_level } = toRefs<any>(proxy?.useDict('djs_member_level'));

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (row: StoreMemberVO) => void }>();
const consumeRef = ref<{ open: (row: StoreMemberVO) => void }>();

const list = ref<StoreMemberVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const stats = reactive<StoreMemberStatsVO>({ monthlyMemberCount: 0, monthlyConsumptionCount: 0 });

const searchModel = reactive<Record<string, unknown>>({
  phone: undefined,
  memberName: undefined,
  memberLevel: undefined
});

// 门店筛选已由顶部全局选择器统一控制（列表靠请求头 Current-Store-Id 后端过滤），此处不再放门店筛选项
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'phone', label: t('storeMember.field.phone'), type: 'input' },
  { field: 'memberName', label: t('storeMember.field.memberName'), type: 'input' },
  { field: 'memberLevel', label: t('storeMember.field.memberLevel'), type: 'select', dictType: 'djs_member_level' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'memberNo', label: t('storeMember.column.memberNo'), width: 120, showOverflowTooltip: true },
  { prop: 'memberName', label: t('storeMember.column.memberName'), minWidth: 100, showOverflowTooltip: true },
  { prop: 'phone', label: t('storeMember.column.phone'), width: 130 },
  { prop: 'memberLevel', label: t('storeMember.column.memberLevel'), width: 130, align: 'center' },
  { prop: 'joinDate', label: t('storeMember.column.joinDate'), width: 120, align: 'center' },
  { prop: 'storeName', label: t('storeMember.column.storeName'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'memberTags', label: t('storeMember.column.memberTags'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'memberStatus', label: t('storeMember.column.memberStatus'), width: 90, align: 'center' },
  { prop: 'createTime', label: t('storeMember.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function loadStats() {
  try {
    const res = await getStoreMemberStats();
    const data = res.data ?? { monthlyMemberCount: 0, monthlyConsumptionCount: 0 };
    stats.monthlyMemberCount = data.monthlyMemberCount;
    stats.monthlyConsumptionCount = data.monthlyConsumptionCount;
  } catch (e) {
    console.warn('[StoreMember] loadStats failed', e);
  }
}

async function fetchList() {
  loading.value = true;
  try {
    // storeId 不再显式传：后端按请求头 Current-Store-Id 做行级过滤
    const query: StoreMemberQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      phone: (searchModel.phone as string) || undefined,
      memberName: (searchModel.memberName as string) || undefined,
      memberLevel: (searchModel.memberLevel as string) || undefined
    };
    const res = await listStoreMember(query);
    list.value = (res.rows ?? res.data ?? []) as StoreMemberVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, unknown>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function handleAdd() {
  formRef.value?.openCreate();
}
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(row as unknown as StoreMemberVO);
}
function handleExport(query?: Record<string, unknown>) {
  proxy?.download('djs/store/member/export', { ...(query ?? {}) }, `store_member_${new Date().getTime()}.xlsx`);
}
function openConsume(row: BizRow) {
  consumeRef.value?.open(row as unknown as StoreMemberVO);
}

async function handleDelete(row: BizRow) {
  await proxy?.$modal.confirm(t('storeMember.confirm.delete', { name: row.memberName }));
  await delStoreMember(String(row.id));
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  refresh();
}

function onSaved() {
  refresh();
}

function refresh() {
  fetchList();
  loadStats();
}

onMounted(() => {
  fetchList();
  loadStats();
});
</script>

<style scoped>
.kpi-card {
  text-align: center;
}
.kpi-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.kpi-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-color-primary);
}
</style>
