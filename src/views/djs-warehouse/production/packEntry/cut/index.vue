<template>
  <div class="p-2">
    <el-card shadow="never" class="pack-card">
      <template #header>
        <span class="font-bold">{{ t('djs.warehouse.packEntry.cutTitle') }}</span>
      </template>

      <el-alert :title="t('djs.warehouse.packEntry.cutHint')" type="info" :closable="false" class="mb-3" show-icon />

      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="max-w-3xl">
        <!-- 选分割单（猪只耳号；来源 cut_record picked/cutting） -->
        <el-form-item :label="t('djs.warehouse.packEntry.cutRecord')" prop="cutRecordId">
          <el-select
            v-model="form.cutRecordId"
            filterable
            clearable
            :loading="cuttableLoading"
            :placeholder="t('djs.warehouse.packEntry.cutRecordPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="r in cuttable" :key="String(r.id)" :label="`${r.cutId} / 耳号 ${r.earNo ?? '-'} / ${r.cutStatus}`" :value="r.id" />
          </el-select>
        </el-form-item>

        <!-- 入冻品库位 -->
        <el-form-item :label="t('djs.warehouse.packEntry.location')" prop="locationId">
          <el-select
            v-model="form.locationId"
            filterable
            clearable
            :loading="locationLoading"
            :placeholder="t('djs.warehouse.packEntry.locationPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="l in locations" :key="String(l.id)" :label="`${l.locationCode} - ${l.locationName}`" :value="l.id" />
          </el-select>
        </el-form-item>

        <!-- 分割产品明细（多行）：按具体产品（冻五花肉/排骨/肘子/大排 等 belong_type=pork） -->
        <el-form-item :label="t('djs.warehouse.packEntry.parts')">
          <div class="w-full">
            <el-table :data="form.partItems" border size="small">
              <el-table-column :label="t('djs.warehouse.packEntry.cutProduct')" min-width="200">
                <template #default="{ row }">
                  <el-select
                    v-model="row.productId"
                    filterable
                    :loading="porkProductLoading"
                    :placeholder="t('djs.warehouse.packEntry.cutProductPlaceholder')"
                    style="width: 100%"
                  >
                    <el-option v-for="p in porkProducts" :key="String(p.id)" :label="`${p.productId} - ${p.productName}`" :value="p.id" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column :label="t('djs.warehouse.packEntry.productWeight')" min-width="160">
                <template #default="{ row }">
                  <el-input-number v-model="row.productWeight" :min="0.001" :precision="3" :step="1" controls-position="right" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column :label="t('djs.warehouse.packEntry.productSpec')" min-width="140">
                <template #default="{ row }">
                  <el-input v-model="row.productSpec" maxlength="64" />
                </template>
              </el-table-column>
              <el-table-column :label="t('common.operate')" width="80">
                <template #default="{ $index }">
                  <el-button link type="danger" :disabled="form.partItems.length <= 1" @click="removePart($index)">
                    {{ t('common.delete') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button class="mt-2" @click="addPart">{{ t('djs.warehouse.packEntry.addPart') }}</el-button>
          </div>
        </el-form-item>

        <el-form-item :label="t('djs.warehouse.packEntry.proof')">
          <OssUpload ref="ossRef" v-model="proofModel" biz-type="warehouse_pig_cut" :limit="5" :file-size="10" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="cutOutSubmitting" @click="handleCutOut">
            {{ t('djs.warehouse.packEntry.confirmCutOut') }}
          </el-button>
          <el-button type="success" :loading="cutDoneSubmitting" @click="openCutDone">
            {{ t('djs.warehouse.packEntry.finishCut') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 白条完成分割（滴水损失） -->
    <el-dialog v-model="cutDoneVisible" :title="t('djs.warehouse.packEntry.finishCut')" width="420px" append-to-body destroy-on-close>
      <el-form ref="doneFormRef" :model="doneForm" :rules="doneRules" label-width="110px">
        <el-form-item :label="t('djs.warehouse.packEntry.dripLoss')" prop="dripLoss">
          <el-input-number v-model="doneForm.dripLoss" :min="0" :precision="3" :step="0.1" controls-position="right" style="width: 200px" />
          <span class="ml-2 text-gray-500">kg</span>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.packEntry.remark')" prop="remark">
          <el-input v-model="doneForm.remark" type="textarea" :rows="2" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="cutDoneSubmitting" @click="handleCutDone">{{ t('common.confirm') }}</el-button>
        <el-button @click="cutDoneVisible = false">{{ t('common.cancel') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PackEntryCut" lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import OssUpload from '@/components/OssUpload/index.vue';
import { usePackEntryOptions } from '../useOptions';
import { listCuttable, submitCutDone, submitCutOut } from '@/api/djs-warehouse/packEntry';
import type { CutPartItem, PigCutRecordVO } from '@/api/djs-warehouse/packEntry';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';

const { t } = useI18n();

const { locations, locationLoading, loadLocations } = usePackEntryOptions();

// 可选分割产品（按具体产品对齐原型，Kevin 定）：产品主数据 belong_type=pork 的猪肉分割成品
// （冻五花肉/排骨/肘子/大排 等）。未 seed 时下拉为空——见 _open-issues ❓「分割成品主数据来源」。
const porkProducts = ref<ProductInfoVO[]>([]);
const porkProductLoading = ref(false);

async function loadPorkProducts() {
  porkProductLoading.value = true;
  try {
    const res = await listProduct({ pageNum: 1, pageSize: 500, belongType: 'pork' } as any);
    porkProducts.value = ((res as any).rows ?? []) as ProductInfoVO[];
  } finally {
    porkProductLoading.value = false;
  }
}

const cuttable = ref<PigCutRecordVO[]>([]);
const cuttableLoading = ref(false);

async function loadCuttable() {
  cuttableLoading.value = true;
  try {
    const res = await listCuttable();
    cuttable.value = ((res as any).data ?? []) as PigCutRecordVO[];
  } finally {
    cuttableLoading.value = false;
  }
}

interface CutFormShape {
  cutRecordId: number | string | '';
  locationId: number | string | '';
  partItems: CutPartItem[];
  proofOssIds: string | undefined;
}

const newPart = (): CutPartItem => ({ productId: undefined, productWeight: undefined as unknown as number, productSpec: undefined });

const defaultForm = (): CutFormShape => ({
  cutRecordId: '',
  locationId: '',
  partItems: [newPart()],
  proofOssIds: undefined
});

const form = ref<CutFormShape>(defaultForm());
const formRef = ref<any>();
const ossRef = ref<InstanceType<typeof OssUpload>>();
const cutOutSubmitting = ref(false);

const proofModel = computed<string[]>({
  get: () => (form.value.proofOssIds ? form.value.proofOssIds.split(',').filter(Boolean) : []),
  set: (val: string[]) => {
    form.value.proofOssIds = val && val.length > 0 ? val.join(',') : undefined;
  }
});

const rules = computed(() => ({
  cutRecordId: [{ required: true, message: t('djs.warehouse.packEntry.cutRecordRequired'), trigger: 'change' }],
  locationId: [{ required: true, message: t('djs.warehouse.packEntry.locationRequired'), trigger: 'change' }]
}));

function addPart() {
  form.value.partItems.push(newPart());
}
function removePart(idx: number) {
  form.value.partItems.splice(idx, 1);
}

async function handleCutOut() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    const parts = form.value.partItems.filter((p) => p.productId && p.productWeight && p.productWeight > 0);
    if (parts.length === 0) {
      ElMessage.warning(t('djs.warehouse.packEntry.partsRequired'));
      return;
    }
    cutOutSubmitting.value = true;
    try {
      await submitCutOut({
        cutRecordId: form.value.cutRecordId as number | string,
        locationId: form.value.locationId as number | string,
        partItems: parts,
        proofOssIds: form.value.proofOssIds
      });
      ElMessage.success(t('djs.warehouse.packEntry.cutOutSuccess'));
      await loadCuttable();
    } finally {
      cutOutSubmitting.value = false;
    }
  });
}

// ---- 白条完成分割 ----
const cutDoneVisible = ref(false);
const cutDoneSubmitting = ref(false);
const doneFormRef = ref<any>();
const doneForm = ref<{ dripLoss: number | undefined; remark: string | undefined }>({ dripLoss: 0, remark: undefined });

const doneRules = computed(() => ({
  dripLoss: [{ required: true, message: t('djs.warehouse.packEntry.dripLossRequired'), trigger: 'blur' }]
}));

function openCutDone() {
  if (!form.value.cutRecordId) {
    ElMessage.warning(t('djs.warehouse.packEntry.cutRecordRequired'));
    return;
  }
  doneForm.value = { dripLoss: 0, remark: undefined };
  cutDoneVisible.value = true;
}

async function handleCutDone() {
  if (!doneFormRef.value) return;
  await doneFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    cutDoneSubmitting.value = true;
    try {
      await submitCutDone({
        cutRecordId: form.value.cutRecordId as number | string,
        dripLoss: doneForm.value.dripLoss as number,
        proofOssIds: form.value.proofOssIds,
        remark: doneForm.value.remark
      });
      ElMessage.success(t('djs.warehouse.packEntry.finishCutSuccess'));
      cutDoneVisible.value = false;
      form.value = defaultForm();
      ossRef.value?.setExistingFiles?.([]);
      await loadCuttable();
    } finally {
      cutDoneSubmitting.value = false;
    }
  });
}

onMounted(async () => {
  await Promise.all([loadLocations(), loadCuttable(), loadPorkProducts()]);
});
</script>

<style scoped>
.pack-card {
  margin: 8px;
}
.max-w-3xl {
  max-width: 760px;
}
</style>
