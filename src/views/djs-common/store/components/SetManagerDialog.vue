<template>
  <el-dialog v-model="visible" :title="t('store.title.setManager')" destroy-on-close append-to-body width="640px">
    <el-form label-width="100px">
      <el-form-item :label="t('store.field.manager')">
        <el-select
          v-model="selectedUserId"
          filterable
          remote
          clearable
          reserve-keyword
          :placeholder="t('store.placeholder.searchUser')"
          :remote-method="searchUsers"
          :loading="searching"
          style="width: 100%"
        >
          <el-option
            v-for="u in userOptions"
            :key="u.userId"
            :label="`${u.nickName || u.userName}${u.phonenumber ? ' / ' + u.phonenumber : ''}`"
            :value="u.userId as number"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { setStoreManager } from '@/api/djs-common/store';
import { listUser } from '@/api/system/user';
import type { UserVO } from '@/api/system/user/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const searching = ref(false);
const targetStoreId = ref<number | string | null>(null);
const selectedUserId = ref<number | null>(null);
const userOptions = ref<UserVO[]>([]);

const open = async (storeId: number | string, currentUserId?: number | null) => {
  targetStoreId.value = storeId;
  selectedUserId.value = currentUserId ?? null;
  userOptions.value = [];
  visible.value = true;
  // 预加载前 10 条用户作为默认选项
  await searchUsers('');
};

defineExpose({ open });

const searchUsers = async (keyword: string) => {
  searching.value = true;
  try {
    const res = await listUser({
      pageNum: 1,
      pageSize: 20,
      nickName: keyword || undefined
    } as any);
    userOptions.value = (res.rows ?? res.data ?? []) as UserVO[];
  } finally {
    searching.value = false;
  }
};

const emit = defineEmits<{ (e: 'success'): void }>();

const submit = async () => {
  if (!targetStoreId.value) return;
  submitting.value = true;
  try {
    await setStoreManager(targetStoreId.value, selectedUserId.value);
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
};
</script>
