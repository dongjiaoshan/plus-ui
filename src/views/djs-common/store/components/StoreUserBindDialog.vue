<template>
  <!-- 门店人员绑定（STORE-PERM-001 row9）：左选系统人员、右当前门店已绑人员。
       点蒙层可关（保留 Element Plus 默认 close-on-click-modal=true）。 -->
  <el-dialog v-model="visible" :title="t('store.bindUser.title')" destroy-on-close append-to-body width="900px" @closed="handleClosed">
    <div class="bind-body">
      <!-- 左：系统人员（按姓名/账号远程搜，多选） -->
      <div class="bind-col">
        <div class="col-title">{{ t('store.bindUser.candidateTitle') }}</div>
        <el-input
          v-model="keyword"
          clearable
          :placeholder="t('store.bindUser.searchPlaceholder')"
          class="mb-2"
          @input="onSearchInput"
          @clear="searchUsers"
        >
          <template #append>
            <el-button icon="Search" @click="searchUsers" />
          </template>
        </el-input>
        <el-table
          ref="candidateTableRef"
          v-loading="searching"
          :data="candidates"
          height="360"
          row-key="userId"
          @selection-change="onSelectionChange"
        >
          <el-table-column type="selection" width="46" :selectable="isSelectable" />
          <el-table-column :label="t('store.bindUser.colNickName')" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.nickName || row.userName }}</template>
          </el-table-column>
          <el-table-column prop="userName" :label="t('store.bindUser.colUserName')" min-width="110" show-overflow-tooltip />
          <el-table-column prop="phonenumber" :label="t('store.bindUser.colPhone')" width="130" align="center">
            <template #default="{ row }">{{ row.phonenumber || '—' }}</template>
          </el-table-column>
        </el-table>
        <div class="col-footer">
          <el-button type="primary" plain :disabled="checkedRows.length === 0" @click="addChecked">
            {{ t('store.bindUser.addSelected') }}<template v-if="checkedRows.length">（{{ checkedRows.length }}）</template>
          </el-button>
        </div>
      </div>

      <!-- 右：当前门店已绑人员（含本次新增待提交） -->
      <div class="bind-col">
        <div class="col-title">{{ t('store.bindUser.boundTitle') }}（{{ bound.length }}）</div>
        <el-table v-loading="loadingBound" :data="bound" height="360" row-key="userId">
          <el-table-column :label="t('store.bindUser.colNickName')" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.nickName || row.userName }}</template>
          </el-table-column>
          <el-table-column prop="userName" :label="t('store.bindUser.colUserName')" min-width="110" show-overflow-tooltip />
          <el-table-column :label="t('common.operate')" width="90" align="center">
            <template #default="{ row }">
              <el-button link type="danger" icon="Delete" @click="removeBound(row.userId)">
                {{ t('store.bindUser.remove') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="col-footer col-footer-hint">{{ t('store.bindUser.boundHint') }}</div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, type ComponentInternalInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { listStoreUsers, bindStoreUsers, type StoreUserVO } from '@/api/djs-common/store';
import { listUser } from '@/api/system/user';
import type { UserVO } from '@/api/system/user/types';
import type { ElTable } from 'element-plus';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const searching = ref(false);
const loadingBound = ref(false);
const targetStoreId = ref<number | string | null>(null);

const keyword = ref('');
const candidates = ref<StoreUserVO[]>([]);
const checkedRows = ref<StoreUserVO[]>([]);
/** 当前门店已绑（含本次新增待提交），用 userId（string 归一）去重。 */
const bound = ref<StoreUserVO[]>([]);
const candidateTableRef = ref<InstanceType<typeof ElTable>>();

let searchTimer: ReturnType<typeof setTimeout> | undefined;

const boundIds = () => new Set(bound.value.map((u) => String(u.userId)));

const open = async (storeId: number | string) => {
  targetStoreId.value = storeId;
  keyword.value = '';
  candidates.value = [];
  checkedRows.value = [];
  bound.value = [];
  visible.value = true;
  await Promise.all([loadBound(storeId), searchUsers()]);
};

defineExpose({ open });

async function loadBound(storeId: number | string) {
  loadingBound.value = true;
  try {
    const res = await listStoreUsers(storeId);
    bound.value = (res.data ?? []).map((u) => ({ ...u, userId: String(u.userId) }));
  } finally {
    loadingBound.value = false;
  }
}

async function searchUsers() {
  searching.value = true;
  try {
    // admin row13：后端 listUser 把 nickName + userName 做 AND 过滤（ruoyi 自带，不改），
    // 同时传两者会把「账号匹配但姓名不匹配」的账号(如账号 wangwei / 姓名 王尉)排除→搜不出。
    // 按关键词类型分流：纯 ASCII（账号）搜 userName、含中文（姓名）搜 nickName，只传一个避免 AND。
    const kw = keyword.value?.trim() || '';
    const byAccount = kw !== '' && /^[\x00-\x7f]+$/.test(kw);
    const res = await listUser({
      pageNum: 1,
      pageSize: 50,
      nickName: kw !== '' && !byAccount ? kw : undefined,
      userName: byAccount ? kw : undefined
    } as Parameters<typeof listUser>[0]);
    const rows = (res.rows ?? res.data ?? []) as UserVO[];
    candidates.value = rows.map((u) => ({
      userId: String(u.userId),
      userName: u.userName,
      nickName: u.nickName,
      phonenumber: u.phonenumber
    }));
  } finally {
    searching.value = false;
  }
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(searchUsers, 300);
}

/** 已绑的人在左表禁勾（避免重复加入）。 */
function isSelectable(row: StoreUserVO): boolean {
  return !boundIds().has(String(row.userId));
}

function onSelectionChange(rows: StoreUserVO[]) {
  checkedRows.value = rows;
}

function addChecked() {
  const ids = boundIds();
  checkedRows.value.forEach((r) => {
    const id = String(r.userId);
    if (!ids.has(id)) {
      bound.value.push({ ...r, userId: id });
      ids.add(id);
    }
  });
  candidateTableRef.value?.clearSelection();
  checkedRows.value = [];
}

function removeBound(userId: number | string) {
  const id = String(userId);
  bound.value = bound.value.filter((u) => String(u.userId) !== id);
}

async function submit() {
  if (targetStoreId.value == null) return;
  submitting.value = true;
  try {
    await bindStoreUsers(
      targetStoreId.value,
      bound.value.map((u) => u.userId)
    );
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
  } finally {
    submitting.value = false;
  }
}

function handleClosed() {
  if (searchTimer) clearTimeout(searchTimer);
  candidates.value = [];
  bound.value = [];
  checkedRows.value = [];
}
</script>

<style scoped lang="scss">
.bind-body {
  display: flex;
  gap: 16px;

  .bind-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .col-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .col-footer {
      margin-top: 8px;
      text-align: right;
    }

    .col-footer-hint {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      text-align: left;
    }
  }
}
</style>
