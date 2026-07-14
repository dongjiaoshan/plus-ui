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
      :dict-types="[
        'djs_product_type',
        'djs_belong_type',
        'djs_buy_class',
        'djs_product_attr',
        'djs_product_workshop',
        'djs_yes_no',
        'sys_normal_disable'
      ]"
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
          v-if="resolveThumbUrl(row)"
          :width="40"
          :height="40"
          :src="resolveThumbUrl(row)!"
          :preview-src-list="[resolveThumbUrl(row)!]"
        />
        <img v-else :src="productPlaceholder" class="w-40px h-40px rounded object-cover" alt="暂无图片" />
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
import { listLocation } from '@/api/djs-warehouse/location';
import type { ProductInfoQuery, ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import productPlaceholder from '@/assets/images/product-placeholder.svg';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

/**
 * 菜单入口预过滤：query_param 注入 productType（产品/商品入口共用本组件）。
 * - 产品配置入口（query productType=1）→ 自产 presetTypes=[1]（礼盒 = 自产 + 产品类别 gift_box，无独立类型）
 * - 商品配置入口（query productType=2）→ 外购 presetTypes=[2]
 * djs_product_type 已废弃 3 礼盒。存在时类型被入口锁定：搜索/重置不可覆盖、搜索区类型下拉隐藏、新增态预置并锁 type。
 */
const presetType = route.query.productType ? Number(route.query.productType) : undefined;
const presetTypes: number[] | undefined = presetType !== undefined ? [presetType] : undefined;
/** 新增态默认锁定的 type（产品入口默认自产=1；其余取入口值） */
const addLockType: number | undefined = presetType;
/**
 * 商品配置入口（productType=2）下，列表/搜索/详情里「产品X」文案显示为「商品X」。
 * 产品配置入口（productType=1）仍用「产品X」。
 */
const isGoods = presetType === 2;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{
  openCreate: (presetType?: number, allowedTypes?: number[]) => void;
  openEdit: (id: number | string, allowedTypes?: number[]) => void;
}>();
const productViewRef = ref<{ open: (id: number | string, productType?: number) => void }>();

/** 存储仓库筛选下拉项（库位列表） */
const locationOptions = ref<Array<{ label: string; value: string }>>([]);

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
  productType: [],
  belongType: [],
  productAttr: undefined,
  isBuyOut: undefined,
  productWorkshop: [],
  storeLocationId: [],
  productStatus: undefined,
  updateBy: undefined,
  updateTime: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => {
  const schema: SearchFieldSchema[] = [
    { field: 'productId', label: t(isGoods ? 'product.field.goodsId' : 'product.field.productId'), type: 'input' },
    { field: 'productName', label: t(isGoods ? 'product.field.goodsName' : 'product.field.productName'), type: 'input' },
    {
      field: 'productType',
      label: t(isGoods ? 'product.field.goodsType' : 'product.field.productType'),
      type: 'select',
      dictType: 'djs_product_type',
      multiple: true
    },
    {
      field: 'belongType',
      label: t(isGoods ? 'product.field.goodsBelongType' : 'product.field.belongType'),
      type: 'select',
      dictType: 'djs_belong_type',
      multiple: true
    },
    // row41：「产品属性」搜索（row81-4：商品配置去掉）
    { field: 'productAttr', label: t('product.field.productAttr'), type: 'select', dictType: 'djs_product_attr' },
    // row30：「是否支持外购」筛选（row81-3：商品配置去掉）
    { field: 'isBuyOut', label: t('product.field.isBuyOutSupport'), type: 'select', dictType: 'djs_yes_no' },
    // 「生产车间」搜索（row81-5：商品配置去掉）
    { field: 'productWorkshop', label: t('product.field.productWorkshop'), type: 'select', dictType: 'djs_product_workshop', multiple: true },
    { field: 'storeLocationId', label: t('product.field.storeLocation'), type: 'select', options: locationOptions.value, multiple: true },
    { field: 'productStatus', label: t('product.field.productStatus'), type: 'select', dictType: 'sys_normal_disable' },
    { field: 'updateTime', label: t('product.column.updateTime'), type: 'daterange' },
    { field: 'updateBy', label: t('product.field.updateBy'), type: 'input' }
  ];
  // 商品配置入口（isGoods）去掉「产品属性 / 是否支持外购 / 生产车间」三个搜索条件（row81-3/4/5）
  const goodsHiddenFields = isGoods ? ['productAttr', 'isBuyOut', 'productWorkshop'] : [];
  // 入口已锁定 productType（产品/商品入口），不让用户再选 → 剔除该搜索项
  return schema.filter((f) => {
    if (presetTypes !== undefined && f.field === 'productType') return false;
    if (goodsHiddenFields.includes(f.field)) return false;
    return true;
  });
});

// row30/row81：列头按入口分叉（产品类型由菜单入口锁定恒为自产/外购，列冗余已去）。
// 产品配置(productType=1)：产品图片/产品编码/产品名称/产品类别/产品属性/生产车间/单位/规格/存储仓库/是否支持外购/状态/更新时间/更新人员
// 商品配置(isGoods)  ：商品图片/商品编码/商品名称/产品类别/单位/规格/存储仓库/供应商/状态/更新时间/更新人员
//   —— 去掉「商品属性 / 生产车间 / 是否支持外购」三列，新增「供应商」列（row81-2/3/6）
const columns = computed<BizTableColumn[]>(() => {
  const cols: BizTableColumn[] = [
    { prop: 'productThumb', label: t(isGoods ? 'product.column.goodsThumb' : 'product.column.productThumb'), width: 80, align: 'center' },
    { prop: 'productId', label: t(isGoods ? 'product.column.goodsId' : 'product.column.productId'), width: 140, showOverflowTooltip: true },
    { prop: 'productName', label: t(isGoods ? 'product.column.goodsName' : 'product.column.productName'), minWidth: 160, showOverflowTooltip: true },
    // 商品配置(外购商品)「商品类别」取采购分类 buy_class（belong_type 仅自产产品有值、外购恒 NULL → 原绑 belongType 列全空 row190）；
    // 产品配置(自产)保持 belong_type 归属类型。
    isGoods
      ? { prop: 'buyClass', label: t('product.column.goodsBelongType'), width: 110, align: 'center', dictType: 'djs_buy_class' }
      : { prop: 'belongType', label: t('product.column.belongType'), width: 110, align: 'center', dictType: 'djs_belong_type' }
  ];
  if (!isGoods) {
    // row81-2：商品配置去掉「商品属性 / 生产车间」两列
    cols.push(
      { prop: 'productAttr', label: t('product.column.productAttr'), width: 100, align: 'center', dictType: 'djs_product_attr' },
      { prop: 'productWorkshop', label: t('product.column.productWorkshop'), width: 110, align: 'center', dictType: 'djs_product_workshop' }
    );
  }
  cols.push(
    { prop: 'productUnit', label: t('product.column.productUnit'), width: 90, align: 'center' },
    { prop: 'productSpec', label: t('product.column.productSpec'), width: 100, align: 'center', showOverflowTooltip: true }
  );
  // row119-2：商品配置去掉「产品别名」列（外购商品无别名语义）；产品配置保留。
  if (!isGoods) {
    cols.push({ prop: 'productAlias', label: t('product.column.productAlias'), width: 120, align: 'center', showOverflowTooltip: true });
  }
  cols.push({ prop: 'storeLocationName', label: t('product.column.storeLocation'), width: 130, align: 'center', showOverflowTooltip: true });
  if (isGoods) {
    // row81-6：商品配置新增「供应商」列
    cols.push({ prop: 'supplierName', label: t('product.column.supplierName'), width: 140, align: 'center', showOverflowTooltip: true });
  } else {
    // row81-3：是否支持外购列仅产品配置保留
    cols.push({ prop: 'isBuyOut', label: t('product.field.isBuyOutSupport'), width: 120, align: 'center', dictType: 'djs_yes_no' });
  }
  cols.push(
    { prop: 'productStatus', label: t('product.column.productStatus'), width: 90, align: 'center', dictType: 'sys_normal_disable' },
    { prop: 'updateTime', label: t('product.column.updateTime'), width: 170, align: 'center', formatter: 'datetime' },
    { prop: 'updateByName', label: t('common.updateByName'), width: 100, align: 'center' }
  );
  return cols;
});

/** 把搜索态拼成后端查询参数（fetch / export 共用），入口锁定走 presetTypes 集合。 */
function buildQuery(): Omit<ProductInfoQuery, 'pageNum' | 'pageSize'> {
  const range = Array.isArray(searchModel.updateTime) ? searchModel.updateTime : [];
  // R70 多选：productType / belongType / productWorkshop / storeLocationId 改复数 IN
  // 入口锁定（presetTypes）优先，锁定时搜索区不显示 productType，用户多选 productType 走 productTypes
  const userProductTypes =
    Array.isArray(searchModel.productType) && searchModel.productType.length ? searchModel.productType.map((v: any) => Number(v)) : undefined;
  const belongTypes = Array.isArray(searchModel.belongType) && searchModel.belongType.length ? searchModel.belongType : undefined;
  const productWorkshops =
    Array.isArray(searchModel.productWorkshop) && searchModel.productWorkshop.length
      ? searchModel.productWorkshop.map((v: any) => Number(v))
      : undefined;
  const storeLocationIds =
    Array.isArray(searchModel.storeLocationId) && searchModel.storeLocationId.length
      ? searchModel.storeLocationId.map((v: any) => String(v))
      : undefined;
  return {
    productId: searchModel.productId || undefined,
    productName: searchModel.productName || undefined,
    // 入口锁定时走 presetTypes（产品配置 {1}=自产含礼盒 / 商品配置 {2}=外购），不被搜索/重置覆盖；
    // 否则走用户多选 productTypes
    productTypes: presetTypes !== undefined ? presetTypes : userProductTypes,
    belongTypes,
    productAttr: searchModel.productAttr === undefined || searchModel.productAttr === '' ? undefined : Number(searchModel.productAttr),
    isBuyOut: searchModel.isBuyOut === undefined || searchModel.isBuyOut === '' ? undefined : Number(searchModel.isBuyOut),
    productWorkshops,
    storeLocationIds,
    productStatus: searchModel.productStatus === undefined || searchModel.productStatus === '' ? undefined : Number(searchModel.productStatus),
    updateBy: searchModel.updateBy || undefined,
    updateBeginTime: range[0] || undefined,
    updateEndTime: range[1] || undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const query: ProductInfoQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      ...buildQuery()
    };
    const res = await listProduct(query);
    list.value = (res.rows ?? res.data ?? []) as ProductInfoVO[];
    total.value = res.total ?? 0;
    await loadThumbUrls();
  } finally {
    loading.value = false;
  }
}

/**
 * 取图列回落：产品图片优先 productThumb，其次 mp 端写入的 imageOssId（COALESCE 语义），
 * 两者都取不到 OSS url 时返回 undefined → 模板渲染统一静态占位图。
 */
function resolveThumbUrl(row: ProductInfoVO): string | undefined {
  if (row.productThumb && thumbUrlMap.value[String(row.productThumb)]) {
    return thumbUrlMap.value[String(row.productThumb)];
  }
  if (row.imageOssId && thumbUrlMap.value[String(row.imageOssId)]) {
    return thumbUrlMap.value[String(row.imageOssId)];
  }
  return undefined;
}

async function loadThumbUrls() {
  const ids = Array.from(
    new Set(list.value.flatMap((r) => [r.productThumb, r.imageOssId]).filter((v): v is string => !!v))
  );
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
  // R70 多选字段重置成空数组（el-select multiple）
  searchModel.productType = [];
  searchModel.belongType = [];
  searchModel.productWorkshop = [];
  searchModel.storeLocationId = [];
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function handleAdd() {
  // 入口锁定类型集合：产品配置 [自产,礼盒]，商品配置 [外购]；新增态预置首项 addLockType
  formRef.value?.openCreate(addLockType, presetTypes);
}
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(row.id, presetTypes);
}
function handleView(row: BizRow) {
  productViewRef.value?.open(row.id, row.productType);
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
  const q = buildQuery();
  // 导出走 form-urlencoded，CSV 数组手动展开为字符串（R70 多选 4 字段）
  const params: Record<string, any> = { ...q };
  if (q.productTypes && q.productTypes.length > 0) {
    params.productTypes = q.productTypes.join(',');
  }
  if (q.belongTypes && q.belongTypes.length > 0) {
    params.belongTypes = q.belongTypes.join(',');
  }
  if (q.productWorkshops && q.productWorkshops.length > 0) {
    params.productWorkshops = q.productWorkshops.join(',');
  }
  if (q.storeLocationIds && q.storeLocationIds.length > 0) {
    params.storeLocationIds = q.storeLocationIds.join(',');
  }
  proxy?.download('djs/warehouse/product/export', params, `product_${new Date().getTime()}.xlsx`);
}
function handleFormSuccess() {
  fetchList();
}

/** 加载存储仓库（库位）下拉项 */
async function loadLocationOptions() {
  try {
    const res = await listLocation({ pageNum: 1, pageSize: 500 } as any);
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: number | string; locationName: string }>;
    locationOptions.value = rows.map((r) => ({ label: r.locationName, value: String(r.id) }));
  } catch (e) {
    console.warn('[Product] listLocation failed', e);
    locationOptions.value = [];
  }
}

onMounted(() => {
  loadLocationOptions();
  fetchList();
});
</script>
