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
      :action-width="270"
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

      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:product:list']" link type="primary" icon="View" @click="handleView(row)">
          {{ t('common.view') }}
        </el-button>
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
        <el-button v-hasPermi="['djs:warehouse:product:remove']" link type="danger" icon="Delete" @click="handleDel(row)">
          {{ t('common.del') }}
        </el-button>
      </template>
    </BizTable>

    <ProductInfoForm ref="formRef" @success="handleFormSuccess" />
    <ProductView ref="productViewRef" />
  </div>
</template>

<script setup name="ProductMaster" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import ProductInfoForm from './components/ProductInfoForm.vue';
import ProductView from './components/ProductView.vue';
import { changeProductStatus, delProduct, listProduct } from '@/api/djs-warehouse/product';
import { listByIds as listOssByIds } from '@/api/system/oss';
import type { ProductInfoQuery, ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

/**
 * 菜单入口预过滤：query_param 注入 productType=1|2|3（产品/商品/礼盒三入口共用本组件）。
 * 存在时 productType 被该入口锁定，搜索/重置不可覆盖，搜索区下拉项隐藏，新增态预置并锁 type。
 */
const presetType = route.query.productType ? Number(route.query.productType) : undefined;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: (presetType?: number) => void; openEdit: (id: number | string) => void }>();
const productViewRef = ref<{ open: (id: number | string) => void }>();

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
  productType: presetType,
  belongType: undefined,
  buyClass: undefined,
  productStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => {
  const schema: SearchFieldSchema[] = [
    { field: 'productId', label: t('product.field.productId'), type: 'input' },
    { field: 'productName', label: t('product.field.productName'), type: 'input' },
    { field: 'productType', label: t('product.field.productType'), type: 'select', dictType: 'djs_product_type' },
    { field: 'belongType', label: t('product.field.belongType'), type: 'select', dictType: 'djs_belong_type' },
    { field: 'buyClass', label: t('product.field.buyClass'), type: 'select', dictType: 'djs_buy_class' },
    { field: 'productStatus', label: t('product.field.productStatus'), type: 'select', dictType: 'sys_normal_disable' }
  ];
  // 入口已锁定 productType（产品/商品/礼盒），不让用户再选 → 剔除该搜索项
  return presetType !== undefined ? schema.filter((f) => f.field !== 'productType') : schema;
});

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'productId', label: t('product.column.productId'), width: 140, showOverflowTooltip: true },
  { prop: 'productName', label: t('product.column.productName'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'productType', label: t('product.column.productType'), width: 90, align: 'center', dictType: 'djs_product_type' },
  { prop: 'productAttr', label: t('product.column.productAttr'), width: 100, align: 'center', dictType: 'djs_product_attr' },
  { prop: 'productWorkshop', label: t('product.column.productWorkshop'), width: 120, align: 'center', dictType: 'djs_product_workshop' },
  { prop: 'productStatus', label: t('product.column.productStatus'), width: 90, align: 'center', dictType: 'sys_normal_disable' },
  { prop: 'createTime', label: t('product.column.createTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'updateTime', label: t('product.column.updateTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'updateByName', label: t('common.updateByName'), width: 100, align: 'center' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: ProductInfoQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productId: searchModel.productId || undefined,
      productName: searchModel.productName || undefined,
      // 入口锁定时 productType 强制 = presetType，不被搜索/重置覆盖
      productType:
        presetType !== undefined
          ? presetType
          : searchModel.productType === undefined || searchModel.productType === ''
            ? undefined
            : Number(searchModel.productType),
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
  // 入口锁定时重置后 productType 还原为 presetType（而非 undefined）
  searchModel.productType = presetType;
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function handleAdd() {
  formRef.value?.openCreate(presetType);
}
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(row.id);
}
function handleView(row: BizRow) {
  productViewRef.value?.open(row.id);
}
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('product.confirm.del', { count: ids.length }));
  await delProduct(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
/** 行内启停：sys_normal_disable 0=正常 / 1=停用，toggle 当前值 */
async function handleToggleStatus(row: BizRow) {
  const next = row.productStatus === 0 ? 1 : 0;
  await changeProductStatus(row.id, next);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/warehouse/product/export',
    {
      productId: searchModel.productId || undefined,
      productName: searchModel.productName || undefined,
      // 入口锁定时导出范围同样限定 presetType
      productType:
        presetType !== undefined
          ? presetType
          : searchModel.productType === undefined || searchModel.productType === ''
            ? undefined
            : Number(searchModel.productType),
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
