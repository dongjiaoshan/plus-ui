<template>
  <!-- 已发货需求行「产品明细」：列出该需求下逐件产品 + 标损操作（规则 13：el-dialog 默认点蒙层关闭） -->
  <el-dialog v-model="visible" :title="t('storeDemand.damage.detailTitle')" width="1000px" destroy-on-close append-to-body @closed="onClosed">
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_yes_no']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      :show-add="false"
      :show-batch-del="false"
      :show-export="false"
      :show-row-edit="false"
      :show-row-del="false"
      perm-prefix="djs:store:demand"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <!-- admin row99：仅非 KG 生产产品可按件标损；白条与 KG 产品均不提供操作。 -->
        <template v-if="canMarkDamage">
          <el-button v-if="(row as ProductProductionVO).isDamaged === 1" link type="primary" size="small" @click="onDamage(row)">
            {{ t('storeDemand.damage.editAction') }}
          </el-button>
          <el-button v-else link type="warning" size="small" @click="onDamage(row)">
            {{ t('storeDemand.damage.markAction') }}
          </el-button>
        </template>
        <span v-else class="text-placeholder">—</span>
      </template>
    </BizTable>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>

    <!-- 标损 / 修改损坏凭证弹框 -->
    <DamageEvidenceForm ref="damageFormRef" @success="loadList" />
  </el-dialog>
</template>

<script setup name="ProductDetailDialog" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import DamageEvidenceForm from './DamageEvidenceForm.vue';
import { listProductionItems } from '@/api/djs-warehouse/production';
import type { ProductProductionVO, ProductProductionQuery } from '@/api/djs-warehouse/production/types';
import { isKgUnit } from '@/utils/weight';
import { formatDeliverDestLabel } from '@/utils/deliverDest';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const damageFormRef = ref<InstanceType<typeof DamageEvidenceForm>>();

const visible = ref(false);
const list = ref<ProductProductionVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/**
 * 当前下钻范围（row204）：按 **demandId** 拉这条需求已到店的逐件产出。
 *
 * 不能按「需求日期 + 门店 + 产品」拉：产出的 produce_date 是**生产**当天，需求的 demand_date 是**到店**那天，
 * 「今天生产、明天到店」是常规流程，两者差一天时按日期筛一行都查不到 —— 甲方看到的「部分到店行点开明细空白」
 * 就是这么来的。demand_id 与 is_delivery_check 是点击发车那一刻同事务写的，
 * 与需求行「到店量」的聚合口径（Σ demand_deduct_qty WHERE is_delivery_check=1）是同一把钥匙。
 */
const scope = reactive<{ demandId: string; productType: string; productUnit: string }>({
  demandId: '',
  productType: '',
  productUnit: ''
});

// admin row3：白条产品（猪只整只/半只）明细不显示「记为损坏」操作
const isWhiteBar = computed(() => scope.productType === 'white_bar');
const canMarkDamage = computed(() => !isWhiteBar.value && !isKgUnit(scope.productUnit));

// 「是否损坏」搜索条（全部 = undefined / 是 = 1 / 否 = 0），select 走 dict djs_yes_no
const searchModel = reactive<Record<string, unknown>>({ isDamaged: undefined });

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'isDamaged', label: t('storeDemand.damage.isDamaged'), type: 'select', dictType: 'djs_yes_no' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'produceNo', label: t('storeDemand.damage.produceNo'), minWidth: 160, align: 'center', showOverflowTooltip: true },
  {
    // row204：产出的生产日期常常比需求日期早一天（今天生产、明天到店），显式列出来免得甲方
    // 以为明细拉错了日期。
    prop: 'produceDate',
    label: t('storeDemand.damage.produceDate'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => String((row as ProductProductionVO).produceDate ?? '').slice(0, 10) || '—'
  },
  {
    // row204：这条产出抵了多少需求量 —— 本列之和 = 需求行上的「到店量」。
    prop: 'demandDeductQty',
    label: t('storeDemand.damage.demandDeductQty'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => {
      const v = (row as ProductProductionVO).demandDeductQty;
      if (v === undefined || v === null || v === '') return '—';
      const n = Number(v);
      return Number.isNaN(n) ? String(v) : `${n}${scope.productUnit || ''}`;
    }
  },
  {
    // D-0048：明细如实列全该需求的全部抵扣产出，这一列让「仓库自用出库」那类行一眼可辨，
    // 免得甲方看到抵扣量之和对得上、却不知道其中一条货并没进门店。
    prop: 'deliverDest',
    label: t('storeDemand.damage.deliverDest'),
    minWidth: 110,
    align: 'center',
    formatter: (row: BizRow) => formatDeliverDestLabel((row as ProductProductionVO).deliverDest)
  },
  {
    prop: 'materialName',
    label: t('storeDemand.damage.materialName'),
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (row: BizRow) => (row as ProductProductionVO).materialName || '—'
  },
  {
    prop: 'materialConsume',
    label: t('storeDemand.damage.materialConsume'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => {
      const r = row as ProductProductionVO;
      if (r.materialConsume === undefined || r.materialConsume === null) return '—';
      return r.materialUnit ? `${r.materialConsume}${r.materialUnit}` : String(r.materialConsume);
    }
  },
  {
    prop: 'materialUnit',
    label: t('storeDemand.damage.materialUnit'),
    minWidth: 90,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionVO).materialUnit || '—'
  },
  { prop: 'isDamaged', label: t('storeDemand.damage.isDamaged'), minWidth: 100, align: 'center', dictType: 'djs_yes_no' },
  {
    prop: 'earNo',
    label: t('storeDemand.damage.earNo'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionVO).earNo || '—'
  },
  {
    prop: 'plotName',
    label: t('storeDemand.damage.plotName'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => (row as ProductProductionVO).plotName || '—'
  },
  { prop: 'action', label: t('storeDemand.column.actions'), width: 110, fixed: 'right', align: 'center' }
]);

async function loadList() {
  if (!scope.demandId) return;
  loading.value = true;
  try {
    const params: ProductProductionQuery = {
      // row204：按需求锁定（走后端 byDemand 分支），只取已发货清点的那部分 = 已到店。
      //
      // ⚠️ 这里**不能**再加 excludeGiftDeliver（D-0048）：到店量的聚合
      // （ProductProductionMapper#selectArrivedQuantityByDemandIds）没有任何 deliver_dest 过滤，
      // 明细一旦多一道 deliver_dest 条件，行的抵扣量之和就对不上需求行显示的到店量。
      // 线上实证：需求 2089615514926686209 到店量 100，带 excludeGiftDeliver 只查得到 1 行 50 —— 少的
      // 那 50 是 deliver_dest='warehouse_out' 的仓库自用出库。到店量该不该排除仓库自用是需求级口径
      // （D-0048 待甲方定），在它定下来之前明细**如实列全**，并用「出库去向」列把这类行标出来。
      // 礼盒组件不受影响：gift 产出根本不写 demand_id（fulfillDirectDemandOnPack 对 gift 早返回）。
      demandId: scope.demandId,
      deliveryChecked: true,
      // 「是否损坏」筛选：undefined=全部；0/1 透传后端 is_damaged 精确过滤
      isDamaged: searchModel.isDamaged === undefined || searchModel.isDamaged === '' ? undefined : Number(searchModel.isDamaged),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listProductionItems(params);
    const payload = res as unknown as { rows?: ProductProductionVO[]; total?: number };
    list.value = payload.rows ?? [];
    total.value = Number(payload.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, unknown>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function onDamage(row: BizRow) {
  damageFormRef.value?.open(row as ProductProductionVO);
}

function onClosed() {
  scope.demandId = '';
  scope.productType = '';
  scope.productUnit = '';
  list.value = [];
  total.value = 0;
}

/**
 * 打开「产品明细」弹框（row204：按需求 id 拉这条需求已到店的逐件产出）。
 * @param params 需求行的 id / productType / productUnit
 */
function open(params: { demandId: string; productType?: string; productUnit?: string }) {
  scope.demandId = String(params.demandId ?? '');
  scope.productType = String(params.productType ?? '');
  scope.productUnit = String(params.productUnit ?? '');
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  pageSize.value = 10;
  list.value = [];
  total.value = 0;
  visible.value = true;
  loadList();
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.text-placeholder {
  color: #c0c4cc;
}
</style>
