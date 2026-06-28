<template>
  <div class="p-2">
    <el-card shadow="never">
      <el-form :inline="true" class="mb-2">
        <el-form-item :label="t('warehouseStat.field.monthRange')">
          <el-date-picker v-model="monthFrom" type="month" value-format="YYYY-MM" :placeholder="t('warehouseStat.field.start')" />
          <span class="mx-1">~</span>
          <el-date-picker v-model="monthTo" type="month" value-format="YYYY-MM" :placeholder="t('warehouseStat.field.end')" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">{{ t('warehouseStat.search') }}</el-button>
          <el-button icon="Refresh" @click="handleReset">{{ t('warehouseStat.reset') }}</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="pagedList" border>
        <el-table-column :label="k('statMonth')" prop="statMonth" min-width="120" align="center" />
        <el-table-column :label="k('slaughterCount')" align="center"><template #default="{ row }">{{ num(row.slaughterCount) }}</template></el-table-column>
        <el-table-column :label="k('slaughterRate')" align="center"><template #default="{ row }">{{ num(row.slaughterRate) }}</template></el-table-column>
        <el-table-column :label="k('barYieldRate')" align="center"><template #default="{ row }">{{ num(row.barYieldRate) }}</template></el-table-column>
        <el-table-column :label="k('cutYieldRate')" align="center"><template #default="{ row }">{{ num(row.cutYieldRate) }}</template></el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" :auto-scroll="false" />
    </el-card>
  </div>
</template>

<script setup name="WarehouseStatMonthly" lang="ts">
import { listWarehouseMonthly, type WarehouseMonthlyVO } from '@/api/djs-warehouse/warehouseStat';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const k = (key: string) => t(`warehouseStat.monthly.${key}`);
const num = (v: unknown) => (v === null || v === undefined || v === '' ? '-' : v + '');

const list = ref<WarehouseMonthlyVO[]>([]);
const loading = ref(false);
const monthFrom = ref<string>();
const monthTo = ref<string>();
const pageNum = ref(1);
const pageSize = ref(10);

const total = computed(() => list.value.length);
const pagedList = computed(() => list.value.slice((pageNum.value - 1) * pageSize.value, pageNum.value * pageSize.value));

async function fetchList() {
  loading.value = true;
  try {
    const res = await listWarehouseMonthly({ monthFrom: monthFrom.value || undefined, monthTo: monthTo.value || undefined });
    list.value = (res.data ?? []) as WarehouseMonthlyVO[];
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  monthFrom.value = undefined;
  monthTo.value = undefined;
  pageNum.value = 1;
  fetchList();
}

onMounted(fetchList);
</script>
