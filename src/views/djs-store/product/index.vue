<template>
  <div class="p-2">
    <!-- 门店产品管理：门店能卖哪些产品 + 产品建档展示。数据源复用仓库产品（V1 展示全部产品，见 openIssue） -->
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_product_type', 'sys_normal_disable']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      :selectable="false"
      :show-add="true"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-export="false"
      perm-prefix="djs:warehouse:product"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @page-change="handlePageChange"
    >
      <template #cell-productThumb="{ row }">
        <ImagePreview
          v-if="row.productThumb && thumbUrlMap[String(row.productThumb)]"
          :width="40"
          :height="40"
          :src="thumbUrlMap[String(row.productThumb)]"
          :preview-src-list="[thumbUrlMap[String(row.productThumb)]]"
        />
        <span v-else class="text-gray-400">—</span>
      </template>

      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:product:edit']" link type="primary" icon="Edit" @click="handleEdit(row)">
          {{ t('common.edit') }}
        </el-button>
        <el-button
          v-hasPermi="['djs:warehouse:product:edit']"
          link
          :type="row.productStatus === 0 ? 'warning' : 'success'"
          @click="handleToggleStatus(row)"
        >
          {{ row.productStatus === 0 ? t('common.disable') : t('common.enable') }}
        </el-button>
        <el-button v-hasPermi="['djs:warehouse:product:list']" link type="primary" icon="View" @click="handleView(row)">
          {{ t('common.view') }}
        </el-button>
      </template>
    </BizTable>

    <ProductInfoForm ref="formRef" @success="handleFormSuccess" />
    <ProductLedgerDetail ref="detailRef" />
  </div>
</template>

<script setup name="StoreProductMgmt" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import ProductLedgerDetail from './detail/index.vue';
import ProductInfoForm from '@/views/djs-warehouse/product/components/ProductInfoForm.vue';
import { listProduct, changeProductStatus } from '@/api/djs-warehouse/product';
import { listByIds as listOssByIds } from '@/api/system/oss';
import type { ProductInfoQuery, ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listSupplier } from '@/api/djs-common/supplier';
import type { SupplierVO } from '@/api/djs-common/supplier/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const detailRef = ref<{ open: (product: ProductInfoVO) => void }>();
const formRef = ref<{ openCreate: (presetType?: number) => void; openEdit: (id: number | string) => void }>();

const list = ref<ProductInfoVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
/** ossId(string) → url */
const thumbUrlMap = ref<Record<string, string>>({});
/** supplierId(string) → supplierName */
const supplierNameMap = ref<Record<string, string>>({});

const searchModel = reactive<Record<string, unknown>>({
  productName: undefined,
  productType: undefined,
  productStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productName', label: t('storeProduct.field.productName'), type: 'input' },
  { field: 'productType', label: t('storeProduct.field.productType'), type: 'select', dictType: 'djs_product_type' },
  { field: 'productStatus', label: t('storeProduct.field.productStatus'), type: 'select', dictType: 'sys_normal_disable' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'productThumb', label: t('storeProduct.column.image'), width: 70, align: 'center' },
  { prop: 'productType', label: t('storeProduct.column.productType'), width: 90, align: 'center', dictType: 'djs_product_type' },
  { prop: 'productName', label: t('storeProduct.column.productName'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'supplierName', label: t('storeProduct.column.supplier'), width: 130, align: 'center', showOverflowTooltip: true },
  { prop: 'productSpec', label: t('storeProduct.column.productSpec'), width: 110, align: 'center', showOverflowTooltip: true },
  { prop: 'productUnit', label: t('storeProduct.column.unit'), width: 70, align: 'center' },
  { prop: 'productStatus', label: t('storeProduct.column.productStatus'), width: 90, align: 'center', dictType: 'sys_normal_disable' },
  { prop: 'updateTime', label: t('storeProduct.column.updateTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'updateByName', label: t('storeProduct.column.updateBy'), width: 100, align: 'center' }
]);

async function loadSupplierMap() {
  try {
    const res = await listSupplier({ pageNum: 1, pageSize: 500 });
    const suppliers = ((res as unknown as { rows?: SupplierVO[]; data?: SupplierVO[] }).rows ?? []) as SupplierVO[];
    const map: Record<string, string> = {};
    suppliers.forEach((s) => {
      if (s.id != null && s.supplierName) {
        map[String(s.id)] = s.supplierName;
      }
    });
    supplierNameMap.value = map;
  } catch (e) {
    console.warn('[StoreProductMgmt] loadSupplierMap failed', e);
    supplierNameMap.value = {};
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const query: ProductInfoQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productName: (searchModel.productName as string) || undefined,
      productType:
        searchModel.productType === undefined || searchModel.productType === '' ? undefined : Number(searchModel.productType),
      productStatus:
        searchModel.productStatus === undefined || searchModel.productStatus === '' ? undefined : Number(searchModel.productStatus)
    };
    const res = await listProduct(query);
    const rows = (res.rows ?? res.data ?? []) as ProductInfoVO[];
    // 注入供应商名（按 supplierId 映射）
    list.value = rows.map((r) => ({
      ...r,
      supplierName: r.supplierId != null ? supplierNameMap.value[String(r.supplierId)] : undefined
    })) as (ProductInfoVO & { supplierName?: string })[];
    total.value = res.total ?? 0;
    await loadThumbUrls();
  } finally {
    loading.value = false;
  }
}

async function loadThumbUrls() {
  const ids = Array.from(new Set(list.value.map((r) => r.productThumb).filter((v): v is string => !!v)));
  if (ids.length === 0) {
    thumbUrlMap.value = {};
    return;
  }
  try {
    const res = await listOssByIds(ids.join(','));
    const map: Record<string, string> = {};
    ((res.data ?? []) as Array<{ ossId?: string | number; url?: string }>).forEach((o) => {
      if (o?.ossId != null && o?.url) {
        map[String(o.ossId)] = o.url;
      }
    });
    thumbUrlMap.value = map;
  } catch (e) {
    console.warn('[StoreProductMgmt] listOssByIds failed', e);
    thumbUrlMap.value = {};
  }
}

function handleSearch(payload?: Record<string, unknown>) {
  Object.assign(searchModel, payload ?? {});
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
function handleView(row: BizRow) {
  detailRef.value?.open(row as unknown as ProductInfoVO);
}
// 新增 / 修改产品：复用仓库产品主数据表单（doc：门店产品=仓库产品主数据）
function handleAdd() {
  formRef.value?.openCreate();
}
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(row.id);
}
/** 行内启停：sys_normal_disable 0=正常 / 1=停用，toggle 当前值 */
async function handleToggleStatus(row: BizRow) {
  const next = row.productStatus === 0 ? 1 : 0;
  await changeProductStatus(row.id, next);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleFormSuccess() {
  fetchList();
}

onMounted(async () => {
  await loadSupplierMap();
  await fetchList();
});
</script>
