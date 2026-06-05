<template>
  <el-dialog v-model="visible" :title="t('product.title.view')" destroy-on-close append-to-body width="820px">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t('product.title.baseInfo')" name="info">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('product.field.productId')">{{ data.productId || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productName')">{{ data.productName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productType')">
            <dict-tag :options="djs_product_type" :value="data.productType" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productUnit')">{{ data.productUnit || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productSpec')">{{ data.productSpec || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('product.field.belongType')">
            <dict-tag :options="djs_belong_type" :value="data.belongType" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.buyClass')">
            <dict-tag :options="djs_buy_class" :value="data.buyClass" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productAttr')">
            <dict-tag :options="djs_product_attr" :value="data.productAttr" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productWorkshop')">
            <dict-tag :options="djs_product_workshop" :value="data.productWorkshop" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productStatus')">
            <dict-tag :options="sys_normal_disable" :value="data.productStatus" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.isDelivery')">
            <dict-tag :options="djs_yes_no" :value="data.isDelivery" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.isBuyOut')">
            <dict-tag :options="djs_yes_no" :value="data.isBuyOut" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productThumb')" :span="2">
            <image-preview v-if="thumbUrl" :src="thumbUrl" :width="120" :height="120" />
            <el-text v-else type="info">-</el-text>
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productImg')" :span="2">
            <div v-if="imgUrls.length" class="flex flex-wrap gap-2">
              <image-preview v-for="(url, i) in imgUrls" :key="i" :src="url" :width="100" :height="100" />
            </div>
            <el-text v-else type="info">-</el-text>
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productDesc')" :span="2">{{ data.productDesc || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('product.field.remark')" :span="2">{{ data.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane v-if="data.productType === 3" :label="t('product.title.giftComponents')" name="gift">
        <el-table :data="data.giftComponents || []" border>
          <el-table-column type="index" :label="t('product.column.index')" width="60" align="center" />
          <el-table-column prop="componentProductName" :label="t('product.field.componentProductName')" min-width="180" show-overflow-tooltip />
          <el-table-column prop="componentCount" :label="t('product.field.componentCount')" width="120" align="right" />
          <el-table-column prop="componentUnit" :label="t('product.field.componentUnit')" width="100" align="center" />
          <template #empty>
            <el-empty :description="t('product.giftEmpty')" :image-size="60" />
          </template>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_product_type, djs_belong_type, djs_buy_class, djs_product_attr, djs_product_workshop, djs_yes_no, sys_normal_disable } = toRefs<any>(
  proxy?.useDict(
    'djs_product_type',
    'djs_belong_type',
    'djs_buy_class',
    'djs_product_attr',
    'djs_product_workshop',
    'djs_yes_no',
    'sys_normal_disable'
  )
);

const visible = ref(false);
const activeTab = ref('info');
const data = ref<Partial<ProductInfoVO>>({});
const thumbUrl = ref<string>('');
const imgUrls = ref<string[]>([]);

const open = async (id: number | string) => {
  const res = await getProduct(id);
  data.value = res.data || {};
  thumbUrl.value = '';
  imgUrls.value = [];
  activeTab.value = 'info';
  visible.value = true;
  // product VO 只有 ossId（productThumb 单图 / productImg 逗号分隔多图），必须 listByIds 回查 url
  const thumbId = data.value.productThumb;
  if (thumbId) {
    try {
      const ossRes = await listOssByIds(thumbId);
      thumbUrl.value = ossRes.data?.[0]?.url ?? '';
    } catch (e) {
      console.warn('[ProductView] listOssByIds failed for productThumb', thumbId, e);
    }
  }
  const imgIds = data.value.productImg;
  if (imgIds) {
    try {
      const ossRes = await listOssByIds(imgIds);
      imgUrls.value = (ossRes.data ?? []).map((o) => o.url).filter((u): u is string => !!u);
    } catch (e) {
      console.warn('[ProductView] listOssByIds failed for productImg', imgIds, e);
    }
  }
};

defineExpose({ open });
</script>
