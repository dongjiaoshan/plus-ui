<template>
  <!-- row186：出库统计行「查看详情」。8 列 + 分页，宽度与入库明细一致 -->
  <el-dialog v-model="visible" :title="dialogTitle" width="90%" append-to-body destroy-on-close @closed="handleClosed">
    <!-- 甲方第 3 点：搜索条件为「出库日期」和「出库记录人」 -->
    <el-form :inline="true" class="mb-2" @submit.prevent>
      <el-form-item :label="t('inoutStat.detail.outDate')">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          :start-placeholder="t('inoutStat.detail.dateStart')"
          :end-placeholder="t('inoutStat.detail.dateEnd')"
          :range-separator="t('inoutStat.detail.dateSep')"
          style="width: 260px"
        />
      </el-form-item>
      <el-form-item :label="t('inoutStat.detail.outOperator')">
        <el-select v-model="operatorId" :placeholder="t('inoutStat.detail.operatorPlaceholder')" filterable clearable style="width: 180px">
          <el-option v-for="o in operatorOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">{{ t('inoutStat.detail.search') }}</el-button>
        <el-button icon="Refresh" @click="handleReset">{{ t('inoutStat.detail.reset') }}</el-button>
        <!-- 甲方第 4 点：出入库详情都支持导出 -->
        <el-button v-hasPermi="['djs:warehouse:inoutStat:export']" type="warning" icon="Download" :disabled="!list.length" @click="handleExport">
          {{ t('inoutStat.detail.export') }}
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border size="small" max-height="480">
      <el-table-column :label="t('inoutStat.detail.outDate')" prop="flowDate" min-width="110" align="center" header-align="center" />
      <el-table-column :label="t('inoutStat.column.productCode')" prop="productCode" min-width="110" align="center" header-align="center" />
      <el-table-column
        :label="t('inoutStat.column.productName')"
        prop="productName"
        min-width="160"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column
        :label="t('inoutStat.column.productSpec')"
        prop="productSpec"
        min-width="110"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <!-- 量的单位混杂（kg / 袋 / 桶 / 罐 / 枚），后端已拼成带单位的串，前端不再二次格式化 -->
      <el-table-column :label="t('inoutStat.column.outboundQty')" prop="outQtyLabel" min-width="110" align="center" header-align="center" />
      <el-table-column
        :label="t('inoutStat.column.outDest')"
        prop="outDestName"
        min-width="140"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column :label="t('inoutStat.detail.outOperator')" prop="operatorName" min-width="110" align="center" header-align="center" />
      <el-table-column :label="t('inoutStat.detail.outTime')" prop="createTime" min-width="160" align="center" header-align="center" />
    </el-table>

    <pagination v-show="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" @pagination="fetchList" />
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 出库统计「查看详情」弹窗（V6-R186 第 3 点）。
 *
 * 列出被点击那一行（产品编码 × 出库去向）在日期区间内的逐条出库流水。
 * 与入库明细同一套约定：后端明细与汇总共用 FROM / WHERE，逐条加起来等于汇总行的出库量。
 */
import { listOutStatDetail, type InoutStatDetailFilter, type InoutStatOutDetailVO, type InoutStatOutVO } from '@/api/djs-warehouse/inoutStat';
import { useOperatorOptions } from '../useOperatorOptions';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'OutDetailDialog' });

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/** 分页响应实际结构（request 拦截器已剥掉 axios 外壳） */
interface DetailListPayload {
  rows?: InoutStatOutDetailVO[];
  total?: number;
}

const { operatorOptions, loadOperatorOptions } = useOperatorOptions();

const visible = ref(false);
const loading = ref(false);
const list = ref<InoutStatOutDetailVO[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

/** 被点击那一行的分组键 + 列表当时的筛选条件（打开时定格，弹窗内不再变） */
const rowKey = ref<InoutStatDetailFilter>({ productCode: '' });
/** 该行的产品名（只用于弹窗标题） */
const rowProductName = ref('');
/** 列表当时的日期区间：弹窗日期筛选的默认值，重置也回到它 */
const baseDateRange = ref<string[]>([]);

const dateRange = ref<string[]>([]);
const operatorId = ref<string | undefined>(undefined);

const dialogTitle = computed(() => `${t('inoutStat.detail.outTitle')}（${rowKey.value.productCode} ${rowProductName.value}）`);

/**
 * 打开某一汇总行的出库明细。
 *
 * @param row       被点击的汇总行（提供产品编码与产品名）
 * @param listQuery 列表当前的筛选条件（原样带上，明细才是那一行的真子集）
 * @param outDest   该行的出库去向**原始值**（列表列显示的是翻译后的文案；「未指定」那一桶传空串）
 */
function open(row: InoutStatOutVO, listQuery: Omit<InoutStatDetailFilter, 'productCode'>, outDest: string) {
  rowKey.value = {
    ...listQuery,
    productCode: row.productCode ?? '',
    outDest
  };
  rowProductName.value = row.productName ?? '';
  baseDateRange.value = listQuery.dateFrom && listQuery.dateTo ? [listQuery.dateFrom, listQuery.dateTo] : [];
  dateRange.value = [...baseDateRange.value];
  operatorId.value = undefined;
  list.value = [];
  total.value = 0;
  pageNum.value = 1;
  visible.value = true;
  loadOperatorOptions();
  fetchList();
}

/** 弹窗内条件 → 后端参数（日期区间覆盖列表带来的 dateFrom / dateTo，理由见入库明细弹窗）。 */
function buildParams(): InoutStatDetailFilter {
  const [from, to] = dateRange.value.length === 2 ? dateRange.value : [undefined, undefined];
  return {
    ...rowKey.value,
    dateFrom: from || undefined,
    dateTo: to || undefined,
    operatorId: operatorId.value || undefined
  };
}

async function fetchList() {
  if (!rowKey.value.productCode) return;
  loading.value = true;
  try {
    const res = (await listOutStatDetail({
      ...buildParams(),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })) as unknown as DetailListPayload;
    list.value = res.rows ?? [];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNum.value = 1;
  fetchList();
}

/** 重置回打开时的区间（清空日期等于统计全历史，那就不是这一行的明细了）。 */
function handleReset() {
  dateRange.value = [...baseDateRange.value];
  operatorId.value = undefined;
  pageNum.value = 1;
  fetchList();
}

/** 导出当前弹窗条件下的全量（后端与弹窗表格走同一份 SQL，甲方第 4 点）。 */
function handleExport() {
  const params = buildParams();
  proxy?.download('/djs/warehouse/inoutStat/out/detail/export', params, `出库明细_${params.productCode}.xlsx`);
}

function handleClosed() {
  rowKey.value = { productCode: '' };
  rowProductName.value = '';
  list.value = [];
  total.value = 0;
}

defineExpose({ open });
</script>
