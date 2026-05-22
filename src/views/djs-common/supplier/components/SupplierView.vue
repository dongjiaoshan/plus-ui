<template>
  <el-dialog v-model="visible" :title="t('supplier.title.view')" destroy-on-close append-to-body width="820px">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t('supplier.title.view')" name="info">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('supplier.column.supplierCode')">{{ data.supplierCode || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.supplierName')">{{ data.supplierName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.supplierType')">
            <dict-tag :options="djs_supplier_type" :value="data.supplierType" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.businessStatus')">
            <dict-tag :options="djs_supplier_status" :value="data.businessStatus" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.licenseNo')">{{ data.licenseNo || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.businessLicenseNo')">{{ data.businessLicenseNo || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.cooperationStartDate')">{{ data.cooperationStartDate || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.settleType')">
            <dict-tag :options="djs_settle_type" :value="data.settleType" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.liaisonName')">{{ data.liaisonName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.liaisonPhone')">{{ data.liaisonPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.bankName')">{{ data.bankName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.bankAccount')">{{ data.bankAccount || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.column.dealCount')">{{ data.dealCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.column.purchaseQty')">{{ data.purchaseQty ?? 0 }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.address')" :span="2">{{ data.address || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.licenseImage')" :span="2">
            <image-preview v-if="data.licenseImageOssId" :src="String(data.licenseImageOssId)" :width="160" :height="120" />
            <el-text v-else type="info">-</el-text>
          </el-descriptions-item>
          <el-descriptions-item :label="t('supplier.field.remark')" :span="2">{{ data.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane :label="t('supplier.title.deals')" name="deals">
        <!-- V1 stub：交易明细预留 tab，下游 BRD-MED / WMS-PURCHASE 落地后接 GET /djs/common/supplier/{id}/deals -->
        <el-empty :description="t('supplier.empty.deals')" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getSupplier } from '@/api/djs-common/supplier';
import type { SupplierVO } from '@/api/djs-common/supplier/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_supplier_type, djs_supplier_status, djs_settle_type } = toRefs<any>(
  proxy?.useDict('djs_supplier_type', 'djs_supplier_status', 'djs_settle_type')
);

const visible = ref(false);
const activeTab = ref('info');
const data = ref<Partial<SupplierVO>>({});

const open = async (id: number | string) => {
  const res = await getSupplier(id);
  data.value = res.data || {};
  activeTab.value = 'info';
  visible.value = true;
};

defineExpose({ open });
</script>
