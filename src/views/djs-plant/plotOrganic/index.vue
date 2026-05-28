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
      :dict-types="['djs_yes_no']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      perm-prefix="djs:plant:plotOrganic"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-organicImagePreview="{ row }">
        <ImagePreview
          v-if="row.organicImagePreview && thumbUrlMap[String(row.organicImagePreview)]"
          :width="40"
          :height="40"
          :src="thumbUrlMap[String(row.organicImagePreview)]"
          :preview-src-list="[thumbUrlMap[String(row.organicImagePreview)]]"
        />
        <span v-else class="text-gray-400">—</span>
      </template>
      <template #cell-relatedPlots="{ row }">
        <template v-if="row.relatedPlots && row.relatedPlots.length > 0">
          <el-tag v-for="p in row.relatedPlots" :key="p.plotId" size="small" class="mr-1 mb-1">
            {{ p.plotName }}
          </el-tag>
        </template>
        <span v-else class="text-gray-400">—</span>
      </template>
      <template #cell-isWarning="{ row }">
        <el-tag v-if="row.isWarning === 1" type="danger">{{ t('plantPlotOrganic.warning.yes') }}</el-tag>
        <el-tag v-else type="success">{{ t('plantPlotOrganic.warning.no') }}</el-tag>
      </template>
      <template #toolbar-extra>
        <el-button v-hasPermi="['djs:plant:plotOrganic:edit']" :icon="Refresh" plain @click="handleScanWarning">
          {{ t('plantPlotOrganic.scan_warning') }}
        </el-button>
      </template>
    </BizTable>

    <PlotOrganicForm ref="formRef" @success="fetchList" />
  </div>
</template>

<script setup name="PlotOrganicIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import PlotOrganicForm from './components/PlotOrganicForm.vue';
import { listPlotOrganic, delPlotOrganic, scanPlotOrganicWarning } from '@/api/djs-plant/plotOrganic';
import type { PlotOrganicQuery, PlotOrganicVO } from '@/api/djs-plant/plotOrganic/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { Refresh } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<PlotOrganicVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const thumbUrlMap = ref<Record<string, string>>({});

const searchModel = reactive<Record<string, any>>({
  organicNo: undefined,
  organicCompany: undefined,
  isWarning: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'organicNo', label: t('plantPlotOrganic.field.organicNo'), type: 'input' },
  { field: 'organicCompany', label: t('plantPlotOrganic.field.organicCompany'), type: 'input' },
  {
    field: 'isWarning',
    label: t('plantPlotOrganic.field.isWarning'),
    type: 'select',
    options: [
      { label: t('plantPlotOrganic.warning.yes'), value: 1 },
      { label: t('plantPlotOrganic.warning.no'), value: 2 }
    ]
  }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'organicNo', label: t('plantPlotOrganic.column.organicNo'), width: 160, showOverflowTooltip: true },
  { prop: 'organicCompany', label: t('plantPlotOrganic.column.organicCompany'), width: 160, showOverflowTooltip: true },
  { prop: 'organicValid', label: t('plantPlotOrganic.column.organicValid'), width: 120, align: 'center' },
  { prop: 'organicImagePreview', label: t('plantPlotOrganic.column.image'), width: 80, align: 'center' },
  { prop: 'relatedPlots', label: t('plantPlotOrganic.column.relatedPlots'), minWidth: 200 },
  { prop: 'isWarning', label: t('plantPlotOrganic.column.warning'), width: 100, align: 'center' },
  { prop: 'createTime', label: t('plantPlotOrganic.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: PlotOrganicQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      organicNo: searchModel.organicNo || undefined,
      organicCompany: searchModel.organicCompany || undefined,
      isWarning: searchModel.isWarning === undefined || searchModel.isWarning === '' ? undefined : Number(searchModel.isWarning)
    };
    const res = await listPlotOrganic(query);
    list.value = (res.rows ?? res.data ?? []) as PlotOrganicVO[];
    total.value = res.total ?? 0;
    await loadThumbUrls();
  } finally {
    loading.value = false;
  }
}

async function loadThumbUrls() {
  const ids = Array.from(new Set(list.value.map((r) => r.organicImagePreview).filter((v): v is string => !!v)));
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
    console.warn('[PlotOrganic] listOssByIds failed', e);
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
  await proxy?.$modal.confirm(t('plantPlotOrganic.confirm.del', { count: ids.length }));
  await delPlotOrganic(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/plant/plotOrganic/export',
    {
      organicNo: searchModel.organicNo || undefined,
      organicCompany: searchModel.organicCompany || undefined,
      isWarning: searchModel.isWarning === undefined || searchModel.isWarning === '' ? undefined : Number(searchModel.isWarning)
    },
    `plot_organic_${new Date().getTime()}.xlsx`
  );
}

async function handleScanWarning() {
  try {
    await proxy?.$modal.confirm(t('plantPlotOrganic.confirm.scan'));
    await scanPlotOrganicWarning();
    proxy?.$modal.msgSuccess(t('plantPlotOrganic.scan_done'));
    fetchList();
  } catch (err: any) {
    if (err && err !== 'cancel') {
      const msg = err?.response?.data?.msg || err?.message;
      if (msg) proxy?.$modal.msgError(msg);
    }
  }
}

onMounted(() => {
  fetchList();
});
</script>
