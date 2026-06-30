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
      :dict-types="['djs_location_type', 'djs_location_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      :action-width="220"
      row-key="id"
      selectable
      show-export
      perm-prefix="djs:warehouse:location"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-locationThumb="{ row }">
        <ImagePreview
          v-if="row.locationThumb && thumbUrlMap[String(row.locationThumb)]"
          :width="40"
          :height="40"
          :src="thumbUrlMap[String(row.locationThumb)]"
          :preview-src-list="[thumbUrlMap[String(row.locationThumb)]]"
        />
        <span v-else class="text-gray-400">—</span>
      </template>

      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:location:edit']" link type="primary" icon="Edit" @click="handleEdit(row)">
          {{ t('common.edit') }}
        </el-button>
        <el-button
          v-hasPermi="['djs:warehouse:location:edit']"
          link
          :type="row.locationStatus === 1 ? 'warning' : 'success'"
          @click="handleToggleStatus(row)"
        >
          {{ row.locationStatus === 1 ? t('common.disable') : t('common.enable') }}
        </el-button>
        <el-button v-hasPermi="['djs:warehouse:location:remove']" link type="danger" icon="Delete" @click="handleDel(row)">
          {{ t('common.del') }}
        </el-button>
      </template>
    </BizTable>

    <LocationForm ref="formRef" @success="handleFormSuccess" />
  </div>
</template>

<script setup name="Location" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import LocationForm from './components/LocationForm.vue';
import { changeLocationStatus, delLocation, listLocation } from '@/api/djs-warehouse/location';
import { listByIds as listOssByIds } from '@/api/system/oss';
import type { LocationInfoQuery, LocationInfoVO } from '@/api/djs-warehouse/location/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<LocationInfoVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
/** ossId(string) → url；列表渲染时按 row.locationThumb 查 */
const thumbUrlMap = ref<Record<string, string>>({});

const searchModel = reactive<Record<string, any>>({
  locationCode: undefined,
  locationName: undefined,
  locationType: [],
  locationStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'locationCode', label: t('location.field.locationCode'), type: 'input' },
  { field: 'locationName', label: t('location.field.locationName'), type: 'input' },
  { field: 'locationType', label: t('location.field.locationType'), type: 'select', dictType: 'djs_location_type', multiple: true },
  { field: 'locationStatus', label: t('location.field.locationStatus'), type: 'select', dictType: 'djs_location_status' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'locationCode', label: t('location.column.locationCode'), width: 140, showOverflowTooltip: true },
  { prop: 'locationThumb', label: t('location.column.locationThumb'), width: 90, align: 'center' },
  { prop: 'locationName', label: t('location.column.locationName'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'locationSort', label: t('location.column.locationSort'), width: 90, align: 'center' },
  { prop: 'locationDesc', label: t('location.column.locationDesc'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'locationType', label: t('location.column.locationType'), width: 110, align: 'center', dictType: 'djs_location_type' },
  { prop: 'locationStatus', label: t('location.column.locationStatus'), width: 90, align: 'center', dictType: 'djs_location_status' },
  { prop: 'createTime', label: t('location.column.createTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'updateTime', label: t('location.column.updateTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'updateByName', label: t('common.updateByName'), width: 100, align: 'center' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: LocationInfoQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      locationCode: searchModel.locationCode || undefined,
      locationName: searchModel.locationName || undefined,
      locationTypes: Array.isArray(searchModel.locationType) && searchModel.locationType.length ? searchModel.locationType : undefined,
      locationStatus: searchModel.locationStatus === undefined || searchModel.locationStatus === '' ? undefined : Number(searchModel.locationStatus)
    };
    const res = await listLocation(query);
    list.value = (res.rows ?? res.data ?? []) as LocationInfoVO[];
    total.value = res.total ?? 0;
    await loadThumbUrls();
  } finally {
    loading.value = false;
  }
}

/**
 * 批量拉本页所有 locationThumb 对应的 OSS url。
 * 后端 `/resource/oss/listByIds/{ids}` 支持逗号分隔，一次拉完避免 N+1。
 */
async function loadThumbUrls() {
  const ids = Array.from(new Set(list.value.map((r) => r.locationThumb).filter((v): v is string => !!v)));
  if (ids.length === 0) {
    thumbUrlMap.value = {};
    return;
  }
  try {
    const res = await listOssByIds(ids.join(','));
    const map: Record<string, string> = {};
    (res.data ?? []).forEach((o: any) => {
      if (o?.ossId != null && o?.url) map[String(o.ossId)] = o.url;
    });
    thumbUrlMap.value = map;
  } catch (e) {
    console.warn('[Location] listOssByIds failed', e);
    thumbUrlMap.value = {};
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
  formRef.value?.openCreate();
}
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(row.id);
}
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('location.confirm.del', { count: ids.length }));
  await delLocation(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
/** 行内启停：djs_location_status 1=启用 / 2=停用，toggle 当前值 */
async function handleToggleStatus(row: BizRow) {
  const next = row.locationStatus === 1 ? 2 : 1;
  await changeLocationStatus(row.id, next);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/warehouse/location/export',
    {
      locationCode: searchModel.locationCode || undefined,
      locationName: searchModel.locationName || undefined,
      locationTypes: Array.isArray(searchModel.locationType) && searchModel.locationType.length ? searchModel.locationType : undefined,
      locationStatus: searchModel.locationStatus === undefined || searchModel.locationStatus === '' ? undefined : Number(searchModel.locationStatus)
    },
    `location_${new Date().getTime()}.xlsx`
  );
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
