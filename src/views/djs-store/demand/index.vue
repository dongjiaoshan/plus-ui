<template>
  <div class="p-2">
    <!-- 顶部：门店筛选（原型门店在全局右上角；列表门店视角必须带 storeId 过滤） -->
    <el-card shadow="never" class="mb-2">
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm">{{ t('storeDemand.filter.store') }}</span>
        <el-select
          v-model="currentStoreId"
          filterable
          clearable
          :placeholder="t('storeDemand.filter.storePlaceholder')"
          style="width: 240px"
          @change="onStoreChange"
        >
          <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
        </el-select>
      </div>
    </el-card>

    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_demand_status', 'djs_demand_mailing_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      :show-row-edit="false"
      :show-row-del="false"
      perm-prefix="djs:store:demand"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @del="handleDel"
      @page-change="handlePageChange"
    >
      <template #cell-actions="{ row }">
        <!-- 待确认（SUBMITTED）：修改 / 删除 -->
        <template v-if="isPending(row)">
          <!-- 个人邮寄（礼盒）待确认：仅「查看列表」（原型个人邮寄行） -->
          <el-button v-if="isMailing(row)" link type="primary" size="small" @click="onViewMailingList(row)">
            {{ t('storeDemand.action.viewList') }}
          </el-button>
          <template v-else>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              {{ t('storeDemand.action.edit') }}
            </el-button>
            <el-button v-hasPermi="['djs:store:demand:remove']" link type="danger" size="small" @click="handleDel(row)">
              {{ t('storeDemand.action.del') }}
            </el-button>
          </template>
        </template>
        <!-- 已确认（CONFIRMED）：确认收货 -->
        <el-button
          v-else-if="canReceive(row)"
          v-hasPermi="['djs:store:demand:receive']"
          link
          type="success"
          size="small"
          @click="onReceive(row)"
        >
          {{ t('storeDemand.action.receive') }}
        </el-button>
        <!-- 已发货 / 确认到店 等终态：无操作 -->
        <span v-else class="text-placeholder">/</span>
      </template>
    </BizTable>

    <!-- 编辑 / 详情用窄表单弹窗（仅 SUBMITTED 行编辑） -->
    <StoreDemandForm ref="formRef" :default-store-id="currentStoreId" @success="fetchList" />
    <!-- 新增需求：多产品购物车右抽屉 -->
    <DemandCartDrawer ref="cartDrawerRef" @success="fetchList" />
  </div>
</template>

<script setup name="StoreDemand" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StoreDemandForm from './components/StoreDemandForm.vue';
import DemandCartDrawer from './components/DemandCartDrawer.vue';
import { listStoreDemand, removeStoreDemand, receiveStoreDemand } from '@/api/djs-store/demand';
import type { StoreDemandVO } from '@/api/djs-store/demand/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openEdit: (id: string) => void; openDetail: (id: string) => void }>();
const cartDrawerRef = ref<{ open: (storeId: string) => void }>();

const list = ref<StoreDemandVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const currentStoreId = ref<string>('');
const storeOptions = ref<StoreVO[]>([]);

const searchModel = reactive<Record<string, unknown>>({});

// 原型筛选：需求日期 + 产品名称
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'beginDate', label: t('storeDemand.field.demandDate'), type: 'date' },
  { field: 'productName', label: t('storeDemand.field.productName'), type: 'input' }
]);

// 列对齐原型：需求日期/产品名称/产品规格/需求量/单位/需求类型/备注/预计到店重量/需求状态/需求确认时间/需求确认人/操作
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'demandDate', label: t('storeDemand.column.demandDate'), width: 110, align: 'center' },
  { prop: 'productName', label: t('storeDemand.column.productName'), minWidth: 130, showOverflowTooltip: true },
  { prop: 'productSpec', label: t('storeDemand.column.productSpec'), width: 100, align: 'center', showOverflowTooltip: true },
  { prop: 'demandQuantity', label: t('storeDemand.column.demandQuantity'), width: 90, align: 'right' },
  { prop: 'productUnit', label: t('storeDemand.column.productUnit'), width: 70, align: 'center' },
  { prop: 'demandType', label: t('storeDemand.column.demandType'), width: 100, align: 'center', dictType: 'djs_demand_mailing_type' },
  { prop: 'demandRemark', label: t('storeDemand.column.demandRemark'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'expectedWeight', label: t('storeDemand.column.expectedWeight'), width: 120, align: 'right' },
  { prop: 'demandStatus', label: t('storeDemand.column.demandStatus'), width: 100, align: 'center', dictType: 'djs_demand_status' },
  { prop: 'confirmerTime', label: t('storeDemand.column.confirmerTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'demandConfirmerName', label: t('storeDemand.column.demandConfirmer'), width: 100, align: 'center' },
  { prop: 'actions', label: t('storeDemand.column.actions'), width: 200, fixed: 'right', align: 'center' }
]);

// 待确认 = SUBMITTED（门店发起后即 SUBMITTED）
const isPending = (r: BizRow) => (r as StoreDemandVO).demandStatus === 'SUBMITTED';
// 已确认（CONFIRMED）且未收货 → 门店可确认收货
const canReceive = (r: BizRow) => (r as StoreDemandVO).demandStatus === 'CONFIRMED' && !(r as StoreDemandVO).receivedTime;
// 个人邮寄
const isMailing = (r: BizRow) => (r as StoreDemandVO).demandType === 'mailing';

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
    // 默认选中第一家门店（门店视角必须带 storeId 过滤）
    if (!currentStoreId.value && storeOptions.value.length > 0) {
      currentStoreId.value = String(storeOptions.value[0].id);
    }
  } catch (e) {
    console.warn('[StoreDemand] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const params = {
      ...searchModel,
      storeId: currentStoreId.value || undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listStoreDemand(params as Parameters<typeof listStoreDemand>[0]);
    const payload = res as unknown as { rows?: StoreDemandVO[]; total?: number };
    list.value = payload.rows ?? [];
    total.value = Number(payload.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, unknown>) {
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
function onStoreChange() {
  pageNum.value = 1;
  fetchList();
}
function handleAdd() {
  if (!currentStoreId.value) {
    proxy?.$modal.msgWarning(t('storeDemand.tip.selectStoreFirst'));
    return;
  }
  // 新增需求 = 打开多产品购物车右抽屉（不再整页路由跳转）
  cartDrawerRef.value?.open(currentStoreId.value);
}
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(String(row.id));
}
function onViewMailingList(row: BizRow) {
  // 个人邮寄（礼盒）子地址清单：后端暂无该接口，先提示
  proxy?.$modal.msgWarning(t('storeDemand.tip.mailingListPending'));
  void row;
}
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const rows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
  await proxy?.$modal.confirm(t('storeDemand.confirm.del', { count: rows.length }));
  await removeStoreDemand(rows.map((r) => String(r.id)));
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
async function onReceive(row: BizRow) {
  const r = row as StoreDemandVO;
  await proxy?.$modal.confirm(t('storeDemand.confirm.receive', { name: r.productName }));
  await receiveStoreDemand(r.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}

onMounted(async () => {
  await loadStoreOptions();
  fetchList();
});
</script>

<style lang="scss" scoped>
.text-placeholder {
  color: #c0c4cc;
}
</style>
