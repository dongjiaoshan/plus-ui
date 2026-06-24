import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { ref } from 'vue';
import { listMyStores, type StoreOptionVO } from '@/api/djs-common/store';

/**
 * 门店上下文（STORE-PERM-001）。
 *
 * 门店域行级数据权限的前端载体：
 * - currentStoreId：当前选中门店 id（localStorage 持久，切页不重选）。
 * - myStores：当前登录人有权限的门店列表（绑定关系驱动）。
 * - 请求拦截器读取 currentStoreId 注入请求头 Current-Store-Id，后端按门店过滤。
 *
 * 退出登录时 reset() 清空（user store logout 调用）。
 */
export const useStoreContextStore = defineStore('storeContext', () => {
  const currentStoreId = useStorage<string>('djs-current-store-id', '');
  const myStores = ref<StoreOptionVO[]>([]);

  /**
   * 加载当前登录人有权限的门店列表。
   * 若当前选中门店已不在新列表中（失效 / 解绑），默认选第一个；列表为空则清空选中。
   */
  const loadMyStores = async (): Promise<void> => {
    const res = await listMyStores();
    myStores.value = res.data ?? [];
    const exists = myStores.value.some((s) => String(s.id) === currentStoreId.value);
    if (!exists) {
      currentStoreId.value = myStores.value.length > 0 ? String(myStores.value[0].id) : '';
    }
  };

  /** 切换当前门店。 */
  const setStore = (id: string): void => {
    currentStoreId.value = id;
  };

  /** 退出登录清空（避免下一个账号沿用上一个账号的门店上下文）。 */
  const reset = (): void => {
    currentStoreId.value = '';
    myStores.value = [];
  };

  return {
    currentStoreId,
    myStores,
    loadMyStores,
    setStore,
    reset
  };
});
