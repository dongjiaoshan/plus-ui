<template>
  <!-- 全局门店选择器（STORE-PERM-001）：仅门店域路由显示，仿 Navbar「选择租户」UI。
       单门店时仍渲染（置灰只读由 el-select 单选项天然体现），多门店可切换。 -->
  <el-select
    v-model="currentStoreId"
    class="min-w-180px mr-2"
    filterable
    :placeholder="proxy?.$t('navbar.selectStore')"
    @change="onSwitch"
  >
    <el-option v-for="s in myStores" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
    <template #prefix><el-icon class="input-icon"><Shop /></el-icon></template>
  </el-select>
</template>

<script setup lang="ts">
import { computed, onMounted, getCurrentInstance, type ComponentInternalInstance } from 'vue';
import { Shop } from '@element-plus/icons-vue';
import { useStoreContextStore } from '@/store/modules/storeContext';
import { storeToRefs } from 'pinia';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const storeContext = useStoreContextStore();
const { myStores } = storeToRefs(storeContext);

// 双向绑定到 store：选中变化即写入 pinia + localStorage
const currentStoreId = computed<string>({
  get: () => storeContext.currentStoreId,
  set: (v: string) => storeContext.setStore(v)
});

onMounted(async () => {
  try {
    await storeContext.loadMyStores();
  } catch (e) {
    // 后端未部署 / 无权限时吞错，避免 navbar 渲染失败
    console.warn('[StoreSwitcher] 加载门店列表失败', e);
  }
});

/** 切换门店后关闭并刷新所有标签页，让门店域各页按新门店重拉（仿 Navbar dynamicTenantEvent）。 */
async function onSwitch(): Promise<void> {
  await proxy?.$tab.closeAllPage();
  await proxy?.$tab.refreshPage();
}
</script>

<style scoped lang="scss">
:deep(.el-select .el-input__wrapper) {
  height: 30px;
}
.input-icon {
  color: var(--el-text-color-placeholder);
}
</style>
