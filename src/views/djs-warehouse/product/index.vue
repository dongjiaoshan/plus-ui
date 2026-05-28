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
      :dict-types="['djs_product_type', 'djs_belong_type', 'djs_buy_class', 'djs_product_attr', 'djs_product_workshop', 'sys_normal_disable']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      perm-prefix="djs:warehouse:product"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
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
    </BizTable>

    <ProductInfoForm ref="formRef" @success="handleFormSuccess" />
  </div>
</template>

<script setup name="ProductMaster" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import ProductInfoForm from './components/ProductInfoForm.vue';
import { delProduct, listProduct } from '@/api/djs-warehouse/product';
import { listByIds as listOssByIds } from '@/api/system/oss';
import type { ProductInfoQuery, ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<ProductInfoVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
/** ossId(string) → url */
const thumbUrlMap = ref<Record<string, string>>({});

const searchModel = reactive<Record<string, any>>({
  productId: undefined,
  productName: undefined,
  productType: undefined,
  belongType: undefined,
  buyClass: undefined,
  productStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productId', label: t('product.field.productId'), type: 'input' },
  { field: 'productName', label: t('product.field.productName'), type: 'input' },
  { field: 'productType', label: t('product.field.productType'), type: 'select', dictType: 'djs_product_type' },
  { field: 'belongType', label: t('product.field.belongType'), type: 'select', dictType: 'djs_belong_type' },
  { field: 'buyClass', label: t('product.field.buyClass'), type: 'select', dictType: 'djs_buy_class' },
  { field: 'productStatus', label: t('product.field.productStatus'), type: 'select', dictType: 'sys_normal_disable' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'productId', label: t('product.column.productId'), width: 140, showOverflowTooltip: true },
  { prop: 'productName', label: t('product.column.productName'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'productType', label: t('product.column.productType'), width: 90, align: 'center', dictType: 'djs_product_type' },
  { prop: 'productAttr', label: t('product.column.productAttr'), width: 100, align: 'center', dictType: 'djs_product_attr' },
  { prop: 'productWorkshop', label: t('product.column.productWorkshop'), width: 120, align: 'center', dictType: 'djs_product_workshop' },
  { prop: 'productStatus', label: t('product.column.productStatus'), width: 90, align: 'center', dictType: 'sys_normal_disable' },
  { prop: 'createTime', label: t('product.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: ProductInfoQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productId: searchModel.productId || undefined,
      productName: searchModel.productName || undefined,
      productType: searchModel.productType === undefined || searchModel.productType === '' ? undefined : Number(searchModel.productType),
      belongType: searchModel.belongType || undefined,
      buyClass: searchModel.buyClass || undefined,
      productStatus: searchModel.productStatus === undefined || searchModel.productStatus === '' ? undefined : Number(searchModel.productStatus)
    };
    const res = await listProduct(query);
    list.value = (res.rows ?? res.data ?? []) as ProductInfoVO[];
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
    (res.data ?? []).forEach((o: any) => {
      if (o?.ossId != null && o?.url) {
        map[String(o.ossId)] = o.url;
      }
    });
    thumbUrlMap.value = map;
  } catch (e) {
    console.warn('[Product] listOssByIds failed', e);
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
  await proxy?.$modal.confirm(t('product.confirm.del', { count: ids.length }));
  await delProduct(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/warehouse/product/export',
    {
      productId: searchModel.productId || undefined,
      productName: searchModel.productName || undefined,
      productType: searchModel.productType === undefined || searchModel.productType === '' ? undefined : Number(searchModel.productType),
      belongType: searchModel.belongType || undefined,
      buyClass: searchModel.buyClass || undefined,
      productStatus: searchModel.productStatus === undefined || searchModel.productStatus === '' ? undefined : Number(searchModel.productStatus)
    },
    `product_${new Date().getTime()}.xlsx`
  );
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
