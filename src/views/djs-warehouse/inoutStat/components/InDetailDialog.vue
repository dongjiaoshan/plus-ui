<template>
  <!-- row186：入库统计行「查看详情」。8 列 + 分页，宽度 90% 才放得下（窄了「入库操作时间」会被裁） -->
  <el-dialog v-model="visible" :title="dialogTitle" width="90%" append-to-body destroy-on-close @closed="handleClosed">
    <!-- 甲方第 2 点：搜索条件为「入库日期」和「入库记录人」 -->
    <el-form :inline="true" class="mb-2" @submit.prevent>
      <el-form-item :label="t('inoutStat.detail.inDate')">
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
      <el-form-item :label="t('inoutStat.detail.inOperator')">
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
      <el-table-column :label="t('inoutStat.detail.inDate')" prop="flowDate" min-width="110" align="center" header-align="center" />
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
      <el-table-column :label="t('inoutStat.column.inboundQty')" prop="inQtyLabel" min-width="110" align="center" header-align="center" />
      <el-table-column
        :label="t('inoutStat.detail.inSupplier')"
        prop="supplierName"
        min-width="160"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column :label="t('inoutStat.detail.inOperator')" prop="operatorName" min-width="110" align="center" header-align="center" />
      <el-table-column :label="t('inoutStat.detail.inTime')" prop="createTime" min-width="160" align="center" header-align="center" />
    </el-table>

    <pagination v-show="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" @pagination="fetchList" />
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 入库统计「查看详情」弹窗（V6-R186 第 2 点）。
 *
 * 列出被点击那一行（产品编码 × 入库方式 × 供应商）在日期区间内的逐条入库流水。
 * 后端明细与汇总共用同一份 FROM / WHERE，只多叠一段分组键等值，所以这里逐条加起来
 * 必然等于列表上那一行的入库量 —— 甲方就是拿它核对汇总的。
 *
 * form factor：带搜索 + 导出 + 分页的完整列表放在 el-dialog 里（不做独立路由页），
 * 与兄弟页「出入库月汇总」的下钻弹窗同形态。
 */
import { listInStatDetail, type InoutStatDetailFilter, type InoutStatInDetailVO, type InoutStatInVO } from '@/api/djs-warehouse/inoutStat';
import { useOperatorOptions } from '../useOperatorOptions';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'InDetailDialog' });

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/** 分页响应实际结构（request 拦截器已剥掉 axios 外壳） */
interface DetailListPayload {
  rows?: InoutStatInDetailVO[];
  total?: number;
}

const { operatorOptions, loadOperatorOptions } = useOperatorOptions();

const visible = ref(false);
const loading = ref(false);
const list = ref<InoutStatInDetailVO[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

/** 被点击那一行的分组键 + 列表当时的筛选条件（打开时定格，弹窗内不再变） */
const rowKey = ref<InoutStatDetailFilter>({ productCode: '' });
/** 该行的产品名（只用于弹窗标题，让用户确认点的是哪一行） */
const rowProductName = ref('');
/** 列表当时的日期区间：弹窗日期筛选的默认值，重置也回到它 */
const baseDateRange = ref<string[]>([]);

const dateRange = ref<string[]>([]);
const operatorId = ref<string | undefined>(undefined);

const dialogTitle = computed(() => `${t('inoutStat.detail.inTitle')}（${rowKey.value.productCode} ${rowProductName.value}）`);

/**
 * 打开某一汇总行的入库明细。
 *
 * @param row       被点击的汇总行（提供产品编码与产品名）
 * @param listQuery 列表当前的筛选条件（原样带上，明细才是那一行的真子集）
 * @param inMode    该行的入库方式**原始值**（列表列显示的是翻译后的文案，原始值由面板传）
 * @param supplier  该行的供应商桶值（「无供应商」那一桶传空串）
 */
function open(row: InoutStatInVO, listQuery: Omit<InoutStatDetailFilter, 'productCode'>, inMode: string, supplier: string) {
  rowKey.value = {
    ...listQuery,
    productCode: row.productCode ?? '',
    flowType: inMode,
    supplierName: supplier
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

/**
 * 弹窗内条件 → 后端参数。
 *
 * 日期区间直接覆盖列表带来的 dateFrom / dateTo：弹窗筛日期就是把汇总区间再收窄一次，
 * 两者是同一个参数，各开一套会出现「弹窗筛了日期但求和还按老区间」的错位。
 */
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
    const res = (await listInStatDetail({
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
  proxy?.download('/djs/warehouse/inoutStat/in/detail/export', params, `入库明细_${params.productCode}.xlsx`);
}

function handleClosed() {
  rowKey.value = { productCode: '' };
  rowProductName.value = '';
  list.value = [];
  total.value = 0;
}

defineExpose({ open });
</script>
