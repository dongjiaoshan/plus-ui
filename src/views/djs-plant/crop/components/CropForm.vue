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
              <el-form-item :label="t('plantCrop.field.cropImageUrl')" prop="cropImageUrl">
                <OssUpload ref="ossImgRef" v-model="imgOssIdsModel" biz-type="plant_crop" :limit="9" :file-size="10" />
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
                <el-select v-model="form.cropFamily" :placeholder="t('plantCrop.placeholder.cropFamily')" clearable style="width: 100%">
                  <el-option v-for="d in djs_crop_family" :key="d.value" :label="d.label" :value="d.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.relatedProduct')" prop="relatedProduct">
                <el-select
                  v-model="form.relatedProduct"
                  filterable
                  clearable
                  :placeholder="t('plantCrop.placeholder.relatedProduct')"
                  style="width: 100%"
                >
                  <el-option v-for="p in productOptions" :key="p.id" :label="p.productName" :value="p.id" />
                </el-select>
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
            <el-col :span="12">
              <el-form-item :label="t('plantCrop.field.pickUnitPrice')" prop="pickUnitPrice">
                <el-input-number v-model="form.pickUnitPrice" :min="0" :precision="2" :step="0.5" style="width: 100%" />
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
      </el-tabs>
    </el-form>

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
import type { ProductInfoVO, ProductInfoQuery } from '@/api/djs-warehouse/product/types';
import type { CropInfoForm } from '@/api/djs-plant/crop/types';
import { useI18n } from 'vue-i18n';
import { useOssBridge } from '@/composables/useOssBridge';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { djs_crop_family, djs_planting_season } = toRefs<any>(proxy?.useDict('djs_crop_family', 'djs_planting_season'));

const visible = ref(false);
const submitting = ref(false);
const activeTab = ref('basic');
const formRef = ref<ElFormInstance>();
const ossImgRef = ref<InstanceType<typeof OssUpload>>();

const defaultForm = (): CropInfoForm => ({
  id: undefined,
  cropCode: '',
  cropName: '',
  cropImageUrl: undefined,
  varietyName: undefined,
  varietyOrigin: undefined,
  cropFamily: undefined,
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

// OssUpload v-model string[]（雪花 ossId 全链路 string）；业务字段是多 ossId 字符串（useOssBridge 桥接）
const imgOssIdsModel = useOssBridge(form, 'cropImageUrl', 'multi');

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

const dialogTitle = computed(() => (form.value.id ? t('plantCrop.title.edit') : t('plantCrop.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
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

  await nextTick();
  if (form.value.cropImageUrl) {
    try {
      const ossRes = await listOssByIds(form.value.cropImageUrl);
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
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
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
