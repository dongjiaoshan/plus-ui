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
      :dict-types="['djs_belong_type', 'djs_yes_no']"
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
      <!-- 损坏量：>0 红色（标损件数），=0 灰色 -->
      <template #cell-damageCount="{ row }">
        <span :class="Number(row.damageCount) > 0 ? 'text-red-500 font-bold' : 'text-gray-400'">
          {{ row.damageCount ?? 0 }}
        </span>
      </template>

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

/** 今天 yyyy-MM-dd（生产日期范围默认值：今天~今天） */
function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const searchModel = reactive<Record<string, any>>({
  productName: undefined,
  belongType: undefined,
  // 生产日期范围 [start, end]（daterange，默认今天~今天）；@search 时拆成 produceDateFrom/To
  produceDateRange: [todayStr(), todayStr()],
  // 是否存在损坏（djs_yes_no，默认全部=undefined）
  hasDamage: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productName', label: t('djs.warehouse.production.column.productName'), type: 'input' },
  { field: 'belongType', label: t('djs.warehouse.production.column.belongType'), type: 'select', dictType: 'djs_belong_type' },
  { field: 'produceDateRange', label: t('djs.warehouse.production.column.produceDate'), type: 'daterange' },
  // 是否存在损坏（默认全部）
  { field: 'hasDamage', label: t('djs.warehouse.production.column.hasDamage'), type: 'select', dictType: 'djs_yes_no' }
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
  { prop: 'itemCount', label: t('djs.warehouse.production.column.itemCount'), minWidth: 90, align: 'center' },
  // 损坏量：该组已标损坏件数（damageCount），>0 红色显示（走 cell-damageCount slot 上色）
  { prop: 'damageCount', label: t('djs.warehouse.production.column.damageCount'), minWidth: 100, align: 'center' },
  // 需求门店数：该产品当前有未发货需求的门店家数（后端 ProductProductionGroupVo.storeDemandCount）
  { prop: 'storeDemandCount', label: t('djs.warehouse.production.column.storeDemandCount'), minWidth: 110, align: 'center' }
]);

async function loadList() {
  loading.value = true;
  try {
    // 生产日期范围 daterange [start, end] 拆成 produceDateFrom/To 传后端（README §daterange 约定）
    const range = Array.isArray(searchModel.produceDateRange) ? searchModel.produceDateRange : [];
    const params: ProductProductionQuery = {
      productName: searchModel.productName || undefined,
      belongType: searchModel.belongType || undefined,
      produceDateFrom: range[0] || undefined,
      produceDateTo: range[1] || undefined,
      hasDamage:
        searchModel.hasDamage === undefined || searchModel.hasDamage === null || searchModel.hasDamage === ''
          ? undefined
          : Number(searchModel.hasDamage),
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
  searchModel.productName = undefined;
  searchModel.belongType = undefined;
  searchModel.hasDamage = undefined;
  // 生产日期范围重置回默认今天~今天（非清空）
  searchModel.produceDateRange = [todayStr(), todayStr()];
  pageNum.value = 1;
  loadList();
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
