<template>
  <div v-loading="loading" class="location-card-grid">
    <el-row :gutter="12">
      <el-col v-for="card in cards" :key="String(card.locationId)" :xs="12" :sm="12" :md="6" :lg="6" class="mb-3">
        <el-card
          shadow="hover"
          class="location-card location-card--clickable"
          :body-style="{ padding: '12px 14px' }"
          @click="openStockDrawer(card)"
        >
          <div class="location-card__header">
            <span class="location-card__name">{{ card.locationName }}</span>
            <dict-tag :options="djs_location_type" :value="card.locationType" />
          </div>
          <div class="location-card__metric">
            <span class="location-card__metric-label">{{ t('location.summary.currentStock') }}</span>
            <span class="location-card__metric-value">{{ formatQty(card.currentStock) }}</span>
          </div>
          <div class="location-card__row">
            <span class="location-card__row-item">
              <span class="location-card__row-label">{{ t('location.summary.todayIn') }}</span>
              <span class="location-card__row-value text-success">+{{ formatQty(card.todayInQty) }}</span>
            </span>
            <span class="location-card__row-item">
              <span class="location-card__row-label">{{ t('location.summary.todayOut') }}</span>
              <span class="location-card__row-value text-danger">-{{ formatQty(card.todayOutQty) }}</span>
            </span>
          </div>
          <div class="location-card__check">
            <span class="location-card__check-left">
              <span class="location-card__row-label">{{ t('location.summary.lastCheck') }}</span>
              <template v-if="card.lastCheckDate">
                <span class="location-card__check-date">{{ formatDate(card.lastCheckDate) }}</span>
              </template>
              <span v-else class="text-gray-400">{{ t('location.summary.noCheck') }}</span>
            </span>
            <dict-tag
              v-if="card.lastCheckDate && card.lastCheckResult != null"
              :options="djs_check_result"
              :value="card.lastCheckResult"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- V6 row136：点卡片从右侧滑出该库位的逐产品库存明细 -->
    <LocationStockDrawer ref="stockDrawerRef" />
  </div>
</template>

<script setup name="LocationCardGrid" lang="ts">
import { getLocationSummary } from '@/api/djs-warehouse/location';
import type { LocationCardSummaryVO } from '@/api/djs-warehouse/location/types';
import LocationStockDrawer from './LocationStockDrawer.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_location_type, djs_check_result } = toRefs<Record<string, any>>(proxy?.useDict('djs_location_type', 'djs_check_result'));

const loading = ref(false);
const cards = ref<LocationCardSummaryVO[]>([]);
const stockDrawerRef = ref<InstanceType<typeof LocationStockDrawer>>();

/** V6 row136：点库位卡片 → 右侧抽屉列该库位的逐产品库存明细 */
function openStockDrawer(card: LocationCardSummaryVO) {
  stockDrawerRef.value?.open(card.locationId, card.locationName);
}

/** 库存 / 出入库量统一格式化（后端 BigDecimal 序列化可能是 string） */
function formatQty(v: number | string | undefined): string {
  if (v === undefined || v === null || v === '') return '0';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : String(n);
}

/** 盘点日期取日（yyyy-MM-dd） */
function formatDate(v: string): string {
  return v.length >= 10 ? v.slice(0, 10) : v;
}

async function loadSummary() {
  loading.value = true;
  try {
    const res = await getLocationSummary();
    cards.value = (res.data ?? []) as LocationCardSummaryVO[];
  } finally {
    loading.value = false;
  }
}

defineExpose({ refresh: loadSummary });

onMounted(() => {
  loadSummary();
});
</script>

<style scoped lang="scss">
.location-card-grid {
  margin-bottom: 8px;
}

.location-card {
  &--clickable {
    cursor: pointer;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 8px;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__metric {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 6px;

    &-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &-value {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }

  &__row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;

    &-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    &-label {
      color: var(--el-text-color-secondary);
    }

    &-value {
      font-weight: 600;
    }
  }

  &__check {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__check-left {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  &__check-date {
    color: var(--el-text-color-primary);
  }
}
</style>
