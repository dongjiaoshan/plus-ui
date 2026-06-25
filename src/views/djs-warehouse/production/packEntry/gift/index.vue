<template>
  <div class="p-2">
    <!-- 顶部「可用礼盒组件」池：肉品/果蔬/其他打包时「发送位置=礼盒」产出的生产产品（按产品聚合可用量）。
         成功打包一盒礼盒后 @submitted 重拉，对应组件可用量相应减少（Kevin 2026-06-25）。 -->
    <div v-loading="poolLoading" class="gift-pool-bar">
      <span class="pool-title">{{ t('djs.warehouse.packEntry.giftPoolTitle') }}</span>
      <template v-if="pool.length">
        <el-tag
          v-for="item in pool"
          :key="String(item.productId)"
          size="large"
          class="pool-tag mr-1 mb-1"
          type="success"
          effect="plain"
        >
          {{ item.productName }} {{ fmtQty(item.availableQty) }}{{ item.productUnit || '' }}
        </el-tag>
      </template>
      <span v-else class="pool-empty">{{ t('djs.warehouse.packEntry.giftPoolEmpty') }}</span>
    </div>

    <!-- 礼盒打包：直接列出全部礼盒产品（product_type=3 / belong_type='gift_box'），右台输盒数（packBoxCount）。
         组件 = 上方「可用礼盒组件」池（deliver_dest='gift' 生产产品），service FIFO 扣减、不扣 location_stock。
         无来源选择（kind='gift' 模板隐藏来源区）、无追溯码打印。
         发送位置=发货月台（礼盒是终端成品、打包后须发往门店，deliver_dest='platform' 进发货月台；
         礼盒不能再作为别的礼盒的组件，故只此一项，Kevin 2026-06-25）。 -->
    <SkuPackForm
      kind="gift"
      :product-type="3"
      belong-type="gift_box"
      :send-dest-kinds="['platform']"
      :show-print-trace="false"
      :title="t('djs.warehouse.packEntry.giftTitle')"
      wide
      @submitted="loadPool"
    />
  </div>
</template>

<script setup name="PackEntryGift" lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';
import { listGiftComponentStock } from '@/api/djs-warehouse/packEntry';
import type { GiftComponentStockVO } from '@/api/djs-warehouse/packEntry';

const { t } = useI18n();

const pool = ref<GiftComponentStockVO[]>([]);
const poolLoading = ref(false);

/** 可用量去尾零（避免 1.500）。 */
function fmtQty(v: number | string | undefined): string {
  const n = Number(v);
  return Number.isFinite(n) ? String(Math.round(n * 1000) / 1000) : String(v ?? '');
}

/** 拉「可用礼盒组件」池（onMounted + 每次打包成功后由 SkuPackForm @submitted 触发刷新）。 */
async function loadPool() {
  poolLoading.value = true;
  try {
    const res = await listGiftComponentStock();
    pool.value = (res.data ?? []) as GiftComponentStockVO[];
  } finally {
    poolLoading.value = false;
  }
}

onMounted(loadPool);
</script>

<style scoped>
.gift-pool-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-light);
}
.pool-title {
  flex: 0 0 auto;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-right: 4px;
}
.pool-tag {
  font-size: 14px;
}
.pool-empty {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
