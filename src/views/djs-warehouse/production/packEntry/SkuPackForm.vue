<template>
  <el-card shadow="never" class="pack-card">
    <template #header>
      <span class="font-bold">{{ title }}</span>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="max-w-3xl">
      <!-- 果蔬打包：顶部地块卡片选择（按来源 plotId 分组，选地块再选该地块来源） -->
      <el-form-item v-if="plotGroup" :label="t('djs.warehouse.packEntry.plot')">
        <div v-loading="sourceLoading || plotLoading" class="w-full">
          <el-radio-group v-if="plotGroups.length > 0" v-model="selectedPlotId" @change="onPlotChange">
            <el-radio-button v-for="g in plotGroups" :key="String(g.plotId)" :value="g.plotId">
              {{ g.label }}
            </el-radio-button>
          </el-radio-group>
          <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.noPlotSource') }}</span>
        </div>
      </el-form-item>

      <!-- 来源过程产品（果蔬=地块来源 / 肉品=白条耳号来源 / 其他=过程产品来源） -->
      <el-form-item v-if="kind !== 'gift'" :label="sourceLabel" prop="sourceInhouseId">
        <el-select
          v-model="form.sourceInhouseId"
          filterable
          clearable
          :loading="sourceLoading"
          :placeholder="t('djs.warehouse.packEntry.sourcePlaceholder')"
          style="width: 100%"
          @change="onSourceChange"
        >
          <el-option v-for="s in displaySources" :key="String(s.id)" :label="sourceOptionLabel(s)" :value="s.id" />
        </el-select>
      </el-form-item>

      <!-- 目标产品 SKU（果蔬/肉品/其他=普通 SKU；礼盒=礼盒 SKU） -->
      <el-form-item :label="kind === 'gift' ? t('djs.warehouse.packEntry.giftBox') : t('djs.warehouse.packEntry.targetProduct')" prop="productId">
        <el-select
          v-model="form.productId"
          filterable
          clearable
          :loading="productLoading"
          :placeholder="t('djs.warehouse.packEntry.targetProductPlaceholder')"
          style="width: 100%"
        >
          <el-option v-for="p in products" :key="String(p.id)" :label="`${p.productId} - ${p.productName}`" :value="p.id" />
        </el-select>
      </el-form-item>

      <!-- 重量（普通打包）/ 盒数（礼盒） -->
      <el-form-item v-if="kind === 'gift'" :label="t('djs.warehouse.packEntry.packBoxCount')" prop="packBoxCount">
        <el-input-number v-model="form.packBoxCount" :min="1" :precision="0" :step="1" controls-position="right" style="width: 220px" />
        <span class="ml-2 text-gray-500">{{ t('djs.warehouse.packEntry.box') }}</span>
      </el-form-item>
      <el-form-item v-else :label="t('djs.warehouse.packEntry.productWeight')" prop="productWeight">
        <el-input-number v-model="form.productWeight" :min="0.001" :precision="3" :step="1" controls-position="right" style="width: 220px" />
        <span class="ml-2 text-gray-500">{{ selectedUnit }}</span>
      </el-form-item>

      <!-- 单位（仅肉品/其他打包需手填 kg/个；果蔬固定 kg） -->
      <el-form-item v-if="kind === 'dry'" :label="t('djs.warehouse.packEntry.productUnit')" prop="productUnit">
        <el-radio-group v-model="form.productUnit">
          <el-radio value="kg">kg</el-radio>
          <el-radio value="个">{{ t('djs.warehouse.packEntry.unitPiece') }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 规格（可选） -->
      <el-form-item v-if="kind !== 'gift'" :label="t('djs.warehouse.packEntry.productSpec')" prop="productSpec">
        <el-input v-model="form.productSpec" maxlength="64" :placeholder="t('djs.warehouse.packEntry.productSpecPlaceholder')" style="width: 220px" />
      </el-form-item>

      <!-- 入库库位 -->
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

      <!-- 发送位置（发货月台 / 邮寄 / 礼盒，其他产品打包二选无礼盒） -->
      <el-form-item v-if="sendDests.length > 0" :label="t('djs.warehouse.packEntry.sendDest')" prop="deliverDest">
        <el-radio-group v-model="form.deliverDest">
          <el-radio v-for="d in sendDests" :key="d.value" :value="d.value">{{ d.label }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 需求门店 -->
      <el-form-item :label="t('djs.warehouse.packEntry.store')" prop="storeId">
        <el-select
          v-model="form.storeId"
          filterable
          clearable
          :loading="storeLoading"
          :placeholder="t('djs.warehouse.packEntry.storePlaceholder')"
          style="width: 100%"
        >
          <el-option v-for="s in stores" :key="String(s.id)" :label="s.storeName" :value="s.id" />
        </el-select>
      </el-form-item>

      <!-- 门店(N份) 标签条：选目标产品后展示各门店未发货需求份数（仅展示/选择参考，单店提交） -->
      <el-form-item v-if="form.productId" :label="t('djs.warehouse.packEntry.demandStores')">
        <div v-loading="demandLoading" class="w-full">
          <template v-if="storeDemands.length > 0">
            <el-tag
              v-for="sd in storeDemands"
              :key="String(sd.storeId)"
              class="mr-2 mb-1 cursor-pointer"
              :type="String(form.storeId) === String(sd.storeId) ? 'primary' : 'info'"
              :effect="String(form.storeId) === String(sd.storeId) ? 'dark' : 'plain'"
              @click="pickDemandStore(sd.storeId)"
            >
              {{ sd.storeName }}({{ sd.copies }}{{ t('djs.warehouse.packEntry.copiesUnit') }})
            </el-tag>
          </template>
          <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.noDemand') }}</span>
        </div>
      </el-form-item>

      <!-- 凭证图 -->
      <el-form-item :label="t('djs.warehouse.packEntry.proof')">
        <OssUpload ref="ossRef" v-model="proofModel" biz-type="warehouse_pack_proof" :limit="5" :file-size="10" />
      </el-form-item>

      <el-form-item :label="t('djs.warehouse.packEntry.remark')" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit(false)">{{ t('common.confirm') }}</el-button>
        <el-button v-if="showPrintTrace" type="success" :loading="submitting" @click="handleSubmit(true)">
          {{ t('djs.warehouse.packEntry.confirmPrintTrace') }}
        </el-button>
        <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import OssUpload from '@/components/OssUpload/index.vue';
import { usePackEntryOptions } from './useOptions';
import { listStoreDemand, submitDryPack, submitGiftPack, submitVegPack } from '@/api/djs-warehouse/packEntry';
import type { DeliverDest, DryPackBo, GiftPackBo, PackSourceVO, StoreDemandCopiesVO, VegPackBo } from '@/api/djs-warehouse/packEntry';

/**
 * SKU 打包共享表单（A5）。
 *
 * 三业态共用：
 *   kind='dry'  肉品打包 / 其他产品打包（来源过程产品 → 目标 SKU + 单位 kg/个）
 *   kind='veg'  果蔬打包（地块来源蔬菜 → 目标蔬菜 SKU，单位固定 kg）
 *   kind='gift' 礼盒打包（仅选礼盒 SKU + 盒数，service 自动按组件清单扣减）
 *
 * 发送位置 / 门店份数 / 确认并打印追溯码 对齐原型（DJS-FIX-WMS-PACK）：
 *   sendDestKinds  发送位置可选项：肉品/果蔬=三选(发货月台/邮寄/礼盒) 其他=二选(发货月台/邮寄) gift 不显示
 *   showPrintTrace 是否显示「确认并打印追溯码」：肉品/果蔬=true 其他/礼盒=false
 */
const props = withDefaults(
  defineProps<{
    kind: 'dry' | 'veg' | 'gift';
    title: string;
    /** 目标产品 productType 过滤：dry/veg=1 产品；gift=3 礼盒 */
    productType: number;
    /** 发送位置可选项（缺省三选）；传 [] 不显示 */
    sendDestKinds?: DeliverDest[];
    /** 是否显示「确认并打印追溯码」 */
    showPrintTrace?: boolean;
    /** 顶部地块卡片选择（果蔬打包专用：按来源 plotId 分组，选地块再选该地块来源） */
    plotGroup?: boolean;
  }>(),
  {
    sendDestKinds: () => ['platform', 'mail', 'gift'],
    showPrintTrace: true,
    plotGroup: false
  }
);

const { t } = useI18n();

const showPrintTrace = computed(() => props.showPrintTrace);

const SEND_DEST_LABEL_KEY: Record<DeliverDest, string> = {
  platform: 'djs.warehouse.packEntry.sendDestPlatform',
  mail: 'djs.warehouse.packEntry.sendDestMail',
  gift: 'djs.warehouse.packEntry.sendDestGift'
};
const sendDests = computed(() => (props.sendDestKinds ?? []).map((v) => ({ value: v, label: t(SEND_DEST_LABEL_KEY[v]) })));

const {
  products,
  productLoading,
  locations,
  locationLoading,
  stores,
  storeLoading,
  sources,
  sourceLoading,
  plotMap,
  plotLoading,
  loadProducts,
  loadLocations,
  loadStores,
  loadSources,
  loadPlots
} = usePackEntryOptions();

const formRef = ref<any>();
const ossRef = ref<InstanceType<typeof OssUpload>>();
const submitting = ref(false);

interface PackFormShape {
  sourceInhouseId: number | string | '';
  productId: number | string | '';
  productWeight: number | undefined;
  packBoxCount: number | undefined;
  productUnit: string;
  productSpec: string | undefined;
  locationId: number | string | '';
  storeId: number | string | '';
  deliverDest: DeliverDest | undefined;
  proofOssIds: string | undefined;
  remark: string | undefined;
}

const defaultForm = (): PackFormShape => ({
  sourceInhouseId: '',
  productId: '',
  productWeight: undefined,
  packBoxCount: undefined,
  productUnit: 'kg',
  productSpec: undefined,
  locationId: '',
  storeId: '',
  deliverDest: undefined,
  proofOssIds: undefined,
  remark: undefined
});

const form = ref<PackFormShape>(defaultForm());

// 门店(N份) 标签条：选目标产品后按 productId 拉各门店未发货需求份数
const storeDemands = ref<StoreDemandCopiesVO[]>([]);
const demandLoading = ref(false);

async function loadStoreDemand(productId: number | string | '') {
  if (!productId) {
    storeDemands.value = [];
    return;
  }
  demandLoading.value = true;
  try {
    const res = await listStoreDemand(productId);
    storeDemands.value = ((res as any).data ?? []) as StoreDemandCopiesVO[];
  } finally {
    demandLoading.value = false;
  }
}

function pickDemandStore(storeId: number | string) {
  form.value.storeId = storeId;
}

watch(
  () => form.value.productId,
  (pid) => {
    void loadStoreDemand(pid);
  }
);

const proofModel = computed<string[]>({
  get: () => (form.value.proofOssIds ? form.value.proofOssIds.split(',').filter(Boolean) : []),
  set: (val: string[]) => {
    form.value.proofOssIds = val && val.length > 0 ? val.join(',') : undefined;
  }
});

const sourceLabel = computed(() => (props.kind === 'veg' ? t('djs.warehouse.packEntry.sourceVeg') : t('djs.warehouse.packEntry.source')));

// 果蔬地块卡片：按来源 plotId 分组成顶部卡片；选地块后来源下拉只显示该地块来源
const selectedPlotId = ref<number | string | ''>('');

const plotGroups = computed(() => {
  if (!props.plotGroup) return [] as { plotId: number | string; label: string }[];
  const seen = new Map<string, { plotId: number | string; label: string }>();
  sources.value.forEach((s) => {
    if (s.plotId == null) return;
    const key = String(s.plotId);
    if (!seen.has(key)) {
      seen.set(key, { plotId: s.plotId, label: plotMap.value[key] || `${t('djs.warehouse.packEntry.plot')} ${key}` });
    }
  });
  return Array.from(seen.values());
});

const displaySources = computed(() => {
  if (!props.plotGroup || !selectedPlotId.value) return sources.value;
  return sources.value.filter((s) => String(s.plotId) === String(selectedPlotId.value));
});

function onPlotChange() {
  // 切地块时清掉已选来源（若不属于新地块）
  const src = sources.value.find((x) => String(x.id) === String(form.value.sourceInhouseId));
  if (src && String(src.plotId) !== String(selectedPlotId.value)) {
    form.value.sourceInhouseId = '';
  }
}

const selectedUnit = computed<string>(() => {
  if (props.kind === 'veg') return 'kg';
  return form.value.productUnit || 'kg';
});

function sourceOptionLabel(s: PackSourceVO): string {
  const parts: string[] = [s.productName];
  if (s.earNo) parts.push(`耳号 ${s.earNo}`);
  // 地块卡片模式下顶部已选地块，下拉不再重复显示地块；否则展示地块编码
  if (s.plotId && !props.plotGroup) parts.push(`地块 ${plotMap.value[String(s.plotId)] || s.plotId}`);
  parts.push(`剩余 ${s.productWeight}${s.productUnit || 'kg'}`);
  return parts.join(' / ');
}

function onSourceChange() {
  // 来源带规格时回填规格，方便录入
  const src = sources.value.find((x) => String(x.id) === String(form.value.sourceInhouseId));
  if (src?.productSpec && !form.value.productSpec) {
    form.value.productSpec = src.productSpec;
  }
}

const rules = computed(() => {
  const base: Record<string, any> = {
    productId: [{ required: true, message: t('djs.warehouse.packEntry.targetProductRequired'), trigger: 'change' }],
    locationId: [{ required: true, message: t('djs.warehouse.packEntry.locationRequired'), trigger: 'change' }]
  };
  if (props.kind === 'gift') {
    base.packBoxCount = [{ required: true, message: t('djs.warehouse.packEntry.packBoxCountRequired'), trigger: 'blur' }];
  } else {
    base.sourceInhouseId = [{ required: true, message: t('djs.warehouse.packEntry.sourceRequired'), trigger: 'change' }];
    base.productWeight = [{ required: true, message: t('djs.warehouse.packEntry.productWeightRequired'), trigger: 'blur' }];
    if (props.kind === 'dry') {
      base.productUnit = [{ required: true, message: t('djs.warehouse.packEntry.productUnitRequired'), trigger: 'change' }];
    }
  }
  return base;
});

function handleReset() {
  form.value = defaultForm();
  storeDemands.value = [];
  selectedPlotId.value = '';
  ossRef.value?.setExistingFiles?.([]);
  formRef.value?.clearValidate?.();
}

/** printTrace=true：提交后弹出追溯码供「打印」展示（仅肉品/果蔬有此按钮）。 */
async function handleSubmit(printTrace: boolean) {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      let res: any;
      if (props.kind === 'gift') {
        const bo: GiftPackBo = {
          giftBoxProductId: form.value.productId as number | string,
          packBoxCount: form.value.packBoxCount as number,
          locationId: form.value.locationId as number | string,
          storeId: form.value.storeId || undefined,
          deliverDest: form.value.deliverDest,
          proofOssIds: form.value.proofOssIds,
          remark: form.value.remark
        };
        res = await submitGiftPack(bo);
      } else if (props.kind === 'veg') {
        const bo: VegPackBo = {
          sourceInhouseId: form.value.sourceInhouseId as number | string,
          productId: form.value.productId as number | string,
          productWeight: form.value.productWeight as number,
          locationId: form.value.locationId as number | string,
          storeId: form.value.storeId || undefined,
          deliverDest: form.value.deliverDest,
          productSpec: form.value.productSpec,
          proofOssIds: form.value.proofOssIds,
          remark: form.value.remark
        };
        res = await submitVegPack(bo);
      } else {
        const bo: DryPackBo = {
          sourceInhouseId: form.value.sourceInhouseId as number | string,
          productId: form.value.productId as number | string,
          productWeight: form.value.productWeight as number,
          productUnit: form.value.productUnit,
          locationId: form.value.locationId as number | string,
          storeId: form.value.storeId || undefined,
          deliverDest: form.value.deliverDest,
          productSpec: form.value.productSpec,
          proofOssIds: form.value.proofOssIds,
          remark: form.value.remark
        };
        res = await submitDryPack(bo);
      }
      ElMessage.success(t('djs.warehouse.packEntry.submitSuccess'));
      const traceCode: string | undefined = res?.data?.traceCode;
      if (printTrace) {
        if (traceCode) {
          await ElMessageBox.alert(traceCode, t('djs.warehouse.packEntry.traceCodeTitle'), {
            confirmButtonText: t('djs.warehouse.packEntry.print'),
            callback: () => printTraceCode(traceCode)
          });
        } else {
          ElMessage.warning(t('djs.warehouse.packEntry.noTraceCode'));
        }
      }
      handleReset();
    } finally {
      submitting.value = false;
    }
  });
}

/** 打开浏览器打印窗口展示追溯码（功能对齐：最小实现，不接专用标签机）。 */
function printTraceCode(code: string) {
  const w = window.open('', '_blank', 'width=420,height=320');
  if (!w) return;
  w.document.write(
    `<html><head><title>${t('djs.warehouse.packEntry.traceCodeTitle')}</title></head>` +
      `<body style="font-family:sans-serif;text-align:center;padding:40px"><h3>${t('djs.warehouse.packEntry.traceCodeTitle')}</h3>` +
      `<div style="font-size:28px;letter-spacing:2px;margin:24px 0">${code}</div></body></html>`
  );
  w.document.close();
  w.focus();
  w.print();
}

onMounted(async () => {
  await Promise.all([loadProducts(props.productType), loadLocations(), loadStores()]);
  if (props.kind === 'veg') {
    await Promise.all([loadSources('veg'), props.plotGroup ? loadPlots() : Promise.resolve()]);
  } else if (props.kind === 'dry') {
    await loadSources('dry');
  }
});
</script>

<style scoped>
.pack-card {
  margin: 8px;
}
.max-w-3xl {
  max-width: 720px;
}
</style>
