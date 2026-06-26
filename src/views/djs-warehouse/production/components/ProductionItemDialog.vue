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
      :dict-types="['djs_pack_status', 'djs_yes_no']"
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
      <!-- 追溯码列：有码渲染 link（点击复制提示），无码占位 -->
      <template #action="{ row }">
        <el-button v-if="row.traceCode" v-hasPermi="['djs:warehouse:production:list']" link type="primary" @click="handleTrace(row)">
          {{ t('djs.warehouse.production.button.traceCode') }}
        </el-button>
        <span v-else class="text-gray-400">{{ t('djs.warehouse.production.text.noTrace') }}</span>
      </template>
    </BizTable>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>

    <!-- 追溯码二维码标签卡（复用门店追溯标签组件，零回归跨目录引用） -->
    <TraceLabelDialog ref="traceLabelRef" />
  </el-dialog>
</template>

<script setup name="ProductionItemDialog" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listProductionItems } from '@/api/djs-warehouse/production';
import type { ProductProductionGroupVO, ProductProductionQuery, ProductProductionVO } from '@/api/djs-warehouse/production/types';
import { useI18n } from 'vue-i18n';
import TraceLabelDialog from '@/views/djs-store/trace/components/TraceLabelDialog.vue';
import { traceTypeFromCode } from '@/views/djs-store/trace/components/traceType';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const traceLabelRef = ref<InstanceType<typeof TraceLabelDialog>>();

const visible = ref(false);
const list = ref<ProductProductionVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 当前下钻的生产批次（生产日期 + 产品），由父列表聚合行传入 */
const batch = ref<ProductProductionGroupVO | null>(null);

const searchModel = reactive<Record<string, any>>({
  productSort: undefined,
  storeName: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productSort', label: t('djs.warehouse.production.column.productSort'), type: 'input' },
  { field: 'storeName', label: t('djs.warehouse.production.column.storeName'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'produceNo', label: t('djs.warehouse.production.column.produceNo'), minWidth: 160 },
  { prop: 'productSort', label: t('djs.warehouse.production.column.productSort'), minWidth: 90, align: 'center' },
  {
    prop: 'productWeight',
    label: t('djs.warehouse.production.column.productWeight'),
    minWidth: 110,
    align: 'center',
    formatter: (row: BizRow) => {
      const r = row as ProductProductionVO;
      if (r.productWeight === undefined || r.productWeight === null) return '-';
      return r.productUnit ? `${r.productWeight}${r.productUnit}` : String(r.productWeight);
    }
  },
  // 主列表删掉的逐件字段下沉到此子页（VO 已全有）
  { prop: 'packStatus', label: t('djs.warehouse.production.column.packStatus'), minWidth: 110, dictType: 'djs_pack_status' },
  {
    prop: 'earNo',
    label: t('djs.warehouse.production.column.earNo'),
    minWidth: 120,
    formatter: (row: BizRow) => (row as ProductProductionVO).earNo || '-'
  },
  {
    prop: 'plotName',
    label: t('djs.warehouse.production.column.plotName'),
    minWidth: 120,
    formatter: (row: BizRow) => {
      const r = row as ProductProductionVO;
      return r.plotName || (r.plotId ? String(r.plotId) : '-');
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
  { prop: 'createByName', label: t('djs.warehouse.production.column.createByName'), minWidth: 100 },
  {
    prop: 'remark',
    label: t('djs.warehouse.production.column.remark'),
    minWidth: 140,
    formatter: (row: BizRow) => (row as ProductProductionVO).remark || '-'
  }
]);

async function loadList() {
  if (!batch.value) return;
  loading.value = true;
  try {
    const params: ProductProductionQuery = {
      productId: batch.value.productId,
      produceDate: batch.value.produceDate,
      // 产品序号改文本模糊搜索：原样透传字符串关键字，由后端 product_sort LIKE 匹配（row115-1 待后端）
      productSort: searchModel.productSort === undefined || searchModel.productSort === '' ? undefined : String(searchModel.productSort).trim(),
      // storeName 是前端搜索字段，后端按 storeId 过滤；本子页未提供 store 选择器，
      // storeName 模糊匹配交由前端在已加载行内不另发请求（仅按序号服务端筛）。
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
