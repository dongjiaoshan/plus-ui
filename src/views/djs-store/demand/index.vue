<template>
  <div class="p-2">
    <!-- 门店由顶部全局选择器（StoreSwitcher）统一控制，列表数据靠请求头 Current-Store-Id 后端过滤 -->
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
        <template v-else-if="canReceive(row)">
          <el-button v-hasPermi="['djs:store:demand:receive']" link type="success" size="small" @click="onReceive(row)">
            {{ t('storeDemand.action.receive') }}
          </el-button>
          <!-- 已发货行：产品明细（标损 / 修改损坏凭证，row47） -->
          <el-button link type="primary" size="small" @click="onViewDetail(row)">
            {{ t('storeDemand.action.productDetail') }}
          </el-button>
        </template>
        <!-- 已发货且已收货（确认到店）：仅产品明细（仍可对已发货产品标损） -->
        <el-button v-else-if="isShipped(row)" link type="primary" size="small" @click="onViewDetail(row)">
          {{ t('storeDemand.action.productDetail') }}
        </el-button>
        <!-- 已确认 / 已删除 等：无操作 -->
        <span v-else class="text-placeholder">/</span>
      </template>
    </BizTable>

    <!-- 编辑 / 详情用窄表单弹窗（仅 SUBMITTED 行编辑） -->
    <StoreDemandForm ref="formRef" :default-store-id="currentStoreId || ''" @success="fetchList" />
    <!-- 新增需求：多产品购物车右抽屉 -->
    <DemandCartDrawer ref="cartDrawerRef" @success="fetchList" />
    <!-- 已发货需求行「产品明细」：逐件产品 + 标损（row47/48） -->
    <ProductDetailDialog ref="detailDialogRef" @success="fetchList" />
  </div>
</template>

<script setup name="StoreDemand" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StoreDemandForm from './components/StoreDemandForm.vue';
import DemandCartDrawer from './components/DemandCartDrawer.vue';
import ProductDetailDialog from './components/ProductDetailDialog.vue';
import { listStoreDemand, removeStoreDemand, receiveStoreDemand } from '@/api/djs-store/demand';
import type { StoreDemandVO } from '@/api/djs-store/demand/types';
import { useStoreContextStore } from '@/store/modules/storeContext';
import { nextMonthRange } from '@/utils/ruoyi';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const storeContext = useStoreContextStore();
// 当前门店来自全局选择器（StoreSwitcher），切换由 navbar 统一控制
const { currentStoreId } = storeToRefs(storeContext);

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openEdit: (id: string) => void; openDetail: (id: string) => void }>();
const cartDrawerRef = ref<{ open: (storeId: string) => void }>();
const detailDialogRef = ref<InstanceType<typeof ProductDetailDialog>>();

const list = ref<StoreDemandVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// 进页面默认：当前门店 + 产品需求日期=今天至未来一个月（demandDateRange → beginDate/endDate）+ 状态≠已删除（后端 @TableLogic 过滤）
const searchModel = reactive<Record<string, unknown>>({ demandDateRange: nextMonthRange() });

// 原型筛选：产品需求日期（范围）+ 产品名称
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'demandDateRange', label: t('storeDemand.field.productDemandDate'), type: 'daterange' },
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
  {
    prop: 'damagedCount',
    label: t('storeDemand.column.damagedCount'),
    minWidth: 100,
    align: 'center',
    // 后端仅对「已发货」行回填损坏件数，其余行 null → '—'
    formatter: (row: BizRow) => {
      const v = (row as StoreDemandVO).damagedCount;
      return v == null ? '—' : String(v);
    }
  },
  { prop: 'confirmerTime', label: t('storeDemand.column.confirmerTime'), minWidth: 160, align: 'center', formatter: 'datetime' },
  { prop: 'demandConfirmerName', label: t('storeDemand.column.demandConfirmer'), minWidth: 110, align: 'center' },
  { prop: 'actions', label: t('storeDemand.column.actions'), width: 220, fixed: 'right', align: 'center' }
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
// 已发货（仓库 PARTIAL_SHIPPED / COMPLETED）：无论是否已收货，都可看产品明细并对产品标损（row47）
const isShipped = (r: BizRow) => {
  const s = (r as StoreDemandVO).demandStatus;
  return s === 'PARTIAL_SHIPPED' || s === 'COMPLETED';
};

async function fetchList() {
  loading.value = true;
  try {
    // storeId 不再显式传：后端按请求头 Current-Store-Id 做行级过滤
    // 产品需求日期范围（demandDateRange）拆成后端已支持的 beginDate / endDate，原始数组不下发
    const { demandDateRange, ...rest } = searchModel;
    const range = Array.isArray(demandDateRange) ? (demandDateRange as string[]) : [];
    const params = {
      ...rest,
      beginDate: range[0],
      endDate: range[1],
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
  // demandDateRange 为 [beginDate, endDate]，清空时为 null → fetchList 兜底为空区间（不按日期过滤）
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  // 重置 = 回到「今天至未来一个月」，而非清空（保持默认范围）
  searchModel.demandDateRange = nextMonthRange();
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function handleAdd() {
  if (!currentStoreId.value) {
    proxy?.$modal.msgWarning(t('storeDemand.tip.selectStoreFirst'));
    return;
  }
  // 新增需求 = 打开多产品购物车右抽屉（默认门店取全局当前门店）
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
function onViewDetail(row: BizRow) {
  // 打开「产品明细」弹框，按需求 id 拉该需求下逐件产品（含损坏标记）
  detailDialogRef.value?.open(String(row.id));
}

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.text-placeholder {
  color: #c0c4cc;
}
</style>
