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
      :dict-types="['sys_normal_disable', 'djs_zone_belong']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      :show-add="true"
      :show-row-edit="false"
      :show-row-del="false"
      :action-width="200"
      perm-prefix="djs:plant:plot"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:zone:edit']" link type="primary" @click="handleEdit(row)">
          {{ t('plantZone.action.edit') }}
        </el-button>
        <el-button
          v-hasPermi="['djs:plant:zone:edit']"
          link
          :type="row.zoneStatus === 0 ? 'warning' : 'success'"
          @click="handleToggleStatus(row)"
        >
          {{ row.zoneStatus === 0 ? t('plantZone.action.disable') : t('plantZone.action.enable') }}
        </el-button>
        <el-button v-hasPermi="['djs:plant:zone:remove']" link type="danger" @click="handleDel(row)">
          {{ t('plantZone.action.del') }}
        </el-button>
      </template>
      <template #empty>
        <el-empty :description="t('plantZone.empty')" :image-size="80" />
      </template>
    </BizTable>

    <ZoneForm ref="zoneFormRef" @success="fetchList" />
  </div>
</template>

<script setup name="DjsPlantZoneIndex" lang="ts">
/**
 * 片区管理独立列表页（FIX-PLT-AD-ZONE-001）。
 *
 * 8 列：片区名称 / 片区说明 / 所属大区 / 管理地块数量 / 状态 / 更新时间 / 更新人员 / 操作。
 * 3 筛选：片区名称 / 更新时间（daterange）/ 更新人员（input → updateBy 用户 ID）。
 * 行操作（文字链接常显）：修改信息 / 禁用 / 删除（含 has_plot 级联保护）。
 */
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import ZoneForm from '../plot/components/ZoneForm.vue';
import { listZone, delZone, changeZoneStatus } from '@/api/djs-plant/zone';
import type { PlotZoneQuery, PlotZoneVO } from '@/api/djs-plant/zone/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const zoneFormRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<PlotZoneVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  zoneBelong: undefined,
  zoneName: undefined,
  updateTime: undefined,
  updateBy: undefined
});

// 布局顺序：所属大区 → 片区名称 → 更新时间 → 更新人员
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'zoneBelong', label: t('plantZone.filter.zoneBelong'), type: 'select', dictType: 'djs_zone_belong', clearable: true },
  { field: 'zoneName', label: t('plantZone.filter.zoneName'), type: 'input', clearable: true },
  { field: 'updateTime', label: t('plantZone.filter.updateTime'), type: 'daterange' },
  { field: 'updateBy', label: t('plantZone.filter.updateBy'), type: 'input', placeholder: t('plantZone.placeholder.updateBy'), clearable: true }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'zoneName', label: t('plantZone.column.zoneName'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'zoneDesc', label: t('plantZone.column.zoneDesc'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'zoneBelong', label: t('plantZone.column.zoneBelong'), width: 120, align: 'center', dictType: 'djs_zone_belong', showOverflowTooltip: true },
  { prop: 'plotCount', label: t('plantZone.column.plotCount'), width: 120, align: 'center' },
  { prop: 'zoneStatus', label: t('plantZone.column.zoneStatus'), width: 90, align: 'center', dictType: 'sys_normal_disable' },
  { prop: 'updateTime', label: t('plantZone.column.updateTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'updateByName', label: t('plantZone.column.updateByName'), width: 110, align: 'center' }
]);

function buildQuery(): PlotZoneQuery {
  const range = searchModel.updateTime;
  const updateByRaw = searchModel.updateBy;
  const updateBy = updateByRaw === undefined || updateByRaw === '' ? undefined : Number(updateByRaw);
  return {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    zoneBelong: searchModel.zoneBelong || undefined,
    zoneName: searchModel.zoneName || undefined,
    updateBy: Number.isFinite(updateBy) ? (updateBy as number) : undefined,
    updateTimeStart: Array.isArray(range) && range[0] ? range[0] : undefined,
    updateTimeEnd: Array.isArray(range) && range[1] ? range[1] : undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listZone(buildQuery());
    list.value = (res.rows ?? res.data ?? []) as PlotZoneVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel, payload);
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
  zoneFormRef.value?.openCreate();
}
function handleEdit(row: BizRow) {
  zoneFormRef.value?.openEdit(row.id);
}
// 单行(#action slot 传 row) + 批量(BizTable @del 传选中行数组) 共用
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  try {
    await proxy?.$modal.confirm(t('plantZone.confirm.del', { count: ids.length }));
    await delZone(ids);
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    fetchList();
  } catch (err: any) {
    // 取消 / 后端 plant.zone.has_plot 级联保护由 axios 拦截器统一弹窗
  }
}
/** 行内启停：sys_normal_disable 0=正常 / 1=停用，toggle 当前值。 */
async function handleToggleStatus(row: BizRow) {
  const next = row.zoneStatus === 0 ? 1 : 0;
  await changeZoneStatus(row.id, next);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}

function handleExport() {
  const range = searchModel.updateTime;
  const updateByRaw = searchModel.updateBy;
  const updateBy = updateByRaw === undefined || updateByRaw === '' ? undefined : Number(updateByRaw);
  proxy?.download(
    'djs/plant/zone/export',
    {
      zoneBelong: searchModel.zoneBelong || undefined,
      zoneName: searchModel.zoneName || undefined,
      updateBy: Number.isFinite(updateBy) ? (updateBy as number) : undefined,
      updateTimeStart: Array.isArray(range) && range[0] ? range[0] : undefined,
      updateTimeEnd: Array.isArray(range) && range[1] ? range[1] : undefined
    },
    `zone_${new Date().getTime()}.xlsx`
  );
}

onMounted(fetchList);
</script>
