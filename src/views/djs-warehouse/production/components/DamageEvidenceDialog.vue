<template>
  <!-- 查看损坏（只读）：展示损坏凭证图集 + 损坏备注（规则1：close-on-click-modal 默认开） -->
  <el-dialog v-model="visible" :title="t('djs.warehouse.production.damage.viewTitle')" width="640px" destroy-on-close append-to-body>
    <el-descriptions :column="1" border>
      <el-descriptions-item :label="t('djs.warehouse.production.column.produceNo')">
        {{ produceNo || '-' }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.production.damage.evidence')">
        <div v-if="loading" class="text-gray-400">{{ t('djs.warehouse.production.damage.loading') }}</div>
        <div v-else-if="imageUrls.length" class="flex flex-wrap gap-2">
          <!-- 每张缩略图都挂同一组 preview-src-list，点任意一张可在大图里左右切换 -->
          <el-image
            v-for="(url, idx) in imageUrls"
            :key="idx"
            :src="url"
            fit="cover"
            class="damage-thumb"
            :initial-index="idx"
            :preview-src-list="imageUrls"
            preview-teleported
          />
        </div>
        <span v-else class="text-gray-400">{{ t('djs.warehouse.production.damage.noEvidence') }}</span>
      </el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.production.damage.remark')">
        {{ remark || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="DamageEvidenceDialog" lang="ts">
import { listByIds as listOssByIds } from '@/api/system/oss';
import type { ProductProductionVO } from '@/api/djs-warehouse/production/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const visible = ref(false);
const loading = ref(false);
const produceNo = ref<string>('');
const remark = ref<string>('');
const imageUrls = ref<string[]>([]);

/** 把损坏凭证 ossId CSV 解析成可预览 url（一次 listByIds 拉全量，按原序取，丢弃解析不到的）。 */
async function loadImageUrls(evidenceOssIds?: string) {
  imageUrls.value = [];
  const ids = (evidenceOssIds ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
  if (ids.length === 0) return;
  loading.value = true;
  try {
    const res = await listOssByIds(ids.join(','));
    const map: Record<string, string> = {};
    (res.data ?? []).forEach((o: any) => {
      if (o?.ossId != null && o?.url) {
        map[String(o.ossId)] = o.url;
      }
    });
    imageUrls.value = ids.map((id) => map[id]).filter((u): u is string => !!u);
  } finally {
    loading.value = false;
  }
}

/** 父列表「查看损坏」调用：传入逐件生产记录行 */
function open(row: ProductProductionVO) {
  produceNo.value = row.produceNo ?? '';
  remark.value = row.damageRemark ?? '';
  visible.value = true;
  loadImageUrls(row.damageEvidenceOssIds);
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.damage-thumb {
  width: 86px;
  height: 86px;
  border-radius: 5px;
  cursor: pointer;
  background-color: #ebeef5;
}
</style>
