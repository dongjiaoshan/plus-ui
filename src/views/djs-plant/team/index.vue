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
      :dict-types="dictTypes"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:plant:team"
      :show-add="true"
      :show-batch-del="false"
      :show-export="false"
      @search="handleSearch"
      @reset="handleReset"
      @add="onAdd"
      @page-change="handlePageChange"
    >
      <template #cell-teamStatus="{ row }">
        <dict-tag :options="commonStatusDict" :value="String(row.teamStatus)" />
      </template>
      <template #cell-leaderName="{ row }">
        <span v-if="row.leaderName">{{ row.leaderName }}</span>
        <span v-else class="muted">{{ t('plantTeam.member.noLeader') }}</span>
      </template>
      <template #cell-memberCount="{ row }">
        <el-button type="primary" link size="small" @click="openMembers(row)">
          {{ row.memberCount ?? 0 }}
        </el-button>
      </template>
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:team:member']" type="primary" link size="small" @click="openMembers(row)">
          {{ t('plantTeam.title.member', { teamName: '' }).replace(' - ', '') || t('common.detail') }}
        </el-button>
        <el-button v-hasPermi="['djs:plant:team:edit']" type="primary" link size="small" @click="onEdit(row)">
          {{ t('common.edit') }}
        </el-button>
        <el-button v-hasPermi="['djs:plant:team:remove']" type="danger" link size="small" @click="onDelete(row)">
          {{ t('common.delete') }}
        </el-button>
      </template>
    </BizTable>

    <TeamForm ref="teamFormRef" @success="loadList" />
    <TeamMemberDialog ref="memberDialogRef" @leader-changed="loadList" @member-changed="loadList" />
  </div>
</template>

<script setup name="DjsPlantTeamIndex" lang="ts">
/**
 * 班组管理列表（PLT-MD-002）。
 *
 * 列：班组名称 / 负责人 / 状态 / 成员数（点击 → 成员管理弹窗）/ 备注 / 创建时间
 * 操作：成员管理 / 编辑 / 删除
 */
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { delTeam, listTeam } from '@/api/djs-plant/team';
import type { PlantWorkTeamVO } from '@/api/djs-plant/team/types';
import TeamForm from './components/TeamForm.vue';
import TeamMemberDialog from './components/TeamMemberDialog.vue';
import type { BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const dictTypes = ['djs_common_status'];
const commonStatusDict = computed(() => proxy?.useDict('djs_common_status')?.djs_common_status?.value ?? []);

const list = ref<PlantWorkTeamVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<{ teamName?: string; teamStatus?: number }>({
  teamName: undefined,
  teamStatus: undefined
});

const searchSchema: SearchFieldSchema[] = [
  { field: 'teamName', label: t('plantTeam.column.teamName'), type: 'input', placeholder: t('plantTeam.placeholder.teamName'), clearable: true },
  { field: 'teamStatus', label: t('plantTeam.column.teamStatus'), type: 'select', dictType: 'djs_common_status', clearable: true }
];

const columns: BizTableColumn[] = [
  { prop: 'teamName', label: t('plantTeam.column.teamName'), minWidth: 160, fixed: 'left' },
  { prop: 'leaderName', label: t('plantTeam.column.leader'), width: 140, align: 'center' },
  { prop: 'teamStatus', label: t('plantTeam.column.teamStatus'), width: 100, align: 'center' },
  { prop: 'memberCount', label: t('plantTeam.column.memberCount'), width: 100, align: 'center' },
  { prop: 'remark', label: t('plantTeam.column.remark'), minWidth: 200, showOverflowTooltip: true },
  { prop: 'createTime', label: t('plantTeam.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
];

const teamFormRef = ref<{ openCreate: () => void; openEdit: (row: PlantWorkTeamVO) => void }>();
const memberDialogRef = ref<{ open: (team: PlantWorkTeamVO) => void }>();

async function loadList() {
  loading.value = true;
  try {
    const params = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = (await listTeam(params)) as any;
    list.value = (res.rows ?? []) as PlantWorkTeamVO[];
    total.value = (res.total ?? 0) as number;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  searchModel.teamName = undefined;
  searchModel.teamStatus = undefined;
  pageNum.value = 1;
  loadList();
}

function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  loadList();
}

function onAdd() {
  teamFormRef.value?.openCreate();
}

function onEdit(row: PlantWorkTeamVO) {
  teamFormRef.value?.openEdit(row);
}

async function onDelete(row: PlantWorkTeamVO) {
  try {
    await proxy?.$modal.confirm(t('plantTeam.confirm.del'));
    await delTeam(row.id);
    ElMessage.success(t('common.opSuccess'));
    await loadList();
  } catch (err: unknown) {
    // 取消 / 后端 400（如下有成员）由 axios 拦截器统一弹窗
  }
}

function openMembers(row: PlantWorkTeamVO) {
  memberDialogRef.value?.open(row);
}

onMounted(loadList);
</script>

<style scoped>
.muted {
  color: var(--el-text-color-secondary);
}
</style>
