<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="1000px" top="6vh" @closed="handleClosed">
    <div class="member-dialog-body">
      <!-- 左侧：当前成员 -->
      <el-card class="member-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">{{ t('plantTeam.member.currentTitle') }}（{{ members.length }}）</span>
          </div>
        </template>
        <el-table v-loading="loadingMembers" :data="members" :empty-text="t('plantTeam.member.emptyMembers')" border stripe height="460" row-key="id">
          <el-table-column :label="t('plantTeam.member.colNickName')" prop="nickName" min-width="120" align="center" header-align="center">
            <template #default="{ row }">
              <span>{{ row.nickName || row.userName || row.userId }}</span>
              <el-tag v-if="row.isLeader === 1" type="warning" size="small" class="leader-tag">{{ t('plantTeam.member.isLeader') }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('plantTeam.member.colPhone')" prop="phonenumber" width="130" align="center" header-align="center" />
          <el-table-column :label="t('plantTeam.member.colAction')" width="200" align="center" header-align="center">
            <template #default="{ row }">
              <el-button v-if="row.isLeader !== 1" v-hasPermi="['djs:plant:team:edit']" type="warning" link size="small" @click="onSetLeader(row)">
                {{ t('plantTeam.member.setLeaderBtn') }}
              </el-button>
              <el-button v-hasPermi="['djs:plant:team:member']" type="danger" link size="small" @click="onRemove(row)">
                {{ t('plantTeam.member.removeBtn') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 右侧：候选员工 -->
      <el-card class="candidate-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">{{ t('plantTeam.member.candidateTitle') }}（{{ candidates.length }}）</span>
            <el-button
              v-hasPermi="['djs:plant:team:member']"
              type="primary"
              size="small"
              :disabled="selected.length === 0"
              :loading="adding"
              @click="onBatchAdd"
            >
              {{ t('plantTeam.member.addBtn') }}（{{ selected.length }}）
            </el-button>
          </div>
        </template>
        <el-table
          v-loading="loadingCandidates"
          :data="candidates"
          :empty-text="t('plantTeam.member.emptyCandidates')"
          border
          stripe
          height="460"
          row-key="userId"
          @selection-change="onSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column :label="t('plantTeam.member.colNickName')" prop="nickName" min-width="120" align="center" header-align="center">
            <template #default="{ row }">
              {{ row.nickName || row.userName || row.userId }}
            </template>
          </el-table-column>
          <el-table-column :label="t('plantTeam.member.colPhone')" prop="phonenumber" width="130" align="center" header-align="center" />
          <el-table-column :label="t('plantTeam.member.colDept')" prop="deptName" width="140" align="center" header-align="center" />
        </el-table>
      </el-card>
    </div>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 班组成员管理弹窗（PLT-MD-002）。
 *
 * 交互：
 *  - 左表展示当前班组的成员（含 isLeader 标记）；点击"设为负责人" / "调出"动作
 *  - 右表展示候选员工（dept_id=种植部 + 未在任何 active 班组），多选 + "加入班组"
 *  - 切换 leader / 加入 / 调出后局部刷新当前 + 候选两个列表
 *
 * 双轨写：leader_id 由 setLeader 端点统一处理（team.leader_id + people.is_leader 一致）
 */
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { addMembers, listCandidateUsers, listMembers, removeMember, setLeader } from '@/api/djs-plant/team';
import type { CandidateUserVO, PlantWorkPeopleVO, PlantWorkTeamVO } from '@/api/djs-plant/team/types';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const currentTeam = ref<PlantWorkTeamVO | null>(null);
const members = ref<PlantWorkPeopleVO[]>([]);
const candidates = ref<CandidateUserVO[]>([]);
const selected = ref<CandidateUserVO[]>([]);
const loadingMembers = ref(false);
const loadingCandidates = ref(false);
const adding = ref(false);

const dialogTitle = computed(() =>
  currentTeam.value ? t('plantTeam.title.member', { teamName: currentTeam.value.teamName }) : t('plantTeam.title.member', { teamName: '' })
);

const emit = defineEmits<{
  (e: 'leader-changed'): void;
  (e: 'member-changed'): void;
}>();

async function loadMembers() {
  if (!currentTeam.value) return;
  loadingMembers.value = true;
  try {
    const res = await listMembers(currentTeam.value.id);
    members.value = (res.data ?? []) as PlantWorkPeopleVO[];
  } finally {
    loadingMembers.value = false;
  }
}

async function loadCandidates() {
  loadingCandidates.value = true;
  try {
    const res = await listCandidateUsers();
    candidates.value = (res.data ?? []) as CandidateUserVO[];
  } finally {
    loadingCandidates.value = false;
  }
}

async function reloadAll() {
  await Promise.all([loadMembers(), loadCandidates()]);
}

function onSelectionChange(rows: CandidateUserVO[]) {
  selected.value = rows;
}

async function onBatchAdd() {
  if (!currentTeam.value || selected.value.length === 0) {
    ElMessage.warning(t('plantTeam.member.noSelection'));
    return;
  }
  adding.value = true;
  try {
    const userIds = selected.value.map((u) => u.userId);
    await addMembers({ teamId: currentTeam.value.id, userIds });
    ElMessage.success(t('plantTeam.tip.addSuccess'));
    selected.value = [];
    await reloadAll();
    emit('member-changed');
  } finally {
    adding.value = false;
  }
}

async function onRemove(row: PlantWorkPeopleVO) {
  if (!currentTeam.value) return;
  try {
    await proxy?.$modal.confirm(t('plantTeam.confirm.removeMember', { nickName: row.nickName || String(row.userId) }));
    await removeMember(currentTeam.value.id, row.userId);
    ElMessage.success(t('plantTeam.tip.removeSuccess'));
    await reloadAll();
    emit('member-changed');
  } catch {
    // cancel
  }
}

async function onSetLeader(row: PlantWorkPeopleVO) {
  if (!currentTeam.value) return;
  await setLeader(currentTeam.value.id, row.userId);
  ElMessage.success(t('plantTeam.tip.setLeaderSuccess'));
  await loadMembers();
  emit('leader-changed');
}

function open(team: PlantWorkTeamVO) {
  currentTeam.value = team;
  visible.value = true;
  reloadAll();
}

function handleClosed() {
  currentTeam.value = null;
  members.value = [];
  candidates.value = [];
  selected.value = [];
}

defineExpose({ open });
</script>

<style scoped>
.member-dialog-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.member-card,
.candidate-card {
  min-height: 520px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
}

.leader-tag {
  margin-left: 8px;
}
</style>
