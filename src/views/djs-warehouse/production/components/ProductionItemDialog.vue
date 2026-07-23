<template>
  <!-- 产品列表下钻：主列表「查看」→ 展示该生产批次逐件产品（规则1：close-on-click-modal 开） -->
  <el-dialog
    v-model="visible"
    :title="t('djs.warehouse.production.title.itemList')"
    width="1200px"
    destroy-on-close
    append-to-body
    :close-on-click-modal="true"
  >
    <div v-if="batch" class="mb-2 text-sm text-gray-500">
      {{ t('djs.warehouse.production.column.produceDate') }}：{{ batch.produceDate }}
      &nbsp;|&nbsp;
      {{ t('djs.warehouse.production.column.productName') }}：{{ batch.productName }}
      <template v-if="batch.productSpec">&nbsp;|&nbsp;{{ t('djs.warehouse.production.column.productSpec') }}：{{ batch.productSpec }}</template>
    </div>

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
      perm-prefix="djs:warehouse:production"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <!-- 行操作：追溯码（有码 link / 无码占位）+ 损坏行追加「查看损坏」；inline-flex 统一垂直居中，避免占位 span 与 link 按钮基线错位 -->
      <template #action="{ row }">
        <div class="inline-flex items-center gap-2">
          <el-button v-if="row.traceCode" v-hasPermi="['djs:warehouse:production:list']" link type="primary" @click="handleTrace(row)">
            {{ t('djs.warehouse.production.button.traceCode') }}
          </el-button>
          <span v-else class="text-gray-400">{{ t('djs.warehouse.production.text.noTrace') }}</span>
          <el-button v-if="row.isDamaged === 1" v-hasPermi="['djs:warehouse:production:list']" link type="danger" @click="handleViewDamage(row)">
            {{ t('djs.warehouse.production.damage.view') }}
          </el-button>
        </div>
      </template>
    </BizTable>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>

    <!-- 追溯码二维码标签卡（复用门店追溯标签组件，零回归跨目录引用） -->
    <TraceLabelDialog ref="traceLabelRef" />
    <!-- 查看损坏（只读图集 + 备注） -->
    <DamageEvidenceDialog ref="damageDialogRef" />
  </el-dialog>
</template>

<script setup name="ProductionItemDialog" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listProductionItems } from '@/api/djs-warehouse/production';
import type { ProductProductionGroupVO, ProductProductionQuery, ProductProductionVO } from '@/api/djs-warehouse/production/types';
import { formatQtyByUnit, formatWeightByBelong } from '@/utils/weight';
import { useI18n } from 'vue-i18n';
import TraceLabelDialog from '@/views/djs-store/trace/components/TraceLabelDialog.vue';
import { traceTypeFromCode } from '@/views/djs-store/trace/components/traceType';
import DamageEvidenceDialog from './DamageEvidenceDialog.vue';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const traceLabelRef = ref<InstanceType<typeof TraceLabelDialog>>();
const damageDialogRef = ref<InstanceType<typeof DamageEvidenceDialog>>();

const visible = ref(false);
const list = ref<ProductProductionVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 当前下钻的生产批次（生产日期 + 产品），由父列表聚合行传入 */
const batch = ref<ProductProductionGroupVO | null>(null);

const searchModel = reactive<Record<string, any>>({
  storeName: undefined,
  isDamaged: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'storeName', label: t('djs.warehouse.production.column.storeName'), type: 'input' },
  // 是否损坏（djs_yes_no，默认全部）—— 服务端过滤 isDamaged
  { field: 'isDamaged', label: t('djs.warehouse.production.column.isDamaged2'), type: 'select', dictType: 'djs_yes_no' }
]);

/** 当前下钻批次的产品归属类型（djs_belong_type）：果蔬(vegetable) / 肉品(pork) 时展示「产品重量」列 */
const belongType = computed(() => batch.value?.belongType ?? '');
/** 是否展示「产品重量」列：仅果蔬 / 肉品（白条按 kg 口径不加此列） */
const showProductWeight = computed(() => belongType.value === 'vegetable' || belongType.value === 'pork');

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'produceNo', label: t('djs.warehouse.production.column.produceNo'), minWidth: 160 },
  // 果蔬 / 肉品产品：生产单号后追加「产品重量」列，按 g 展示（KG→g，formatWeightByBelong 对 pork/vegetable 走克）
  ...(showProductWeight.value
    ? [
        {
          prop: 'productWeight',
          label: t('djs.warehouse.production.column.productWeight'),
          minWidth: 110,
          align: 'center' as const,
          formatter: (row: BizRow) => formatWeightByBelong((row as ProductProductionVO).productWeight, belongType.value)
        }
      ]
    : []),
  // 原材料名称：material_id → product_name（后端 fillJoinNames 回填；row168 产品重量后新增名称列）
  {
    prop: 'materialName',
    label: t('djs.warehouse.production.column.materialName'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionVO).materialName || '-'
  },
  // 原材料消耗量 + 右侧「原材料单位」列（materialUnit），均后端逐件回填
  {
    prop: 'materialConsume',
    label: t('djs.warehouse.production.column.materialConsume'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => {
      const r = row as ProductProductionVO;
      return formatQtyByUnit(r.materialConsume, r.materialUnit) || '-';
    }
  },
  {
    prop: 'materialUnit',
    label: t('djs.warehouse.production.column.materialUnit'),
    minWidth: 100,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionVO).materialUnit || '-'
  },
  // 是否损坏（djs_yes_no dict-tag）
  { prop: 'isDamaged', label: t('djs.warehouse.production.column.isDamaged2'), minWidth: 100, align: 'center', dictType: 'djs_yes_no' },
  {
    prop: 'earNo',
    label: t('djs.warehouse.production.column.earNo'),
    minWidth: 120,
    formatter: (row: BizRow) => (row as ProductProductionVO).earNo || '-'
  },
  {
    prop: 'plotCode',
    label: t('djs.warehouse.production.column.plotCode'),
    minWidth: 120,
    formatter: (row: BizRow) => {
      const r = row as ProductProductionVO;
      return r.plotCode || '-';
    }
  },
  { prop: 'storeName', label: t('djs.warehouse.production.column.storeName'), minWidth: 140 },
  {
    prop: 'deliverDest',
    label: t('djs.warehouse.production.column.deliverDest'),
    minWidth: 100,
    align: 'center',
    formatter: (row: BizRow) => {
      const d = (row as ProductProductionVO).deliverDest;
      if (d === 'platform') return t('djs.warehouse.production.dest.platform');
      if (d === 'gift') return t('djs.warehouse.production.dest.gift');
      return '-';
    }
  },
  { prop: 'produceTime', label: t('djs.warehouse.production.column.produceTime'), minWidth: 160, formatter: 'datetime' },
  {
    prop: 'isDeliveryCheck',
    label: t('djs.warehouse.production.column.isDeliveryCheck'),
    minWidth: 90,
    align: 'center',
    formatter: (row: BizRow) => ((row as ProductProductionVO).isDeliveryCheck === 1 ? t('common.yes') : t('common.no'))
  },
  {
    prop: 'isArrivalConfirm',
    label: t('djs.warehouse.production.column.isArrivalConfirm'),
    minWidth: 90,
    align: 'center',
    formatter: (row: BizRow) => ((row as ProductProductionVO).isArrivalConfirm === 1 ? t('common.yes') : t('common.no'))
  },
  { prop: 'createByName', label: t('djs.warehouse.production.column.createByName'), minWidth: 100 }
]);

async function loadList() {
  if (!batch.value) return;
  loading.value = true;
  try {
    const params: ProductProductionQuery = {
      productId: batch.value.productId,
      produceDate: batch.value.produceDate,
      // 是否损坏（djs_yes_no，空=全部）：服务端按 is_damaged 过滤
      isDamaged: searchModel.isDamaged === undefined || searchModel.isDamaged === '' ? undefined : Number(searchModel.isDamaged),
      // storeName 是前端搜索字段，后端按 storeId 过滤；本子页未提供 store 选择器，
      // storeName 模糊匹配交由前端在已加载行内本地过滤（不另发请求）。
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listProductionItems(params);
    list.value = (res as any).rows ?? [];
    total.value = (res as any).total ?? 0;
    // 前端按门店名模糊过滤（所属门店为名称展示，无独立 id 选择器时本地过滤）
    const kw = (searchModel.storeName ?? '').toString().trim();
    if (kw) {
      list.value = list.value.filter((r) => (r.storeName ?? '').includes(kw));
    }
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

function handleTrace(row: BizRow) {
  const r = row as ProductProductionVO;
  if (!r.traceCode) return;
  // 弹出二维码追溯标签卡（扫码落地 /trace/{type}/{code}），来源值取耳号优先、否则地块名
  traceLabelRef.value?.open(
    {
      productCode: undefined,
      // 生产序号 = 生产编号业务码（row14 点2：不能为空）
      serialNo: r.produceNo,
      packCode: r.produceNo,
      produceDate: r.produceDate,
      productName: r.productName,
      storeName: r.storeName,
      earNo: r.earNo,
      sourceValue: r.earNo || r.plotName,
      produceCode: r.traceCode,
      traceType: traceTypeFromCode(r.traceCode)
      // 产品重量只读展示本次打包实重，不可修改
    },
    Number(r.productWeight) || undefined
  );
}

/** 查看损坏：弹只读图集 + 备注（损坏行操作列） */
function handleViewDamage(row: BizRow) {
  damageDialogRef.value?.open(row as ProductProductionVO);
}

/** 父列表聚合行「查看」调用：传入当前行作为批次锚点（生产日期 + 产品） */
function open(row: ProductProductionGroupVO) {
  batch.value = row;
  Object.keys(searchModel).forEach((k) => {
    searchModel[k] = undefined;
  });
  pageNum.value = 1;
  pageSize.value = 10;
  list.value = [];
  total.value = 0;
  visible.value = true;
  loadList();
}

defineExpose({ open });
</script>
