<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="920px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <!-- 公共字段：产品类型 / 编码 / 名称 / 单位 / 规格 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('product.field.productType')" prop="productType">
            <el-select v-model="form.productType" :disabled="!!form.id" @change="onTypeChange">
              <el-option v-for="d in djs_product_type" :key="d.value" :label="d.label" :value="Number(d.value)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('product.field.productId')" prop="productId">
            <el-input v-model="form.productId" :disabled="!!form.id" maxlength="32" :placeholder="t('product.placeholder.productId')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('product.field.productName')" prop="productName">
            <el-input v-model="form.productName" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item :label="t('product.field.productUnit')" prop="productUnit">
            <el-input v-model="form.productUnit" maxlength="16" :placeholder="t('product.placeholder.productUnit')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item :label="t('product.field.productSpec')" prop="productSpec">
            <el-input v-model="form.productSpec" maxlength="64" :placeholder="t('product.placeholder.productSpec')" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 自产专属 -->
      <template v-if="form.productType === 1">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="t('product.field.belongType')" prop="belongType">
              <el-select v-model="form.belongType" clearable>
                <el-option v-for="d in djs_belong_type" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.field.productAttr')" prop="productAttr">
              <el-select v-model="form.productAttr" clearable>
                <el-option v-for="d in djs_product_attr" :key="d.value" :label="d.label" :value="Number(d.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.field.productWorkshop')" prop="productWorkshop">
              <el-select v-model="form.productWorkshop" clearable>
                <el-option v-for="d in djs_product_workshop" :key="d.value" :label="d.label" :value="Number(d.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.field.productMaterial')" prop="productMaterial">
              <el-input v-model="form.productMaterial" :placeholder="t('product.placeholder.productMaterial')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.field.materialNum')" prop="materialNum">
              <el-input-number v-model="form.materialNum" :precision="3" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <!-- 外购专属 -->
      <template v-if="form.productType === 2">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="t('product.field.buyClass')" prop="buyClass">
              <el-select v-model="form.buyClass" clearable :placeholder="t('product.placeholder.buyClass')">
                <el-option v-for="d in djs_buy_class" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
              <el-text v-if="!djs_buy_class || djs_buy_class.length === 0" size="small" type="info">
                {{ t('product.tip.buyClassEmpty') }}
              </el-text>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.field.supplierId')" prop="supplierId">
              <el-select v-model="form.supplierId" filterable :placeholder="t('product.placeholder.supplierId')">
                <el-option v-for="s in supplierOptions" :key="String(s.id)" :label="s.supplierName" :value="s.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.field.isBuyOut')">
              <el-radio-group v-model="form.isBuyOut">
                <el-radio v-for="d in djs_yes_no" :key="d.value" :value="Number(d.value)">{{ d.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <!-- 礼盒专属：组件清单 -->
      <template v-if="form.productType === 3">
        <el-form-item :label="t('product.field.giftComponents')" prop="giftComponents">
          <el-table :data="form.giftComponents" border style="width: 100%">
            <el-table-column :label="t('product.field.componentProduct')" min-width="220">
              <template #default="{ row }">
                <el-select v-model="row.componentProductId" filterable @change="(val: any) => onComponentSelect(row, val)">
                  <el-option v-for="p in componentCandidates" :key="String(p.id)" :label="`${p.productName} (${p.productUnit})`" :value="p.id" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="t('product.field.componentCount')" width="140">
              <template #default="{ row }">
                <el-input-number v-model="row.componentCount" :precision="3" :min="0" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column :label="t('product.field.componentUnit')" width="100">
              <template #default="{ row }">
                <el-input v-model="row.componentUnit" maxlength="16" />
              </template>
            </el-table-column>
            <el-table-column :label="t('product.field.componentSort')" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.componentSort" :min="0" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="" width="80" align="center">
              <template #default="{ $index }">
                <el-button link type="danger" @click="form.giftComponents?.splice($index, 1)">{{ t('common.delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" link style="margin-top: 4px" @click="addComponent">+ {{ t('product.action.addComponent') }}</el-button>
        </el-form-item>
      </template>

      <!-- 共有：图片 / 状态 / 是否发货 / 描述 / 备注 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('product.field.productThumb')" prop="productThumb">
            <OssUpload ref="ossThumbRef" v-model="thumbOssIdsModel" biz-type="product_image" :limit="1" :file-size="10" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('product.field.productImg')" prop="productImg">
            <OssUpload ref="ossImgRef" v-model="imgOssIdsModel" biz-type="product_image" :limit="5" :file-size="10" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('product.field.isDelivery')">
            <el-radio-group v-model="form.isDelivery">
              <el-radio v-for="d in djs_yes_no" :key="d.value" :value="Number(d.value)">{{ d.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('product.field.productStatus')" prop="productStatus">
            <el-radio-group v-model="form.productStatus">
              <el-radio v-for="d in sys_normal_disable" :key="d.value" :value="Number(d.value)">{{ d.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('product.field.productDesc')" prop="productDesc">
            <el-input v-model="form.productDesc" type="textarea" :rows="2" maxlength="500" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('product.field.remark')" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
          </el-form-item>
        </el-col>
      </el-row>
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
import { addProduct, getProduct, listProduct, updateProduct } from '@/api/djs-warehouse/product';
import type { GiftBoxForm, ProductInfoForm, ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listSupplier } from '@/api/djs-common/supplier';
import OssUpload from '@/components/OssUpload/index.vue';
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
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const ossThumbRef = ref<InstanceType<typeof OssUpload>>();
const ossImgRef = ref<InstanceType<typeof OssUpload>>();

const supplierOptions = ref<Array<{ id: number | string; supplierName: string }>>([]);
const componentCandidates = ref<ProductInfoVO[]>([]);

const defaultForm = (): ProductInfoForm => ({
  id: undefined,
  productId: '',
  productName: '',
  productType: 1,
  productUnit: '',
  productSpec: undefined,
  belongType: undefined,
  buyClass: undefined,
  productThumb: undefined,
  productImg: undefined,
  productAttr: undefined,
  productWorkshop: undefined,
  storeLocationId: undefined,
  productStatus: 0,
  productMaterial: undefined,
  productDesc: undefined,
  materialNum: undefined,
  isDelivery: 1,
  supplierId: undefined,
  isBuyOut: 0,
  remark: undefined,
  giftComponents: []
});

const form = ref<ProductInfoForm>(defaultForm());

// OssUpload v-model 期望 number[]；业务字段 productThumb 是单 ossId 字符串 / productImg 是逗号分隔字符串
const thumbOssIdsModel = computed<number[]>({
  get: () => (form.value.productThumb ? [Number(form.value.productThumb)] : []),
  set: (val: number[]) => {
    form.value.productThumb = val && val.length > 0 ? String(val[0]) : undefined;
  }
});
const imgOssIdsModel = computed<number[]>({
  get: () =>
    form.value.productImg
      ? form.value.productImg
          .split(',')
          .map((x) => Number(x))
          .filter((x) => !Number.isNaN(x))
      : [],
  set: (val: number[]) => {
    form.value.productImg = val && val.length > 0 ? val.join(',') : undefined;
  }
});

const dialogTitle = computed(() => (form.value.id ? t('product.title.edit') : t('product.title.add')));

const rules = computed(() => ({
  productType: [{ required: true, message: t('product.rule.productType.required'), trigger: 'change' }],
  productId: [{ required: true, message: t('product.rule.productId.required'), trigger: 'blur' }],
  productName: [{ required: true, message: t('product.rule.productName.required'), trigger: 'blur' }],
  productUnit: [{ required: true, message: t('product.rule.productUnit.required'), trigger: 'blur' }],
  belongType: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (form.value.productType === 1 && !value) {
          callback(new Error(t('product.rule.belongType.required')));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  supplierId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (form.value.productType === 2 && !value) {
          callback(new Error(t('product.rule.supplierId.required')));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = async () => {
  reset();
  await loadSupplierOptions();
  await loadComponentCandidates();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  reset();
  await loadSupplierOptions();
  await loadComponentCandidates();
  const res = await getProduct(id);
  const data = res.data;
  form.value = {
    ...defaultForm(),
    ...data,
    materialNum: data.materialNum != null ? Number(data.materialNum) : undefined,
    giftComponents:
      data.giftComponents?.map((g) => ({
        id: g.id,
        componentProductId: g.componentProductId,
        componentCount: Number(g.componentCount),
        componentUnit: g.componentUnit,
        componentSort: g.componentSort
      })) ?? []
  };
  visible.value = true;
  // 回填 OSS 图片
  await nextTick();
  if (form.value.productThumb) {
    try {
      const ossRes = await listOssByIds(form.value.productThumb);
      const items = (ossRes.data || []).map((o) => ({
        ossId: Number(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossThumbRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[ProductInfoForm] listOssByIds thumb failed', e);
    }
  }
  if (form.value.productImg) {
    try {
      const ossRes = await listOssByIds(form.value.productImg);
      const items = (ossRes.data || []).map((o) => ({
        ossId: Number(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossImgRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[ProductInfoForm] listOssByIds img failed', e);
    }
  }
};

defineExpose({ openCreate, openEdit });

const reset = () => {
  form.value = defaultForm();
};

const handleClosed = () => {
  formRef.value?.resetFields();
  reset();
};

const onTypeChange = (newType: number) => {
  if (newType === 1) {
    form.value.buyClass = undefined;
    form.value.supplierId = undefined;
    form.value.giftComponents = [];
  } else if (newType === 2) {
    form.value.belongType = undefined;
    form.value.productAttr = undefined;
    form.value.productWorkshop = undefined;
    form.value.productMaterial = undefined;
    form.value.materialNum = undefined;
    form.value.giftComponents = [];
  } else if (newType === 3) {
    form.value.belongType = 'gift_box';
    form.value.buyClass = undefined;
    form.value.supplierId = undefined;
    form.value.productAttr = undefined;
    form.value.productWorkshop = undefined;
    form.value.productMaterial = undefined;
    form.value.materialNum = undefined;
    if (!form.value.giftComponents) {
      form.value.giftComponents = [];
    }
  }
};

const addComponent = () => {
  if (!form.value.giftComponents) {
    form.value.giftComponents = [];
  }
  form.value.giftComponents.push({
    componentProductId: '',
    componentCount: 1,
    componentUnit: '',
    componentSort: form.value.giftComponents.length
  });
};

const onComponentSelect = (row: GiftBoxForm, productId: number | string) => {
  const p = componentCandidates.value.find((c) => String(c.id) === String(productId));
  if (p && !row.componentUnit) {
    row.componentUnit = p.productUnit;
  }
};

const loadSupplierOptions = async () => {
  try {
    const res = await listSupplier({ pageNum: 1, pageSize: 200 });
    const rows = (res.rows ?? res.data ?? []) as any[];
    supplierOptions.value = rows.map((r) => ({ id: r.id, supplierName: r.supplierName }));
  } catch (e) {
    console.warn('[ProductInfoForm] loadSupplierOptions failed', e);
    supplierOptions.value = [];
  }
};

const loadComponentCandidates = async () => {
  try {
    // 拉非礼盒产品当候选（礼盒不允许嵌套）；同时排除停用的
    const res = await listProduct({ pageNum: 1, pageSize: 500, productStatus: 0 });
    const rows = (res.rows ?? res.data ?? []) as ProductInfoVO[];
    componentCandidates.value = rows.filter((r) => r.productType !== 3);
  } catch (e) {
    console.warn('[ProductInfoForm] loadComponentCandidates failed', e);
    componentCandidates.value = [];
  }
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    // 礼盒前端二次校验
    if (form.value.productType === 3 && (!form.value.giftComponents || form.value.giftComponents.length === 0)) {
      proxy?.$modal.msgWarning(t('product.rule.giftComponents.required'));
      return;
    }
    submitting.value = true;
    try {
      if (form.value.id) {
        await updateProduct(form.value);
      } else {
        await addProduct(form.value);
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
