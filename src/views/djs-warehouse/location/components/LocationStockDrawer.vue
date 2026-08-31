<template>
  <!-- V6 row136：库位卡片点开的右侧抽屉，列该库位下逐产品的库存明细 -->
  <el-drawer v-model="visible" :title="drawerTitle" direction="rtl" size="720px" append-to-body>
    <div class="loc-stock">
      <div class="loc-stock__bar">
        <el-input
          v-model="keyword"
          class="loc-stock__search"
          clearable
          :placeholder="t('location.stockDrawer.searchPlaceholder')"
          :prefix-icon="Search"
          @input="onKeywordInput"
          @clear="loadList"
        />
        <el-button type="warning" plain :icon="Download" :disabled="!locationId" @click="handleExport">
          {{ t('location.stockDrawer.export') }}
        </el-button>
      </div>

      <el-table v-loading="loading" :data="rows" height="100%" border>
        <el-table-column :label="t('location.stockDrawer.column.productName')" prop="productName" min-width="150" show-overflow-tooltip />
        <el-table-column :label="t('location.stockDrawer.column.productSpec')" prop="productSpec" min-width="110" show-overflow-tooltip />
        <el-table-column :label="t('location.stockDrawer.column.productStock')" prop="productStock" align="right" min-width="110">
          <template #default="{ row }">{{ formatQty(row.productStock) }}</template>
        </el-table-column>
        <el-table-column :label="t('location.stockDrawer.column.productUnit')" prop="productUnit" align="center" width="80" />
        <el-table-column :label="t('location.stockDrawer.column.todayInQty')" prop="todayInQty" align="right" min-width="110">
          <template #default="{ row }">
            <span class="text-success">+{{ formatQty(row.todayInQty) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('location.stockDrawer.column.todayOutQty')" prop="todayOutQty" align="right" min-width="110">
          <template #default="{ row }">
            <span class="text-danger">-{{ formatQty(row.todayOutQty) }}</span>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="t('location.stockDrawer.empty')" />
        </template>
      </el-table>
    </div>
  </el-drawer>
</template>

<script setup name="LocationStockDrawer" lang="ts">
import { Download, Search } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { getLocationProductStock } from '@/api/djs-warehouse/location';
import type { LocationProductStockVO } from '@/api/djs-warehouse/location/types';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const loading = ref(false);
const rows = ref<LocationProductStockVO[]>([]);
const keyword = ref('');
const locationId = ref<number | string>('');
const locationName = ref('');

const drawerTitle = computed(() => t('location.stockDrawer.title', { name: locationName.value }));

/** 搜索防抖 timer：甲方要的是「输入即搜」，逐字打接口顶不住 */
let searchTimer: ReturnType<typeof setTimeout> | undefined;

/** 库存 / 出入库量格式化（后端 BigDecimal 序列化可能是 string） */
function formatQty(v: number | string | undefined): string {
  if (v === undefined || v === null || v === '') return '0';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : String(n);
}

async function loadList() {
  if (!locationId.value) return;
  loading.value = true;
  try {
    const res = await getLocationProductStock(locationId.value, keyword.value || undefined);
    rows.value = (res.data ?? []) as LocationProductStockVO[];
  } finally {
    loading.value = false;
  }
}

function onKeywordInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(loadList, 300);
}

/** 导出走后端同源端点，筛选条件与当前列表一致 */
function handleExport() {
  proxy?.download(
    'djs/warehouse/location/productStock/export',
    { locationId: locationId.value, productName: keyword.value || undefined },
    `${locationName.value || 'location'}_stock_${new Date().getTime()}.xlsx`
  );
}

/** 由卡片网格调用：传库位 id + 名称打开抽屉 */
function open(id: number | string, name: string) {
  locationId.value = id;
  locationName.value = name;
  keyword.value = '';
  rows.value = [];
  visible.value = true;
  loadList();
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
});

defineExpose({ open });
</script>

<style scoped lang="scss">
.loc-stock {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;

  &__bar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  &__search {
    flex: 1;
  }

  :deep(.el-table) {
    flex: 1 1 auto;
  }
}
</style>
