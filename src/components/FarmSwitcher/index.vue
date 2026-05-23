<template>
  <!-- V1：farmList 永远只有 1 个元素，v-if 自动隐藏 -->
  <el-dropdown v-if="farmList.length > 1" trigger="click" @command="onSwitch">
    <span class="farm-switcher">
      <el-icon class="mr-1"><OfficeBuilding /></el-icon>
      <span>{{ currentFarmName }}</span>
      <el-icon class="ml-1"><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="f in farmList" :key="f.id" :command="f.id" :disabled="f.id === currentFarmId">
          <el-icon v-if="f.id === currentFarmId" class="mr-1"><Select /></el-icon>
          {{ f.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
/**
 * 农场切换器（顶栏组件）。
 *
 * V1（multi-farm disabled）：后端永远返单元素列表 → 组件 v-if 自动隐藏（不渲染任何 DOM）。
 * V2（启用后）：列表 > 1 时显示下拉，用户切农场后调后端 /djs/user/farm/switch，然后整页 reload
 *               让动态路由和缓存按新 tenant 重建。
 *
 * 路由位置：注入 layout/components/Navbar.vue 头部 right-menu 区。
 * API：plus-ui/src/api/djs-common/userFarm.ts
 */
import { ref, onMounted } from 'vue';
import { ArrowDown, OfficeBuilding, Select } from '@element-plus/icons-vue';
import { listAccessibleFarms, switchFarm, FarmVO } from '@/api/djs-common/userFarm';

const farmList = ref<FarmVO[]>([]);
const currentFarmId = ref<string>('');
const currentFarmName = ref<string>('');

onMounted(async () => {
  await loadFarms();
});

async function loadFarms() {
  try {
    const { data } = await listAccessibleFarms();
    farmList.value = data || [];
    const current = farmList.value.find((f) => f.current) || farmList.value[0];
    if (current) {
      currentFarmId.value = current.id;
      currentFarmName.value = current.name;
    }
  } catch (e) {
    // V1 disabled 期间若后端尚未部署，吞掉错误避免 navbar 渲染失败
    console.warn('[FarmSwitcher] 加载农场列表失败', e);
    farmList.value = [];
  }
}

async function onSwitch(farmId: string) {
  if (farmId === currentFarmId.value) return;
  await switchFarm(farmId);
  // V2 切换后整页 reload，让动态路由 + 字典缓存 + Pinia store 都按新农场重建
  window.location.reload();
}
</script>

<style scoped lang="scss">
.farm-switcher {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 0 12px;
  height: 32px;
  border-radius: var(--app-radius-md, 4px);
  font-size: 14px;
  color: var(--el-text-color-regular);

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }
}
</style>
