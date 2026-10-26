<template>
  <el-drawer v-model="visible" :title="drawerTitle" direction="rtl" size="60%" append-to-body destroy-on-close>
    <div class="mb-2 flex justify-end">
      <el-button
        v-hasPermi="['djs:warehouse:cutOutDaily:export']"
        type="warning"
        plain
        icon="Download"
        :disabled="!list.length"
        @click="handleExport"
      >
        {{ t('cutOutDaily.detail.export') }}
      </el-button>
    </div>
    <el-table v-loading="loading" :data="list" border size="small">
      <el-table-column :label="t('cutOutDaily.detail.productCode')" prop="productCode" min-width="120" align="center" />
      <el-table-column :label="t('cutOutDaily.detail.productName')" prop="productName" min-width="160" align="center" show-overflow-tooltip />
      <el-table-column :label="t('cutOutDaily.detail.quantity')" prop="quantity" min-width="100" align="center">
        <template #default="{ row }">{{ formatQtyByUnit((row as CutOutDailyDetailVO).quantity, 'kg') }}</template>
      </el-table-column>
      <el-table-column :label="t('cutOutDaily.detail.unit')" prop="unit" min-width="70" align="center" />
      <el-table-column :label="t('cutOutDaily.detail.earNo')" prop="earNo" min-width="120" align="center" show-overflow-tooltip />
      <el-table-column :label="t('cutOutDaily.detail.outTime')" prop="outTime" min-width="160" align="center" />
    </el-table>
  </el-drawer>
</template>

<script setup lang="ts">
/**
 * 猪肉日分割出库统计「查看」抽屉（V7-R6）：被点击那一行（某天 × 某去向 / 某门店）的逐条出库记录。
 *
 * 后端明细与汇总共用同一份 WHERE，逐条加起来等于该行出库总重量；导出与抽屉同源同参。
 */
import {
  CUT_OUT_DAILY_DETAIL_EXPORT_URL,
  getCutOutDailyDetail,
  type CutOutDailyDetailQuery,
  type CutOutDailyDetailVO,
  type CutOutDailyVO
} from '@/api/djs-warehouse/cutOutDaily';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'CutOutDetailDrawer' });

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const loading = ref(false);
const list = ref<CutOutDailyDetailVO[]>([]);
/** 被点击那一行的分组键（打开时定格） */
const params = ref<CutOutDailyDetailQuery>({ statDate: '', destType: 'warehouse' });
/** 标题里的去向文案：门店需求行显示门店名，仓库出库行显示出库去向 */
const destText = ref('');

const drawerTitle = computed(() => `${t('cutOutDaily.detail.title')}（${params.value.statDate} ${destText.value}）`);

/**
 * 打开某一行的明细。
 *
 * 仓库出库行传出库去向**原始值** outDest（列上显示的是翻译后的 label，「未指定」是后端兜出来的，拿它回查匹配不到）；
 * 门店需求行传 storeId。
 */
function open(row: CutOutDailyVO) {
  params.value =
    row.destType === 'store'
      ? { statDate: row.statDate, destType: 'store', storeId: row.storeId }
      : { statDate: row.statDate, destType: 'warehouse', outDest: row.outDest ?? '' };
  destText.value = row.destType === 'store' ? `${row.outDestLabel ?? ''} / ${row.storeName ?? ''}` : (row.outDestLabel ?? '');
  list.value = [];
  visible.value = true;
  fetchList();
}

async function fetchList() {
  loading.value = true;
  try {
    // request 拦截器已剥掉 axios 外壳，实际是 R<List> 业务体
    const res = (await getCutOutDailyDetail(params.value)) as unknown as { data?: CutOutDailyDetailVO[] };
    list.value = res.data ?? [];
  } finally {
    loading.value = false;
  }
}

/** 一键导出：与抽屉列表同一组参数 */
function handleExport() {
  proxy?.download(CUT_OUT_DAILY_DETAIL_EXPORT_URL, { ...params.value }, `${t('cutOutDaily.detail.exportFileName')}_${params.value.statDate}.xlsx`);
}

defineExpose({ open });
</script>
