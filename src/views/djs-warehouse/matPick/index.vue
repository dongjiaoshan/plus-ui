<template>
  <div class="p-2">
    <!-- 产品业态切换 TAB（7 类，与小程序一致，按 belong_type 过滤） -->
    <el-tabs v-model="activeBelongType" class="mb-2" @tab-change="handleTabChange">
      <el-tab-pane v-for="tab in belongTabs" :key="tab.value" :label="tab.label" :name="tab.value" />
    </el-tabs>

    <BizTable
      ref="tableRef"
      :data="pagedList"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      :action-width="actionColWidth"
      row-key="rowKey"
      perm-prefix="djs:warehouse:matPick"
      show-export
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- 行操作：领用出库 / 退回入库 / 当日损耗（果蔬业态多一个饲料饲喂）。
           row123：本行今日出库剩余（今日出库−退回−损耗−饲喂）≤0 时禁用退回/损耗/饲喂（今日未领用出库不能操作这三项）。 -->
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:matPick:pick']" link type="primary" size="small" @click="openOp('pick', row as MatPickItemVO)">
          {{ t('matPick.action.pick') }}
        </el-button>
        <el-button
          v-hasPermi="['djs:warehouse:matPick:return']"
          link
          type="primary"
          size="small"
          :disabled="rowRemaining(row as MatPickItemVO) <= 0"
          @click="openOp('return', row as MatPickItemVO)"
        >
          {{ t('matPick.action.return') }}
        </el-button>
        <el-button
          v-hasPermi="['djs:warehouse:matPick:loss']"
          link
          type="warning"
          size="small"
          :disabled="rowRemaining(row as MatPickItemVO) <= 0"
          @click="openOp('loss', row as MatPickItemVO)"
        >
          {{ t('matPick.action.loss') }}
        </el-button>
        <el-button
          v-if="activeBelongType === 'vegetable'"
          v-hasPermi="['djs:warehouse:matPick:feed']"
          link
          type="success"
          size="small"
          :disabled="rowRemaining(row as MatPickItemVO) <= 0"
          @click="openOp('feed', row as MatPickItemVO)"
        >
          {{ t('matPick.action.feed') }}
        </el-button>
      </template>
    </BizTable>

    <!-- 操作弹框（领用 / 退回 / 损耗 / 饲喂 共用，输入量；操作人=当前登录人，日期=当前时间） -->
    <el-dialog v-model="opVisible" :title="opTitle" width="460px" append-to-body>
      <el-form ref="opFormRef" :model="opForm" :rules="opRules" label-width="96px">
        <el-form-item :label="t('matPick.field.productName')">
          <span>{{ opRow?.productName }}</span>
        </el-form-item>
        <!-- 猪肉产品行（row55/56）：行已到耳号粒度、篮唯一，弹框只反显耳号，不再选源篮 -->
        <el-form-item v-if="isPorkOp" :label="t('matPick.column.earNo')">
          <span>{{ opRow?.earNo || '-' }}</span>
        </el-form-item>
        <!-- 非猪肉行粒度：库位到行 -->
        <el-form-item v-else :label="t('matPick.field.locationName')">
          <span>{{ opRow?.locationName || '-' }}</span>
        </el-form-item>
        <el-form-item :label="t('matPick.field.currentStock')">
          <span>{{ fmtNum(opStock) }} {{ opRow?.productUnit }}</span>
        </el-form-item>
        <el-form-item :label="quantityLabel" prop="quantity">
          <el-input-number v-model="opForm.quantity" :min="0.001" :precision="3" :step="1" controls-position="right" class="w-full" />
        </el-form-item>
        <el-form-item :label="t('matPick.field.remark')">
          <el-input v-model="opForm.remark" type="textarea" :rows="2" maxlength="500" :placeholder="t('matPick.placeholder.remark')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="opVisible = false">{{ t('matPick.button.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submitOp">{{ t('matPick.button.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MatPick" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listMatPick, pickMat, returnMat, lossMat, feedMat, canIssueMaterial } from '@/api/djs-warehouse/matPick';
import type { MatPickItemVO } from '@/api/djs-warehouse/matPick';
import { useI18n } from 'vue-i18n';
import type { FormInstance, FormRules } from 'element-plus';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

type OpKind = 'pick' | 'return' | 'loss' | 'feed';

/** 业态 tab（白条不在此领用——白条生产领用只走「白条领用」专页，故此处不列白条）。value = djs_belong_type 字典 value */
const belongTabs = computed(() => [
  { value: 'package', label: t('matPick.tab.package') },
  { value: 'pork', label: t('matPick.tab.pork') },
  { value: 'vegetable', label: t('matPick.tab.vegetable') },
  { value: 'egg', label: t('matPick.tab.egg') },
  { value: 'dry_good', label: t('matPick.tab.dryGood') },
  { value: 'other', label: t('matPick.tab.other') }
]);

const activeBelongType = ref<string>('package');

const tableRef = ref<BizTableExpose>();

/** 后端返回全量行（不分页），前端本地分页 */
const allRows = ref<MatPickItemVO[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  keyword: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'keyword', label: t('matPick.field.keyword'), type: 'input', placeholder: t('matPick.placeholder.keyword') }
]);

const total = computed(() => allRows.value.length);
const pagedList = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value;
  return allRows.value.slice(start, start + pageSize.value);
});

/**
 * 列随业态 tab 动态拼装（口径 row5 / row24）：
 *  - 猪肉 pork：一产品一行（row24 收敛），不再平铺篮，故<b>不显示</b>库位 / 耳号 / 白条号（那是篮级信息，
 *    下沉到领用弹框选源）；只显产品编码 / 产品名 / 当前库存（该产品所有篮 SUM） / 单位 + 今日四量。
 *  - 地块编号 plotCode：仅果蔬业态显示（蔬菜来自地块、无耳号）。
 *  - 包材/鸡蛋/干货/其他：库位到行（行粒度），不显示耳号 / 地块。
 */
const columns = computed<BizTableColumn[]>(() => {
  const tab = activeBelongType.value;
  const isPork = tab === 'pork';
  const cols: BizTableColumn[] = [
    { prop: 'productCode', label: t('matPick.column.productCode'), minWidth: 120, align: 'center', showOverflowTooltip: true }
  ];
  // 猪肉产品行无单一库位（跨篮聚合），不显库位列；其余业态行粒度显库位
  if (!isPork) {
    cols.push({ prop: 'locationName', label: t('matPick.column.locationName'), minWidth: 120, align: 'center', showOverflowTooltip: true });
  }
  cols.push(
    { prop: 'productName', label: t('matPick.column.productName'), minWidth: 120, align: 'center', showOverflowTooltip: true },
    { prop: 'currentStock', label: t('matPick.column.currentStock'), minWidth: 100, align: 'center', formatter: (row: BizRow) => fmtNum(row.currentStock, row.productUnit as string) },
    { prop: 'productUnit', label: t('matPick.column.productUnit'), minWidth: 70, align: 'center' }
  );
  // 猪肉产品按 (产品, 耳号) 分行（row55）：单位列后加耳号列；无耳号的整只白条行显示 '-'
  if (isPork) {
    cols.push({
      prop: 'earNo',
      label: t('matPick.column.earNo'),
      minWidth: 150,
      align: 'center',
      showOverflowTooltip: true,
      formatter: (row: BizRow) => (row.earNo as string) || '-'
    });
  }
  if (tab === 'vegetable') {
    cols.push({ prop: 'plotCode', label: t('matPick.column.plotCode'), minWidth: 110, align: 'center' });
  }
  cols.push(
    { prop: 'todayPicked', label: t('matPick.column.todayPicked'), minWidth: 90, align: 'center', formatter: (row: BizRow) => fmtNum(row.todayPicked, row.productUnit as string) },
    { prop: 'todayReturned', label: t('matPick.column.todayReturned'), minWidth: 90, align: 'center', formatter: (row: BizRow) => fmtNum(row.todayReturned, row.productUnit as string) },
    { prop: 'todayLoss', label: t('matPick.column.todayLoss'), minWidth: 90, align: 'center', formatter: (row: BizRow) => fmtNum(row.todayLoss, row.productUnit as string) },
    { prop: 'todayFeed', label: t('matPick.column.todayFeed'), minWidth: 90, align: 'center', formatter: (row: BizRow) => fmtNum(row.todayFeed, row.productUnit as string) }
  );
  return cols;
});

/** 操作列按内容收窄（row101：减少列宽 + 左右留白）：果蔬多一个「饲料饲喂」共 4 个 link 按钮取 330 恰好一行不换；其余 3 个按钮取 210 */
const actionColWidth = computed(() => (activeBelongType.value === 'vegetable' ? 330 : 210));

/**
 * BigDecimal→string 防 NaN 兜底。row40.2#4：kg 单位恒 3 位小数补零（对齐 mp + row30/31/33 精度约定，
 * 如 620→620.000、119.7→119.700）；非 kg（枚/份/盒等计数单位）去尾零（避免 985 枚显 985.000）。
 */
function fmtNum(v: number | string | undefined | null, unit?: string): string {
  if (v === undefined || v === null || v === '') return '0';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  const minDigits = unit === 'kg' ? 3 : 0;
  return n.toLocaleString('en-US', { minimumFractionDigits: minDigits, maximumFractionDigits: 3 });
}

/**
 * row123：本行「今日出库剩余」= 今日出库 − 退回 − 损耗 − 饲喂（与列表四量口径一致）。
 * ≤0 表示该行今日未领用出库（或已退/损/喂完），退回入库/当日损耗/饲料饲喂三项均应禁用。
 */
function rowRemaining(row: MatPickItemVO): number {
  return (
    Number(row.todayPicked || 0) - Number(row.todayReturned || 0) - Number(row.todayLoss || 0) - Number(row.todayFeed || 0)
  );
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listMatPick({
      belongType: activeBelongType.value,
      keyword: searchModel.keyword || undefined
    });
    const rows = (res.data ?? []) as MatPickItemVO[];
    // 行唯一 key：猪肉一产品一行（row24），其余业态同产品多库位 / 多地块需区分
    allRows.value = rows.map((r, i) => ({
      ...r,
      rowKey: `${r.productId}-${r.defaultLocationId ?? ''}-${r.earNo ?? ''}-${r.plotId ?? ''}-${i}`
    })) as MatPickItemVO[];
  } finally {
    loading.value = false;
  }
}

function handleTabChange() {
  pageNum.value = 1;
  fetchList();
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
}
function handleExport() {
  proxy?.download(
    '/djs/warehouse/matPick/export',
    { belongType: activeBelongType.value, keyword: searchModel.keyword || undefined },
    `生产物资领用_${new Date().getTime()}.xlsx`
  );
}

/* ---------------- 操作弹框 ---------------- */
const opVisible = ref(false);
const submitting = ref(false);
const opKind = ref<OpKind>('pick');
const opRow = ref<MatPickItemVO | null>(null);
const opFormRef = ref<FormInstance>();
const opForm = reactive<{ quantity: number | undefined; remark: string }>({
  quantity: undefined,
  remark: ''
});

/** 猪肉产品行操作：行已到 (产品,耳号) 粒度、篮唯一（row55/56），弹框只反显耳号、不再选源篮 */
const isPorkOp = computed(() => activeBelongType.value === 'pork');

/** row56：领用出库弹框数量字段文案改「领用量」；退回/损耗/饲喂仍用「数量」 */
const quantityLabel = computed(() => (opKind.value === 'pick' ? t('matPick.field.pickQuantity') : t('matPick.field.quantity')));

/** 弹框展示的「当前库存」= 该行（该产品该耳号篮）当前库存 */
const opStock = computed(() => opRow.value?.currentStock ?? '0');

const opRules = computed<FormRules>(() => ({
  quantity: [{ required: true, message: t('matPick.rule.quantityRequired'), trigger: 'blur' }]
}));

const opTitle = computed(() => {
  const map: Record<OpKind, string> = {
    pick: t('matPick.action.pick'),
    return: t('matPick.action.return'),
    loss: t('matPick.action.loss'),
    feed: t('matPick.action.feed')
  };
  return map[opKind.value];
});

function openOp(kind: OpKind, row: MatPickItemVO) {
  opKind.value = kind;
  opRow.value = row;
  opForm.quantity = undefined;
  opForm.remark = '';
  opVisible.value = true;
}

async function submitOp() {
  await opFormRef.value?.validate();
  const row = opRow.value;
  if (!row || opForm.quantity === undefined) return;
  const qty = opForm.quantity;
  // row40.2#1：领用/饲喂前置校验——消耗量不能超过当前库存（对齐 mp「库存不足」；后端行锁仍是最终权威）。
  //   opStock 猪肉取选中篮余量、其余取行库存。退回/损耗不在此校验（后端 row38 按篮 today 领用剩余保底）。
  if ((opKind.value === 'pick' || opKind.value === 'feed') && qty > Number(opStock.value || 0)) {
    proxy?.$modal.msgWarning(t('matPick.message.stockInsufficient'));
    return;
  }
  // row102：退回入库 / 当日损耗 / 饲料饲喂 前置校验——三者都消耗「今日领用剩余量」
  //   （今日出库−退回−损耗−饲喂，与列表展示四量口径一致），非仓库库存。
  //   ① 必须先「领用出库」：今日无领用剩余量（remaining<=0）时禁止录入这三项；
  //   ② 单次录入不能超过今日领用剩余；
  //   ③ 三项联动：某项录入后 remaining 随列表刷新自动减少，其他项可录量同步收窄。
  //   （猪肉按篮 / 果蔬按地块的最终权威仍是后端 ensureTodayCapacity，此为行级前置软校验友好提示。）
  if (opKind.value === 'return' || opKind.value === 'loss' || opKind.value === 'feed') {
    const remaining = rowRemaining(row);
    if (remaining <= 0) {
      proxy?.$modal.msgWarning(t('matPick.message.noPickedRemaining'));
      return;
    }
    if (qty > remaining) {
      proxy?.$modal.msgWarning(t('matPick.message.exceedRemaining', { remaining: Number(remaining.toFixed(3)) }));
      return;
    }
  }
  // row40.2#2：领用前置软校验——原材料无对应生产成品则阻断（对齐 mp 友好提示；后端 row40.1 已硬拦兜底）。
  if (opKind.value === 'pick') {
    try {
      const res = await canIssueMaterial({
        productId: row.plotId ? undefined : row.productId,
        plotId: row.plotId || undefined
      });
      if (res.data === false) {
        proxy?.$modal.msgWarning(t('matPick.message.noFinishedProduct'));
        return;
      }
    } catch {
      // 校验端点异常不阻断领用（后端 pick 会硬拦），优雅降级
    }
  }
  // 猪肉产品行（row55/56）：行已到 (产品,耳号) 粒度、篮唯一，batchId / locationId 直接取行上值（弹框不再选源篮）；
  // 非猪肉行粒度：库位取该行 defaultLocationId。
  const locationId = row.defaultLocationId;
  submitting.value = true;
  try {
    // batchId = 该行篮 location_stock.id → 后端走 pickByBatch/returnByBatch/lossByBatch 精确篮扣减：
    //  · 猪肉（耳号/白条篮）：写该篮 ear_no/white_bar_no，防「点耳号 A 却 FIFO 扣到耳号 B 篮」的串扣（row126）。
    //  · 自产果蔬（地块篮，row.plotId 非空）：退回/损耗回传本地块篮 batchId → 后端 isVegPlotBasket 命中走
    //    returnVegPlot/lossVegPlot（流水写 plot_id + 按地块校验/扣今日领用剩余），防同库位多地块互相 leak
    //    退回/损耗、防 B 地块无领用剩余却退回扣到 A 地块（row67/68/69）。
    //  · 其余业态（包材/鸡蛋/干货/其他/外购果蔬无地块）按 product 维度扣减，不回传 batchId（避免无意义产 inhouse）。
    // pick 领用：猪肉走 batchId、自产果蔬走既有 plotId 地块路径（productId 置空），二者互斥。
    const isVegPlotRow = !!row.plotId;
    const pickBatchId = isPorkOp.value ? row.batchId || undefined : undefined;
    const returnLossBatchId = isPorkOp.value || isVegPlotRow ? row.batchId || undefined : undefined;
    if (opKind.value === 'pick') {
      await pickMat({
        productId: row.plotId ? undefined : row.productId,
        plotId: row.plotId || undefined,
        batchId: pickBatchId,
        locationId,
        quantity: qty,
        stockOutDest: 'kitchen',
        sourceScene: 'warehouse',
        remark: opForm.remark || undefined
      });
    } else if (opKind.value === 'return') {
      await returnMat({
        productId: row.productId,
        batchId: returnLossBatchId,
        locationId,
        quantity: qty,
        sourceScene: 'warehouse',
        remark: opForm.remark || undefined
      });
    } else if (opKind.value === 'loss') {
      await lossMat({
        productId: row.productId,
        batchId: returnLossBatchId,
        locationId: locationId as string,
        quantity: qty,
        remark: opForm.remark || undefined
      });
    } else {
      // 饲喂与退回/损耗同款：自产果蔬 veg-plot 行（row.plotId 非空）回传 batchId + plotId → 后端 feedByBatch
      //   命中 isVegPlotBasket 走 feedVegPlot（按地块剥离今天待打包 WIP），本行今日领用剩余按地块口径校验（row16）。
      await feedMat({
        productId: row.productId,
        plotId: row.plotId || undefined,
        batchId: returnLossBatchId,
        locationId: locationId as string,
        quantity: qty,
        remark: opForm.remark || undefined
      });
    }
    proxy?.$modal.msgSuccess(t('matPick.message.success'));
    opVisible.value = false;
    fetchList();
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  fetchList();
});
</script>
