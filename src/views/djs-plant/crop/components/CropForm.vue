<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="900px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
      <el-tabs v-model="activeTab">
        <!-- Tab 1：基础信息 -->
        <el-tab-pane :label="t('plantCrop.tab.basic')" name="basic">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.cropCode')" prop="cropCode">
                <el-input v-model="form.cropCode" :placeholder="t('plantCrop.placeholder.cropCode')" :disabled="!!form.id" maxlength="32" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.cropName')" prop="cropName">
                <el-input v-model="form.cropName" :placeholder="t('plantCrop.placeholder.cropName')" maxlength="64" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.cropImageUrl')" prop="cropImagePreview">
                <OssUpload ref="ossImgRef" v-model="imgOssIdsModel" biz-type="plant_crop" :limit="1" :file-size="10" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.varietyName')" prop="varietyName">
                <el-input v-model="form.varietyName" :placeholder="t('plantCrop.placeholder.varietyName')" maxlength="64" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.varietyOrigin')" prop="varietyOrigin">
                <el-input v-model="form.varietyOrigin" :placeholder="t('plantCrop.placeholder.varietyOrigin')" maxlength="128" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.cropFamily')" prop="cropFamily">
                <el-select v-model="form.cropFamily" :placeholder="t('plantCrop.placeholder.cropFamily')" clearable filterable style="width: 100%">
                  <el-option v-for="d in djs_crop_family" :key="d.value" :label="d.label" :value="d.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.cropGenus')" prop="cropGenus">
                <el-input v-model="form.cropGenus" :placeholder="t('plantCrop.placeholder.cropGenus')" maxlength="32" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- Tab 2：生长周期 -->
        <el-tab-pane :label="t('plantCrop.tab.growth')" name="growth">
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item :label="t('plantCrop.field.plantingSeason')" prop="plantingSeason">
                <el-checkbox-group v-model="plantingSeasonArr">
                  <el-checkbox v-for="d in djs_planting_season" :key="d.value" :value="d.value">
                    {{ d.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.sowingPeriod')" prop="sowingPeriod">
                <el-input v-model="form.sowingPeriod" :placeholder="t('plantCrop.placeholder.sowingPeriod')" maxlength="64" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.minCycle')" prop="minCycle">
                <el-input-number
                  v-model="form.minCycle"
                  :min="0"
                  :precision="0"
                  :step="1"
                  style="width: 100%"
                  @change="formRef?.validateField('maxCycle')"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.maxCycle')" prop="maxCycle">
                <el-input-number v-model="form.maxCycle" :min="0" :precision="0" :step="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- Tab 3：产量 & 品质 -->
        <el-tab-pane :label="t('plantCrop.tab.yield')" name="yield">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.predictedPer')" prop="predictedPer">
                <el-input-number v-model="form.predictedPer" :min="0" :precision="3" :step="100" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="t('plantCrop.field.qualityDesc')" prop="qualityDesc">
                <el-input
                  v-model="form.qualityDesc"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  :placeholder="t('plantCrop.placeholder.qualityDesc')"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- Tab 4：产品配置（V6 row16）—— 一个作物可产出多个产品，各自带绩效金额。
             原「关联产品」（基础信息）与「绩效单价」（产量品质）合并到这里，一对一数据已迁成首行。 -->
        <el-tab-pane :label="t('plantCrop.tab.product')" name="product">
          <!-- 新增作物时还没有 cropId，配置行没处挂 —— 先存基础信息再回来配 -->
          <el-alert v-if="!form.id" :title="t('plantCrop.product.saveFirst')" type="info" :closable="false" show-icon />
          <template v-else>
            <div class="mb-2">
              <el-button type="primary" icon="Plus" size="small" @click="openProductRow()">{{ t('common.add') }}</el-button>
            </div>
            <el-table v-loading="productRowsLoading" :data="productRows" border size="small" max-height="320">
              <el-table-column :label="t('plantCrop.product.productName')" prop="productName" align="center" show-overflow-tooltip />
              <el-table-column :label="t('plantCrop.product.perfPrice')" prop="perfPrice" align="center" width="160">
                <template #default="{ row }">{{ row.perfPrice == null || row.perfPrice === '' ? '—' : Number(row.perfPrice).toFixed(2) }}</template>
              </el-table-column>
              <el-table-column :label="t('common.operate')" align="center" width="140">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="openProductRow(row)">{{ t('common.edit') }}</el-button>
                  <el-button link type="danger" size="small" @click="removeProductRow(row)">{{ t('common.delete') }}</el-button>
                </template>
              </el-table-column>
              <template #empty>
                <el-empty :description="t('plantCrop.product.empty')" :image-size="70" />
              </template>
            </el-table>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <!-- 产品配置行 新增 / 修改（弹框套弹框：append-to-body 让它盖在作物弹窗之上） -->
    <el-dialog
      v-model="productDialogVisible"
      :title="productForm.id ? t('plantCrop.product.edit') : t('plantCrop.product.add')"
      append-to-body
      destroy-on-close
      width="480px"
    >
      <el-form ref="productFormRef" :model="productForm" :rules="productRules" label-width="130px">
        <el-form-item :label="t('plantCrop.field.relatedProduct')" prop="productId">
          <el-select
            v-model="productForm.productId"
            filterable
            clearable
            :placeholder="t('plantCrop.placeholder.relatedProduct')"
            style="width: 100%"
          >
            <el-option v-for="p in productOptions" :key="p.id" :label="p.productName" :value="String(p.id)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('plantCrop.product.perfPrice')" prop="perfPrice">
          <el-input-number v-model="productForm.perfPrice" :min="0" :precision="2" :step="0.5" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="productSubmitting" @click="submitProductRow">{{ t('common.confirm') }}</el-button>
        <el-button @click="productDialogVisible = false">{{ t('common.cancel') }}</el-button>
      </template>
    </el-dialog>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { addCrop, getCrop, updateCrop } from '@/api/djs-plant/crop';
import OssUpload from '@/components/OssUpload/index.vue';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { listProduct } from '@/api/djs-warehouse/product';
import { addCropProduct, delCropProduct, listCropProduct, updateCropProduct } from '@/api/djs-plant/cropProduct';
import type { CropProductForm, CropProductVO } from '@/api/djs-plant/cropProduct';
import type { ProductInfoVO, ProductInfoQuery } from '@/api/djs-warehouse/product/types';
import type { CropInfoForm } from '@/api/djs-plant/crop/types';
import { useI18n } from 'vue-i18n';
import { useOssBridge } from '@/composables/useOssBridge';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { djs_planting_season, djs_crop_family } = toRefs<any>(proxy?.useDict('djs_planting_season', 'djs_crop_family'));

const visible = ref(false);
const submitting = ref(false);
const activeTab = ref('basic');
const formRef = ref<ElFormInstance>();
const ossImgRef = ref<InstanceType<typeof OssUpload>>();

const defaultForm = (): CropInfoForm => ({
  id: undefined,
  cropCode: '',
  cropName: '',
  cropImagePreview: undefined,
  cropImageUrl: undefined,
  imageOssId: undefined,
  imageSource: undefined,
  varietyName: undefined,
  varietyOrigin: undefined,
  cropFamily: undefined,
  cropGenus: undefined,
  relatedProduct: undefined,
  plantingSeason: undefined,
  sowingPeriod: undefined,
  maxCycle: undefined,
  minCycle: undefined,
  predictedPer: undefined,
  qualityDesc: undefined,
  pickUnitPrice: undefined
});

const form = ref<CropInfoForm>(defaultForm());

// 关联产品候选 = belong_type=vegetable 且 product_attr=2（原材料）；relatedProduct 存产品主键 id BIGINT FK
const productOptions = ref<ProductInfoVO[]>([]);
let productsLoaded = false;
const loadProductOptions = async () => {
  if (productsLoaded) return;
  try {
    const query: ProductInfoQuery = { pageNum: 1, pageSize: 1000, belongType: 'vegetable', productAttr: 2 };
    const res = await listProduct(query);
    productOptions.value = (res.rows ?? (res as any).data ?? []) as ProductInfoVO[];
    productsLoaded = true;
  } catch (e) {
    console.warn('[CropForm] listProduct failed', e);
  }
};

// 多选 季节 ↔ 逗号分隔字符串
const plantingSeasonArr = computed<string[]>({
  get: () => (form.value.plantingSeason ? form.value.plantingSeason.split(',').filter(Boolean) : []),
  set: (val: string[]) => {
    form.value.plantingSeason = val && val.length > 0 ? val.join(',') : undefined;
  }
});

// OssUpload v-model string[]（雪花 ossId 全链路 string）；作物图单图：桥接到 cropImagePreview（单 ossId）
// 提交时同步写 imageOssId（IMG-LIB-001 L1，供采摘计划/总览/resolver 链路读取，三端一致）
const imgOssIdsModel = useOssBridge(form, 'cropImagePreview', 'single');

const rules = computed(() => ({
  cropCode: [{ required: true, message: t('plantCrop.rule.cropCode.required'), trigger: 'blur' }],
  cropName: [{ required: true, message: t('plantCrop.rule.cropName.required'), trigger: 'blur' }],
  maxCycle: [
    {
      trigger: 'change',
      validator: (_rule: unknown, value: number | undefined, callback: (err?: Error) => void) => {
        if (value != null && form.value.minCycle != null && value <= form.value.minCycle) {
          callback(new Error(t('plantCrop.rule.maxCycle.gtMin')));
        } else {
          callback();
        }
      }
    }
  ]
}));

// ===== 产品配置页签（V6 row16）：一个作物多个产品，每行一个产品 + 它自己的绩效金额 =====
const productRows = ref<CropProductVO[]>([]);
const productRowsLoading = ref(false);
const productDialogVisible = ref(false);
const productSubmitting = ref(false);
const productFormRef = ref<ElFormInstance>();
const productForm = ref<CropProductForm>({});

const productRules = computed(() => ({
  productId: [{ required: true, message: t('plantCrop.product.rule.productId'), trigger: 'change' }]
}));

const loadProductRows = async () => {
  if (!form.value.id) {
    productRows.value = [];
    return;
  }
  productRowsLoading.value = true;
  try {
    const res = await listCropProduct(form.value.id);
    productRows.value = (res.data ?? []) as CropProductVO[];
  } finally {
    productRowsLoading.value = false;
  }
};

const openProductRow = (row?: CropProductVO) => {
  productForm.value = row
    ? { id: row.id, cropId: String(form.value.id), productId: String(row.productId), perfPrice: row.perfPrice == null ? undefined : Number(row.perfPrice) }
    : { cropId: String(form.value.id) };
  productDialogVisible.value = true;
};

const submitProductRow = () => {
  productFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    productSubmitting.value = true;
    try {
      if (productForm.value.id) {
        await updateCropProduct(productForm.value);
      } else {
        await addCropProduct({ ...productForm.value, cropId: String(form.value.id) });
      }
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      productDialogVisible.value = false;
      await loadProductRows();
    } finally {
      productSubmitting.value = false;
    }
  });
};

const removeProductRow = async (row: CropProductVO) => {
  await proxy?.$modal.confirm(t('plantCrop.product.confirmDelete', { name: row.productName ?? '' }));
  await delCropProduct(row.id);
  proxy?.$modal.msgSuccess(t('common.deleteSuccess'));
  await loadProductRows();
};

const dialogTitle = computed(() => (form.value.id ? t('plantCrop.title.edit') : t('plantCrop.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  productRows.value = [];
  activeTab.value = 'basic';
  visible.value = true;
  loadProductOptions();
};

const openEdit = async (id: number | string) => {
  loadProductOptions();
  const res = await getCrop(id);
  const data = res.data;
  form.value = {
    ...defaultForm(),
    ...data,
    predictedPer: data.predictedPer != null ? Number(data.predictedPer) : undefined,
    pickUnitPrice: data.pickUnitPrice != null ? Number(data.pickUnitPrice) : undefined
  };
  activeTab.value = 'basic';
  visible.value = true;
  loadProductRows();

  await nextTick();
  // 回填单图：优先 cropImagePreview（新口径），兼容旧数据 imageOssId / cropImageUrl 首图
  const previewOssId = form.value.cropImagePreview || form.value.imageOssId || form.value.cropImageUrl?.split(',')[0];
  if (previewOssId) {
    form.value.cropImagePreview = String(previewOssId);
    try {
      const ossRes = await listOssByIds(String(previewOssId));
      const items = (ossRes.data || []).map((o) => ({
        ossId: String(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossImgRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[CropForm] img listOssByIds failed', e);
    }
  }
};

defineExpose({ openCreate, openEdit });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
  productRows.value = [];
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      // 单图同步：用户上传的图既写 cropImagePreview（列表缩略图），也写 imageOssId（IMG-LIB L1，供 resolver/采摘/总览读）
      // 手动上传标记 imageSource=1，避免后端按作物名 rematch 覆盖
      if (form.value.cropImagePreview) {
        form.value.imageOssId = form.value.cropImagePreview;
        form.value.imageSource = 1;
      } else {
        form.value.imageOssId = undefined;
      }
      if (form.value.id) {
        await updateCrop(form.value);
      } else {
        await addCrop(form.value);
      }
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>

<style scoped>
.form-tip {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}
</style>
