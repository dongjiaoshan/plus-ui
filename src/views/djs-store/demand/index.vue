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
      :dict-types="['djs_store_demand_status', 'djs_demand_mailing_type']"
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
        <!-- 已发货（PARTIAL_SHIPPED/COMPLETED 未收货）：确认收货 → 确认到店 -->
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
        <!-- 已确认 / 确认到店 / 已删除 等：无操作 -->
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

// 默认查询「今天」的需求（格式 YYYY-MM-DD），不引新依赖
const today = (() => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
})();

// 进页面默认：当前门店 + 需求日期=今天（beginDate=endDate=today）+ 状态≠已删除（后端 @TableLogic 过滤）
const searchModel = reactive<Record<string, unknown>>({ beginDate: today, endDate: today });

// 原型筛选：需求日期 + 产品名称
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'beginDate', label: t('storeDemand.field.demandDate'), type: 'date' },
  { field: 'productName', label: t('storeDemand.field.productName'), type: 'input' }
]);

// 列对齐原型：需求日期/产品名称/产品规格/需求量/单位/需求类型/备注/预计到店重量/需求状态/需求确认时间/需求确认人/操作
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'demandDate', label: t('storeDemand.column.demandDate'), minWidth: 110, align: 'center' },
  { prop: 'productName', label: t('storeDemand.column.productName'), minWidth: 130, align: 'center', showOverflowTooltip: true },
  { prop: 'productSpec', label: t('storeDemand.column.productSpec'), minWidth: 110, align: 'center', showOverflowTooltip: true },
  {
    prop: 'demandQuantity',
    label: t('storeDemand.column.demandQuantity'),
    minWidth: 110,
    align: 'center',
    // 89-1：后端返 BigDecimal（3 位小数），需求量取整展示，无值显 '—'
    formatter: (row: BizRow) => {
      const v = (row as StoreDemandVO).demandQuantity;
      return v == null || v === '' ? '—' : String(Math.round(Number(v)));
    }
  },
  { prop: 'productUnit', label: t('storeDemand.column.productUnit'), minWidth: 110, align: 'center' },
  { prop: 'demandType', label: t('storeDemand.column.demandType'), minWidth: 110, align: 'center', dictType: 'djs_demand_mailing_type' },
  { prop: 'demandRemark', label: t('storeDemand.column.demandRemark'), minWidth: 130, align: 'center', showOverflowTooltip: true },
  { prop: 'expectedWeight', label: t('storeDemand.column.expectedWeight'), minWidth: 130, align: 'center' },
  { prop: 'storeDemandStatus', label: t('storeDemand.column.demandStatus'), minWidth: 110, align: 'center', dictType: 'djs_store_demand_status' },
  { prop: 'confirmerTime', label: t('storeDemand.column.confirmerTime'), minWidth: 160, align: 'center', formatter: 'datetime' },
  { prop: 'demandConfirmerName', label: t('storeDemand.column.demandConfirmer'), minWidth: 110, align: 'center' },
  { prop: 'actions', label: t('storeDemand.column.actions'), width: 200, fixed: 'right', align: 'center' }
]);

// 待确认 = SUBMITTED（门店发起后即 SUBMITTED）；待确认才可编辑 / 删除
const isPending = (r: BizRow) => (r as StoreDemandVO).demandStatus === 'SUBMITTED';
// 原型 0613-04 点4：「确认收货」仅在「已发货」行展示。
// 门店视角「已发货」= 仓库 PARTIAL_SHIPPED / COMPLETED 且未收货；点后 → 确认到店。
const canReceive = (r: BizRow) => {
  const s = (r as StoreDemandVO).demandStatus;
  return (s === 'PARTIAL_SHIPPED' || s === 'COMPLETED') && !(r as StoreDemandVO).receivedTime;
};
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
  // 重置 = 回到「今天」，而非清空（保持默认查今天的需求）
  searchModel.beginDate = today;
  searchModel.endDate = today;
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
