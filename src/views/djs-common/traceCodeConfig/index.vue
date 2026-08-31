<template>
  <div class="p-2">
    <!--
      追溯码配置管理（V6-R146）
      甲方口径：不需要搜索条件；列表 = 追溯码名称 / 基地介绍页图片 / 更新时间 / 更新人 / 操作；
      操作列只有「上传图片」。猪肉、果蔬两行由迁移预置，页面不提供新增 / 删除 / 导出。
      BizTable 的 showAdd / showBatchDel / showRowEdit / showRowDel 默认全是 true，必须逐个显式关掉。
    -->
    <BizTable
      :data="list"
      :total="0"
      :loading="loading"
      :columns="columns"
      :search-schema="[]"
      row-key="id"
      :show-add="false"
      :show-batch-del="false"
      :show-export="false"
      :show-row-edit="false"
      :show-row-del="false"
      :action-width="140"
      perm-prefix="djs:common:traceCodeConfig"
      @search="fetchList"
    >
      <template #cell-baseIntroImageUrl="{ row }">
        <el-image
          v-if="row.baseIntroImageUrl"
          :src="row.baseIntroImageUrl"
          :preview-src-list="[row.baseIntroImageUrl]"
          preview-teleported
          fit="cover"
          class="intro-thumb"
        />
        <span v-else class="intro-empty">{{ t('traceCodeConfig.empty.image') }}</span>
      </template>

      <template #action="{ row }">
        <el-button v-hasPermi="['djs:common:traceCodeConfig:upload']" link type="primary" icon="Upload" @click="handleUpload(row)">
          {{ t('traceCodeConfig.action.upload') }}
        </el-button>
      </template>
    </BizTable>

    <BaseIntroImageDialog ref="dialogRef" @success="fetchList" />
  </div>
</template>

<script setup name="TraceCodeConfig" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn } from '@/components/BizTable/types';
import BaseIntroImageDialog from './components/BaseIntroImageDialog.vue';
import { listTraceCodeConfig } from '@/api/djs-common/traceCodeConfig';
import type { TraceCodeConfigVO } from '@/api/djs-common/traceCodeConfig/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const dialogRef = ref<{ open: (row: { id: number | string; configName?: string }) => void }>();

const list = ref<TraceCodeConfigVO[]>([]);
const loading = ref(false);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'configName', label: t('traceCodeConfig.column.configName'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'baseIntroImageUrl', label: t('traceCodeConfig.column.baseIntroImage'), minWidth: 180 },
  { prop: 'updateTime', label: t('traceCodeConfig.column.updateTime'), width: 170, formatter: 'datetime' },
  { prop: 'updateByName', label: t('traceCodeConfig.column.updateBy'), width: 140 }
]);

async function fetchList() {
  loading.value = true;
  try {
    const res = await listTraceCodeConfig();
    list.value = res.data ?? [];
  } finally {
    loading.value = false;
  }
}

function handleUpload(row: BizRow) {
  dialogRef.value?.open({ id: row.id, configName: row.configName });
}

onMounted(fetchList);
</script>

<style lang="scss" scoped>
.intro-thumb {
  width: 90px;
  height: 60px;
  border-radius: 4px;
  cursor: zoom-in;
}
.intro-empty {
  color: var(--el-text-color-placeholder);
}
</style>
