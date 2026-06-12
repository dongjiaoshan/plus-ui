<!--
  需求确认页业态摘要条（DJS-FIX-ADMIN-W22-003）。

  4 业态顶部各显示一行最关键的"能不能确认"信号：
   - white_bar：可出栏育肥猪头数（=0 → warning 黄条提示）
   - vegetable：进行中地块 / 待产量 / 最早采摘 / 当前库存
   - gift_box：当前礼盒库存（V1 用 product_info.belong_type='gift_box' 关联 location_stock 兜底）
   - other：原料库存 kg（product_attr=2 合计）
-->
<template>
  <el-alert v-if="!error" :type="alertType" :closable="false" show-icon style="margin-bottom: 12px">
    <template #title>
      <span v-if="loading">{{ t('demand.summary.loading') }}</span>
      <span v-else-if="(productType === 'white_bar' || productType === 'pig') && summary">
        {{ t('demand.summary.whiteBar', { count: summary.availablePigs ?? 0 }) }}
      </span>
      <span v-else-if="productType === 'vegetable' && summary">
        {{
          t('demand.summary.vegetable', {
            plot: summary.plotCount ?? 0,
            yield: formatKg(summary.expectedYieldKg),
            pickDate: summary.earliestPickDate ?? '-',
            stock: formatKg(summary.currentStockKg)
          })
        }}
      </span>
      <span v-else-if="productType === 'gift_box' && summary">
        {{ t('demand.summary.giftBox', { count: formatNum(summary.giftBoxStock) }) }}
      </span>
      <span v-else-if="(productType === 'other' || productType === 'dry' || productType === 'egg') && summary">
        {{ t('demand.summary.other', { stock: formatKg(summary.rawMaterialStockKg) }) }}
      </span>
    </template>
  </el-alert>
  <el-alert v-else type="error" :closable="false" show-icon :title="t('demand.summary.loadFailed')" style="margin-bottom: 12px" />
</template>

<script setup lang="ts">
import type { DemandProductType, DemandSummaryVO } from '@/api/djs-warehouse/demand/types';
import { getDemandSummary } from '@/api/djs-warehouse/demand';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ productType: DemandProductType }>();
const { t } = useI18n();

const summary = ref<DemandSummaryVO | null>(null);
const loading = ref<boolean>(true);
const error = ref<boolean>(false);

const alertType = computed<'success' | 'warning' | 'info' | 'error'>(() => {
  // 白条 / 猪 0 头时 warning 提示，其他业态用 info 中性
  if ((props.productType === 'white_bar' || props.productType === 'pig') && summary.value && (summary.value.availablePigs ?? 0) === 0) {
    return 'warning';
  }
  return 'info';
});

function formatKg(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '0';
  const n = typeof v === 'string' ? Number(v) : v;
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

function formatNum(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '0';
  const n = typeof v === 'string' ? Number(v) : v;
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString('zh-CN');
}

async function load() {
  loading.value = true;
  error.value = false;
  try {
    const res = await getDemandSummary(props.productType);
    summary.value = res.data;
  } catch (e) {
    error.value = true;
    summary.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

defineExpose({ refresh: load });
</script>
