<template>
  <!-- 已发货需求行「产品明细」：列出该需求下逐件产品 + 标损操作（规则 13：el-dialog 默认点蒙层关闭） -->
  <el-dialog v-model="visible" :title="t('storeDemand.damage.detailTitle')" width="1000px" destroy-on-close append-to-body @closed="onClosed">
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
      :show-add="false"
      :show-batch-del="false"
      :show-export="false"
      :show-row-edit="false"
      :show-row-del="false"
      perm-prefix="djs:store:demand"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button v-if="(row as ProductProductionVO).isDamaged === 1" link type="primary" size="small" @click="onDamage(row)">
          {{ t('storeDemand.damage.editAction') }}
        </el-button>
        <el-button v-else link type="warning" size="small" @click="onDamage(row)">
          {{ t('storeDemand.damage.markAction') }}
        </el-button>
      </template>
    </BizTable>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>

    <!-- 标损 / 修改损坏凭证弹框 -->
    <DamageEvidenceForm ref="damageFormRef" @success="loadList" />
  </el-dialog>
</template>

<script setup name="ProductDetailDialog" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import DamageEvidenceForm from './DamageEvidenceForm.vue';
import { listProductionItems } from '@/api/djs-warehouse/production';
import type { ProductProductionVO, ProductProductionQuery } from '@/api/djs-warehouse/production/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const damageFormRef = ref<InstanceType<typeof DamageEvidenceForm>>();

const visible = ref(false);
const list = ref<ProductProductionVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 当前下钻的需求 id（雪花 string，按 demandId 拉产品明细） */
const demandId = ref<string>('');

// 「是否损坏」搜索条（全部 = undefined / 是 = 1 / 否 = 0），select 走 dict djs_yes_no
const searchModel = reactive<Record<string, unknown>>({ isDamaged: undefined });

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'isDamaged', label: t('storeDemand.damage.isDamaged'), type: 'select', dictType: 'djs_yes_no' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'produceNo', label: t('storeDemand.damage.produceNo'), minWidth: 160, align: 'center', showOverflowTooltip: true },
  {
    prop: 'materialConsume',
    label: t('storeDemand.damage.materialConsume'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => {
      const r = row as ProductProductionVO;
      if (r.materialConsume === undefined || r.materialConsume === null) return '—';
      return r.materialUnit ? `${r.materialConsume}${r.materialUnit}` : String(r.materialConsume);
    }
  },
  {
    prop: 'materialUnit',
    label: t('storeDemand.damage.materialUnit'),
    minWidth: 90,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionVO).materialUnit || '—'
  },
  { prop: 'isDamaged', label: t('storeDemand.damage.isDamaged'), minWidth: 100, align: 'center', dictType: 'djs_yes_no' },
  {
    prop: 'earNo',
    label: t('storeDemand.damage.earNo'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionVO).earNo || '—'
  },
  {
    prop: 'plotName',
    label: t('storeDemand.damage.plotName'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionVO).plotName || '—'
  },
  { prop: 'action', label: t('storeDemand.column.actions'), width: 110, fixed: 'right', align: 'center' }
]);

async function loadList() {
  if (!demandId.value) return;
  loading.value = true;
  try {
    const params: ProductProductionQuery = {
      demandId: demandId.value,
      // 「是否损坏」筛选：undefined=全部；0/1 透传后端 is_damaged 精确过滤
      isDamaged: searchModel.isDamaged === undefined || searchModel.isDamaged === '' ? undefined : Number(searchModel.isDamaged),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listProductionItems(params);
    const payload = res as unknown as { rows?: ProductProductionVO[]; total?: number };
    list.value = payload.rows ?? [];
    total.value = Number(payload.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, unknown>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function onDamage(row: BizRow) {
  damageFormRef.value?.open(row as ProductProductionVO);
}

function onClosed() {
  demandId.value = '';
  list.value = [];
  total.value = 0;
}

/**
 * 打开「产品明细」弹框。
 * @param id 已发货需求 id（雪花 string）
 */
function open(id: string) {
  demandId.value = String(id);
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  pageSize.value = 10;
  list.value = [];
  total.value = 0;
  visible.value = true;
  loadList();
}

defineExpose({ open });
</script>
