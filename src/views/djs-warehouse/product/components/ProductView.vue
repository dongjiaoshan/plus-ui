<template>
  <el-dialog v-model="visible" :title="t(isGoods ? 'product.title.goodsView' : 'product.title.view')" destroy-on-close append-to-body width="820px">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t(isGoods ? 'product.title.goodsBaseInfo' : 'product.title.baseInfo')" name="info">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t(isGoods ? 'product.field.goodsId' : 'product.field.productId')">{{ data.productId || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t(isGoods ? 'product.field.goodsName' : 'product.field.productName')">{{ data.productName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t(isGoods ? 'product.field.goodsType' : 'product.field.productType')">
            <dict-tag :options="djs_product_type" :value="data.productType" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productUnit')">{{ data.productUnit || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productSpec')">{{ data.productSpec || '-' }}</el-descriptions-item>
          <!-- row25：商品（外购 type=2）详情去掉归属类型/商品属性/生产车间/是否支持外购显示 -->
          <el-descriptions-item v-if="!isGoods" :label="t('product.field.belongType')">
            <dict-tag :options="djs_belong_type" :value="data.belongType" />
          </el-descriptions-item>
          <!-- row25：商品类别（外购）；row31：自产/礼盒详情去掉外购类显示 -->
          <el-descriptions-item v-if="isGoods" :label="t('product.field.buyClass')">
            <dict-tag :options="djs_buy_class" :value="data.buyClass" />
          </el-descriptions-item>
          <el-descriptions-item v-if="!isGoods" :label="t(isGoods ? 'product.field.goodsAttr' : 'product.field.productAttr')">
            <dict-tag :options="djs_product_attr" :value="data.productAttr" />
          </el-descriptions-item>
          <el-descriptions-item v-if="!isGoods" :label="t('product.field.productWorkshop')">
            <dict-tag :options="djs_product_workshop" :value="data.productWorkshop" />
          </el-descriptions-item>
          <!-- row40：生产车间下新增存储库位（取 VO storeLocationName） -->
          <el-descriptions-item v-if="!isGoods" :label="t('product.field.storeLocation')">{{ data.storeLocationName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('product.field.productStatus')">
            <dict-tag :options="sys_normal_disable" :value="data.productStatus" />
          </el-descriptions-item>
          <!-- row25：商品详情去掉是否支持外购；row31：自产/礼盒保留 + 右侧新增原材料产品 -->
          <template v-if="!isGoods">
            <el-descriptions-item :label="t('product.field.isBuyOutSupport')">
              <dict-tag :options="djs_yes_no" :value="data.isBuyOut" />
            </el-descriptions-item>
            <el-descriptions-item :label="t('product.field.productMaterial')">{{ data.productMaterialName || '-' }}</el-descriptions-item>
            <!-- 流程性问题 row11：是否原材料外售 -->
            <el-descriptions-item :label="t('product.field.isMaterialSold')">
              <dict-tag :options="djs_yes_no" :value="data.isMaterialSold" />
            </el-descriptions-item>
          </template>
          <!-- row67：商品详情（isGoods）下「产品图片/产品描述」文案改「商品图片/商品描述」 -->
          <el-descriptions-item :label="t(isGoods ? 'product.field.goodsThumb' : 'product.field.productThumb')" :span="2">
            <image-preview v-if="thumbUrl" :src="thumbUrl" :width="120" :height="120" />
            <el-text v-else type="info">-</el-text>
          </el-descriptions-item>
          <el-descriptions-item :label="t(isGoods ? 'product.field.goodsDesc' : 'product.field.productDesc')" :span="2">{{ data.productDesc || '-' }}</el-descriptions-item>
          <!-- row25/row31：去掉备注显示 -->
        </el-descriptions>
      </el-tab-pane>

      <!-- 生产记录子表（自产成品 / 礼盒，即非外购且非原材料）。原型：产品详情含生产记录。
           row80：原材料（productType=1 & productAttr=2）不生产 → 改显出入库记录（flow tab），故此处排除原材料 -->
      <el-tab-pane v-if="showProductionTab" :label="t('product.title.production')" name="production">
        <el-form :inline="true" class="mb-2">
          <el-form-item :label="t('product.production.produceDate')">
            <el-date-picker
              v-model="productionFilter.produceDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('product.production.produceDatePlaceholder')"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item :label="t('product.production.produceType')">
            <el-select
              v-model="productionFilter.produceType"
              :placeholder="t('product.production.produceTypePlaceholder')"
              clearable
              style="width: 140px"
            >
              <el-option :label="t('product.production.typeProduce')" value="produce" />
              <el-option :label="t('product.production.typeReturn')" value="return" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadProduction">{{ t('common.search') }}</el-button>
            <el-button @click="resetProductionFilter">{{ t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="productionLoading" :data="productionList" border>
          <el-table-column prop="produceDate" :label="t('product.production.produceDate')" width="120" align="center" header-align="center" />
          <el-table-column :label="t('product.production.produceType')" width="100" align="center" header-align="center">
            <template #default="{ row }">
              {{ row.produceType === 'return' ? t('product.production.typeReturn') : t('product.production.typeProduce') }}
            </template>
          </el-table-column>
          <el-table-column prop="produceNum" :label="t('product.production.produceNum')" width="110" align="center" header-align="center" />
          <el-table-column prop="produceUnit" :label="t('product.production.produceUnit')" width="100" align="center" header-align="center" />
          <el-table-column :label="t('product.production.standardWeight')" width="110" align="center" header-align="center">
            <template #default="{ row }">{{ formatKg(row.standardWeight) }}</template>
          </el-table-column>
          <el-table-column :label="t('product.production.produceWeight')" width="110" align="center" header-align="center">
            <template #default="{ row }">{{ formatKg(row.produceWeight) }}</template>
          </el-table-column>
          <el-table-column :label="t('product.production.diffWeight')" width="110" align="center" header-align="center">
            <template #default="{ row }">{{ formatKg(row.diffWeight) }}</template>
          </el-table-column>
          <template #empty>
            <el-empty :description="t('common.empty')" :image-size="60" />
          </template>
        </el-table>
      </el-tab-pane>

      <!-- 业务流水子表：外购商品=业务流水；row80 原材料（productType=1 & productAttr=2）=出入库记录（同一 flow 数据源，标题分叉） -->
      <el-tab-pane v-if="showFlowTab" :label="t(flowTabLabelKey)" name="flow">
        <el-form :inline="true" class="mb-2">
          <el-form-item :label="t('product.flow.bizDate')">
            <el-date-picker
              v-model="flowFilter.bizDateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="-"
              :start-placeholder="t('product.flow.bizDateStart')"
              :end-placeholder="t('product.flow.bizDateEnd')"
              clearable
              style="width: 260px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadFlow">{{ t('common.search') }}</el-button>
            <el-button @click="resetFlowFilter">{{ t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="flowLoading" :data="flowList" border>
          <el-table-column prop="bizDate" :label="t('product.flow.bizDate')" width="130" align="center" header-align="center" />
          <el-table-column :label="t('product.flow.bizType')" width="130" align="center" header-align="center">
            <template #default="{ row }">{{ bizTypeLabel(row.bizType) }}</template>
          </el-table-column>
          <el-table-column prop="bizNum" :label="t('product.flow.bizNum')" min-width="120" align="center" header-align="center" />
          <el-table-column prop="bizUnit" :label="t('product.flow.bizUnit')" width="100" align="center" header-align="center" />
          <!-- row25：单位列后加供应商，供应商后加操作人 -->
          <el-table-column prop="supplierName" :label="t('product.flow.supplierName')" min-width="120" align="center" header-align="center" show-overflow-tooltip>
            <template #default="{ row }">{{ row.supplierName || '-' }}</template>
          </el-table-column>
          <el-table-column prop="operatorName" :label="t('product.flow.operatorName')" min-width="110" align="center" header-align="center" show-overflow-tooltip>
            <template #default="{ row }">{{ row.operatorName || '-' }}</template>
          </el-table-column>
          <template #empty>
            <el-empty :description="t('common.empty')" :image-size="60" />
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
import { getProduct, listProductFlowRecords, listProductionRecords } from '@/api/djs-warehouse/product';
import type { ProductFlowRecordVO, ProductInfoVO, ProductionRecordVO } from '@/api/djs-warehouse/product/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { lastMonthRange } from '@/utils/ruoyi';
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

/** 外购商品（productType=2）详情里「产品X」文案改「商品X」；自产/礼盒仍「产品X」 */
const isGoods = computed(() => data.value.productType === 2);

/** row80：原材料（自产 productType=1 且 productAttr=2）不生产 → 详情显「出入库记录」而非「生产记录」 */
const isRawMaterial = computed(() => data.value.productType === 1 && data.value.productAttr === 2);

/** 生产记录 tab：自产成品 / 礼盒（非外购商品、非原材料）才显示 */
const showProductionTab = computed(() => data.value.productType !== 2 && !isRawMaterial.value);

/** 业务流水 / 出入库记录 tab：外购商品 或 原材料 都显示（同一 flow 数据源） */
const showFlowTab = computed(() => data.value.productType === 2 || isRawMaterial.value);

/** flow tab 标题：外购商品=业务流水；原材料=出入库记录 */
const flowTabLabelKey = computed(() => (isRawMaterial.value ? 'product.title.inout' : 'product.title.flow'));

// 生产记录子表（自产 / 礼盒）
const productionList = ref<ProductionRecordVO[]>([]);
const productionLoading = ref(false);
const productionFilter = reactive<{ produceDate?: string; produceType?: string }>({ produceDate: undefined, produceType: undefined });

// 业务流水 / 出入库记录子表（外购商品 / 原材料）。row67：业务日期由单日改区间，默认近一个月
const flowList = ref<ProductFlowRecordVO[]>([]);
const flowLoading = ref(false);
const flowFilter = reactive<{ bizDateRange: string[] }>({ bizDateRange: lastMonthRange() });

const currentId = ref<number | string>('');

function formatKg(v?: number | string | null): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return '-';
  return `${n}kg`;
}

function bizTypeLabel(type?: string): string {
  if (type === 'in_stock') return t('product.flow.typeInStock');
  if (type === 'pick_out') return t('product.flow.typePickOut');
  if (type === 'backend_out') return t('product.flow.typeBackendOut');
  return type ?? '-';
}

async function loadProduction() {
  if (!currentId.value) return;
  productionLoading.value = true;
  try {
    const res = await listProductionRecords(currentId.value, {
      produceDate: productionFilter.produceDate || undefined,
      produceType: productionFilter.produceType || undefined
    });
    productionList.value = (res.data ?? []) as ProductionRecordVO[];
  } finally {
    productionLoading.value = false;
  }
}
function resetProductionFilter() {
  productionFilter.produceDate = undefined;
  productionFilter.produceType = undefined;
  loadProduction();
}

async function loadFlow() {
  if (!currentId.value) return;
  flowLoading.value = true;
  try {
    const range = Array.isArray(flowFilter.bizDateRange) ? flowFilter.bizDateRange : [];
    const res = await listProductFlowRecords(currentId.value, {
      bizDateFrom: range[0] || undefined,
      bizDateTo: range[1] || undefined
    });
    flowList.value = (res.data ?? []) as ProductFlowRecordVO[];
  } finally {
    flowLoading.value = false;
  }
}
function resetFlowFilter() {
  flowFilter.bizDateRange = lastMonthRange();
  loadFlow();
}

const open = async (id: number | string, _productType?: number) => {
  currentId.value = id;
  productionList.value = [];
  flowList.value = [];
  productionFilter.produceDate = undefined;
  productionFilter.produceType = undefined;
  flowFilter.bizDateRange = lastMonthRange();
  const res = await getProduct(id);
  data.value = res.data || {};
  thumbUrl.value = '';
  activeTab.value = 'info';
  visible.value = true;
  // 子表按形态懒加载：外购商品 / 原材料→业务流水(出入库记录)；自产成品/礼盒→生产记录
  if (showFlowTab.value) {
    loadFlow();
  } else {
    loadProduction();
  }
  // product VO 只有 ossId（productThumb 单图），必须 listByIds 回查 url
  const thumbId = data.value.productThumb;
  if (thumbId) {
    try {
      const ossRes = await listOssByIds(thumbId);
      thumbUrl.value = ossRes.data?.[0]?.url ?? '';
    } catch (e) {
      console.warn('[ProductView] listOssByIds failed for productThumb', thumbId, e);
    }
  }
};

defineExpose({ open });
</script>
