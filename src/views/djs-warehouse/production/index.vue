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
      :dict-types="['djs_belong_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="rowKey"
      perm-prefix="djs:warehouse:production"
      :show-export="false"
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <!-- 行操作：查看 → 下钻产品列表（逐件）。admin 不暴露写入入口（写入走 mp 4 业态打包子页） -->
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:production:list']" link type="primary" icon="View" @click="handleView(row)">
          {{ t('common.view') }}
        </el-button>
      </template>
    </BizTable>

    <ProductionItemDialog ref="itemDialogRef" />
  </div>
</template>

<script setup name="ProductProduction" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import ProductionItemDialog from './components/ProductionItemDialog.vue';
import { listProduction } from '@/api/djs-warehouse/production';
import type { ProductProductionGroupVO, ProductProductionQuery } from '@/api/djs-warehouse/production/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const itemDialogRef = ref<{ open: (row: ProductProductionGroupVO) => void }>();

const list = ref<ProductProductionGroupVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  produceNo: undefined,
  belongType: undefined,
  produceDateFrom: undefined,
  produceDateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'produceNo', label: '生产编号', type: 'input' },
  { field: 'belongType', label: '产品品类', type: 'select', dictType: 'djs_belong_type' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'produceDate', label: '生产日期', minWidth: 120 },
  { prop: 'productName', label: '产品名称', minWidth: 180 },
  { prop: 'belongType', label: '产品品类', minWidth: 110, dictType: 'djs_belong_type' },
  {
    prop: 'produceQty',
    label: '生产量',
    minWidth: 100,
    align: 'center',
    // 生产量取整展示（后端 SUM 保留小数不丢精度，前端 Math.round 取整）
    formatter: (row: BizRow) => {
      const r = row as ProductProductionGroupVO;
      if (r.produceQty === undefined || r.produceQty === null) return '-';
      return String(Math.round(Number(r.produceQty)));
    }
  },
  { prop: 'itemCount', label: '件数', minWidth: 90, align: 'center' }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: ProductProductionQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listProduction(params);
    const rows: ProductProductionGroupVO[] = (res as any).rows ?? [];
    // 聚合行无唯一 id，用 产品+日期 复合键作 row-key（前端展示用）
    list.value = rows.map((r) => ({ ...r, rowKey: `${r.productId}_${r.produceDate}` }));
    total.value = (res as any).total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => {
    searchModel[k] = undefined;
  });
  handleSearch();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

/** 查看 → 下钻该生产批次（生产日期 + 产品）的逐件产品列表 */
function handleView(row: BizRow) {
  itemDialogRef.value?.open(row as ProductProductionGroupVO);
}

onMounted(() => {
  loadList();
});
</script>
