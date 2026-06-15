<template>
  <div class="p-2">
    <BizTable
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_barn_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:breed:barn"
      :show-row-edit="false"
      :show-row-del="false"
      :show-batch-del="false"
      :action-width="220"
      @search="onSearch"
      @reset="onReset"
      @add="onAdd"
      @page-change="onPageChange"
    >
      <template #action="{ row }">
        <el-button link type="primary" @click="onPenDetail(row)">{{ t('farm.proto.penDetail') }}</el-button>
        <el-button v-hasPermi="['djs:breed:barn:edit']" link type="primary" @click="onEdit(row)">{{ t('common.edit') }}</el-button>
        <el-button v-hasPermi="['djs:breed:barn:remove']" link type="danger" @click="onDel(row)">{{ t('common.delete') }}</el-button>
      </template>
    </BizTable>

    <BarnForm ref="barnFormRef" @success="fetchList" />
  </div>
</template>

<script setup name="FarmBarnList" lang="ts">
import { useRouter } from 'vue-router';
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import BarnForm from './components/BarnForm.vue';
import { delBarn, listBarn } from '@/api/djs-breed/farm';
import type { BarnVO } from '@/api/djs-breed/farm/types';
import { useI18n } from 'vue-i18n';

/**
 * 农场栋舍管理（对齐原型）：整页栋舍列表 + 新建栋舍弹窗 + 行操作「栏位详情 / 修改 / 删除」。
 * 栏位详情进独立子页 /djs-breed/farm/pen-detail/:barnId（menu 7023 隐藏路由）。
 */
const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();

const barnFormRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<BarnVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  barnName: undefined,
  barnType: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'barnName', label: t('farm.field.barnName'), type: 'input' },
  { field: 'barnType', label: t('farm.field.barnType'), type: 'select', dictType: 'djs_barn_type' }
]);

// 列顺序对齐原型：名称 / 类型 / 产床数 / 限位栏数 / 大栏数 / 存栏 / 更新时间 / 更新人
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'barnName', label: t('farm.field.barnName'), minWidth: 140 },
  { prop: 'barnType', label: t('farm.field.barnType'), width: 130, align: 'center', dictType: 'djs_barn_type' },
  { prop: 'bedCount', label: t('farm.proto.col.bedCount'), width: 100, align: 'center' },
  { prop: 'limitPenCount', label: t('farm.proto.col.limitPenCount'), width: 110, align: 'center' },
  { prop: 'bigPenCount', label: t('farm.proto.col.bigPenCount'), width: 100, align: 'center' },
  { prop: 'scatterPenCount', label: t('farm.proto.col.scatterPenCount'), width: 100, align: 'center' },
  { prop: 'nurseryPenCount', label: t('farm.proto.col.nurseryPenCount'), width: 100, align: 'center' },
  { prop: 'liveCount', label: t('farm.proto.col.liveCount'), width: 150, align: 'center' },
  { prop: 'updateTime', label: t('farm.proto.col.updateTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'updateByName', label: t('farm.proto.col.updateBy'), width: 110, align: 'center' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const res = await listBarn({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      barnName: searchModel.barnName || undefined,
      barnType: searchModel.barnType || undefined
    });
    list.value = (res.rows ?? res.data ?? []) as BarnVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function onSearch(payload?: Record<string, any>) {
  if (payload) Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}
function onReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  fetchList();
}
function onPageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function onAdd() {
  barnFormRef.value?.openCreate();
}
function onEdit(row: BizRow) {
  barnFormRef.value?.openEdit(row.id);
}
async function onDel(row: BizRow) {
  await proxy?.$modal.confirm(t('farm.confirm.delBarn', { name: row.barnName }));
  await delBarn(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function onPenDetail(row: BizRow) {
  router.push({ path: `/djs-breed/farm/pen-detail/${row.id}` });
}

onMounted(() => {
  fetchList();
});
</script>
