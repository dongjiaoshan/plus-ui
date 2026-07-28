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
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @export="handleExport"
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
import { lastMonthRange } from '@/utils/ruoyi';
import { isKgUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const itemDialogRef = ref<{ open: (row: ProductProductionGroupVO) => void }>();

const list = ref<ProductProductionGroupVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  productName: undefined,
  // 产品品类多选（R70，djs_belong_type 10 项 > 2 → 多选）
  belongType: [],
  // 生产日期范围 [start, end]（daterange，默认近一月）；@search 时拆成 produceDateFrom/To
  produceDateRange: lastMonthRange(),
  // 是否存在损坏（djs_yes_no 二元，保持单选；默认全部=undefined）
  hasDamage: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productName', label: t('djs.warehouse.production.column.productName'), type: 'input' },
  { field: 'belongType', label: t('djs.warehouse.production.column.belongType'), type: 'select', multiple: true, dictType: 'djs_belong_type' },
  { field: 'produceDateRange', label: t('djs.warehouse.production.column.produceDate'), type: 'daterange' },
  // 是否存在损坏（默认全部）
  { field: 'hasDamage', label: t('djs.warehouse.production.column.hasDamage'), type: 'select', dictType: 'djs_yes_no' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'produceDate', label: '生产日期', minWidth: 120 },
  {
    prop: 'fulfillmentRate',
    label: '需求满足率',
    minWidth: 110,
    align: 'center',
    // 满足率 = 生产量 / 需求量 × 100%；需求量为 0 时后端返 null → 展示 -
    formatter: (row: BizRow) => {
      const v = (row as ProductProductionGroupVO).fulfillmentRate;
      if (v === null || v === undefined) return '-';
      const n = Number(v);
      return Number.isFinite(n) ? `${n.toFixed(2)}%` : '-';
    }
  },
  { prop: 'productName', label: '产品名称', minWidth: 180 },
  { prop: 'belongType', label: t('djs.warehouse.production.column.belongType'), minWidth: 110, dictType: 'djs_belong_type' },
  {
    prop: 'demandQty',
    label: '需求量',
    minWidth: 100,
    align: 'center',
    formatter: (row: BizRow) => {
      const r = row as ProductProductionGroupVO;
      const n = Number(r.demandQty ?? 0);
      return isKgUnit(r.productUnit) ? n.toFixed(3) : String(Math.round(n));
    }
  },
  {
    prop: 'produceQty',
    label: '生产量',
    minWidth: 100,
    align: 'center',
    // 生产量按产品单位分流：kg（含公斤）保留三位小数，其余取整
    formatter: (row: BizRow) => {
      const r = row as ProductProductionGroupVO;
      if (r.produceQty === undefined || r.produceQty === null) return '-';
      const n = Number(r.produceQty);
      return isKgUnit(r.productUnit) ? n.toFixed(3) : String(Math.round(n));
    }
  },
  // 产品单位：组内取任一 product_unit（后端 MAX 兜底）
  {
    prop: 'productUnit',
    label: t('djs.warehouse.production.column.productUnit'),
    minWidth: 90,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionGroupVO).productUnit || '-'
  },
  // 损坏量：该组已标损坏件数（damageCount），>0 红色显示（走 cell-damageCount slot 上色）
  { prop: 'damageCount', label: t('djs.warehouse.production.column.damageCount'), minWidth: 100, align: 'center' },
  // 原材料名称：material_id → product_name（后端聚合回填；row167 损坏量后新增名称列）
  {
    prop: 'materialName',
    label: t('djs.warehouse.production.column.materialName'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionGroupVO).materialName || '-'
  },
  // 原材料消耗量：该组 SUM(material_consume)（无配料则 0/空）
  // 按原材料单位分流：kg（含公斤）保留三位小数，其余（枚/份/袋等）取整——与产品明细子弹框同口径
  {
    prop: 'materialConsume',
    label: t('djs.warehouse.production.column.materialConsumeQty'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => {
      const r = row as ProductProductionGroupVO;
      if (r.materialConsume === undefined || r.materialConsume === null) return '-';
      const n = Number(r.materialConsume);
      return isKgUnit(r.materialUnit) ? n.toFixed(3) : String(Math.round(n));
    }
  },
  // 原材料单位：material_id → product_unit（后端聚合回填）
  {
    prop: 'materialUnit',
    label: t('djs.warehouse.production.column.materialUnit'),
    minWidth: 100,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionGroupVO).materialUnit || '-'
  },
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
      // R70 产品品类多选 → belongTypes 数组（删单值 belongType 发送）
      belongTypes: Array.isArray(searchModel.belongType) && searchModel.belongType.length ? searchModel.belongType : undefined,
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
  // 多选重置成空数组（el-select 多选）
  searchModel.belongType = [];
  searchModel.hasDamage = undefined;
  // 生产日期范围重置回默认近一月（非清空）
  searchModel.produceDateRange = lastMonthRange();
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

/** 导出：按当前搜索条件导出逐件生产记录 Excel（后端 queryList，含产品/原材料单位列）。 */
function handleExport() {
  const range = Array.isArray(searchModel.produceDateRange) ? searchModel.produceDateRange : [];
  proxy?.download(
    'djs/warehouse/production/export',
    {
      productName: searchModel.productName || undefined,
      // R70 产品品类多选 → belongTypes 数组（导出走同一 buildWrapper，删单值 belongType 发送）
      belongTypes: Array.isArray(searchModel.belongType) && searchModel.belongType.length ? searchModel.belongType : undefined,
      produceDateFrom: range[0] || undefined,
      produceDateTo: range[1] || undefined,
      hasDamage:
        searchModel.hasDamage === undefined || searchModel.hasDamage === null || searchModel.hasDamage === ''
          ? undefined
          : Number(searchModel.hasDamage)
    },
    `产品生产_${Date.now()}.xlsx`
  );
}

/** 查看 → 下钻该生产批次（生产日期 + 产品）的逐件产品列表 */
function handleView(row: BizRow) {
  itemDialogRef.value?.open(row as ProductProductionGroupVO);
}

onMounted(() => {
  loadList();
});
</script>
