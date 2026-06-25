<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="920px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <!-- 公共字段：产品类型 / 编码 / 名称 / 单位 / 规格 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t(isGoods ? 'product.field.goodsType' : 'product.field.productType')" prop="productType">
            <el-select v-model="form.productType" :disabled="!!form.id || lockType" @change="onTypeChange">
              <el-option v-for="d in typeOptions" :key="d.value" :label="d.label" :value="Number(d.value)" />
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
          <!-- row29：自产产品「产品类别(归属类型)」必填，显示红星 -->
          <el-col :span="12">
            <el-form-item :label="t('product.field.belongType')" prop="belongType" required>
              <el-select v-model="form.belongType" clearable>
                <el-option v-for="d in djs_belong_type" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- row29：存储仓库必填（入库时锁定到此库位） -->
          <el-col :span="12">
            <el-form-item :label="t('product.field.storeLocation')" prop="storeLocationId" required>
              <el-select
                v-model="form.storeLocationId"
                filterable
                clearable
                :placeholder="t('product.placeholder.storeLocation')"
                style="width: 100%"
              >
                <el-option v-for="l in locationOptions" :key="String(l.id)" :label="l.locationName" :value="String(l.id)" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- row29：产品属性必填 -->
          <el-col :span="12">
            <el-form-item :label="t('product.field.productAttr')" prop="productAttr" required>
              <el-select v-model="form.productAttr" clearable @change="onProductAttrChange">
                <el-option v-for="d in djs_product_attr" :key="d.value" :label="d.label" :value="Number(d.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- row29：生产车间——原材料(productAttr=2)非必填，其余必填（row69） -->
          <el-col :span="12">
            <el-form-item :label="t('product.field.productWorkshop')" prop="productWorkshop" :required="form.productAttr !== 2">
              <el-select v-model="form.productWorkshop" clearable>
                <el-option v-for="d in djs_product_workshop" :key="d.value" :label="d.label" :value="Number(d.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 生产产品(product_attr=1)可关联一个原材料产品（FK→product.id）：成品→原材料映射，供毛菜/打包链路降级消费 -->
          <template v-if="form.productAttr === 1">
            <el-col :span="12">
              <el-form-item :label="t('product.field.productMaterial')" prop="productMaterial">
                <el-select
                  v-model="form.productMaterial"
                  filterable
                  clearable
                  style="width: 100%"
                  :placeholder="t('product.placeholder.productMaterialSelect')"
                >
                  <el-option
                    v-for="m in materialCandidates"
                    :key="String(m.id)"
                    :label="`${m.productName} (${m.productUnit})`"
                    :value="m.id"
                  />
                </el-select>
                <el-text v-if="materialCandidates.length === 0" size="small" type="info">
                  {{ t('product.tip.materialEmpty') }}
                </el-text>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('product.field.materialNum')" prop="materialNum">
                <el-input-number v-model="form.materialNum" :precision="3" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </template>
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
            <el-form-item :label="t('product.field.supplierId')" prop="supplierId" required>
              <el-select v-model="form.supplierId" filterable :placeholder="t('product.placeholder.supplierId')">
                <el-option v-for="s in supplierOptions" :key="String(s.id)" :label="s.supplierName" :value="s.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- row24：归属类型已去除（外购商品业态由供应商/分类决定，无需手选归属） -->
          <el-col :span="12">
            <el-form-item :label="t('product.field.storeLocation')" prop="storeLocationId" required>
              <el-select
                v-model="form.storeLocationId"
                filterable
                :placeholder="t('product.placeholder.storeLocation')"
                style="width: 100%"
              >
                <el-option v-for="l in locationOptions" :key="String(l.id)" :label="l.locationName" :value="String(l.id)" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <!-- 共有：图片 / 是否支持外购 / 状态 / 描述（备注字段保留入库，表单不再展示） -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('product.field.productThumb')" prop="productThumb">
            <OssUpload ref="ossThumbRef" v-model="thumbOssIdsModel" biz-type="product_image" :limit="1" :file-size="10" />
          </el-form-item>
        </el-col>
        <!-- row24：外购商品（productType=2）不展示「是否支持外购」；自产/礼盒保留 -->
        <el-col v-if="form.productType !== 2" :span="12">
          <el-form-item :label="t('product.field.isBuyOutSupport')">
            <el-radio-group v-model="form.isBuyOut">
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
import type { ProductInfoForm, ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listSupplier } from '@/api/djs-common/supplier';
import { listLocation } from '@/api/djs-warehouse/location';
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
/** 由菜单入口（产品/商品/礼盒）预置并锁定 productType：新增态也禁用类型下拉 */
const lockType = ref(false);
/**
 * 入口允许的 productType 集合（产品配置 [1,3]=自产+礼盒 / 商品配置 [2]=外购）。
 * 为空表示无入口限制（兼容旧调用），下拉给全量字典。
 */
const allowedTypes = ref<number[]>([]);
const formRef = ref<ElFormInstance>();
const ossThumbRef = ref<InstanceType<typeof OssUpload>>();

const supplierOptions = ref<Array<{ id: number | string; supplierName: string }>>([]);
/** 原材料候选（product_attr=2 原材料）：生产产品关联原材料下拉，FK→product.id */
const materialCandidates = ref<ProductInfoVO[]>([]);
/** 存储库位下拉（row118/119：归属类型右侧选存储库位，入库时锁定到此库位） */
const locationOptions = ref<Array<{ id: number | string; locationName: string }>>([]);

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
  remark: undefined
});

const form = ref<ProductInfoForm>(defaultForm());

// OssUpload v-model string[]（雪花 ossId 全链路 string）；业务字段 productThumb 是单 ossId 字符串
const thumbOssIdsModel = computed<string[]>({
  get: () => (form.value.productThumb ? [form.value.productThumb] : []),
  set: (val: string[]) => {
    form.value.productThumb = val && val.length > 0 ? val[0] : undefined;
  }
});

/** 商品配置入口（仅外购 [2]）下文案显示「商品」；产品配置（含自产/礼盒）显示「产品」 */
const isGoods = computed(() => allowedTypes.value.length === 1 && allowedTypes.value[0] === 2);

/** 类型下拉按入口允许集合过滤（产品配置不出现外购；商品配置不出现自产/礼盒） */
const typeOptions = computed<Array<{ value: number | string; label: string }>>(() => {
  const all = djs_product_type.value ?? [];
  if (allowedTypes.value.length === 0) return all;
  return all.filter((d: { value: number | string }) => allowedTypes.value.includes(Number(d.value)));
});

const dialogTitle = computed(() => {
  if (isGoods.value) {
    return form.value.id ? t('product.title.goodsEdit') : t('product.title.goodsAdd');
  }
  return form.value.id ? t('product.title.productEdit') : t('product.title.productAdd');
});

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
  ],
  // row24/row29：存储仓库必填（自产 productType=1 / 外购 productType=2 均必填；礼盒不要求）
  storeLocationId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if ((form.value.productType === 1 || form.value.productType === 2) && !value) {
          callback(new Error(t('product.rule.storeLocation.required')));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  // row29：自产产品属性必填
  productAttr: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (form.value.productType === 1 && (value === undefined || value === null || value === '')) {
          callback(new Error(t('product.rule.productAttr.required')));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  // row29/row69：自产生产车间必填，但原材料(productAttr=2)非必填
  productWorkshop: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (form.value.productType === 1 && form.value.productAttr !== 2 && (value === undefined || value === null || value === '')) {
          callback(new Error(t('product.rule.productWorkshop.required')));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  productSpec: [
    {
      // 生产产品(product_attr=1) 必填规格（doc/14 §4；打包卡按规格展示，「按重量/散装」非空即合规）
      validator: (_rule: any, value: any, callback: any) => {
        if (form.value.productType === 1 && form.value.productAttr === 1 && !value) {
          callback(new Error(t('product.rule.productSpec.required')));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = async (presetType?: number, types?: number[]) => {
  reset();
  allowedTypes.value = types ? [...types] : [];
  // 入口预置 productType（产品=1 / 商品=2 / 礼盒=3）
  if (presetType !== undefined) {
    form.value.productType = presetType;
    // 入口只允许单一类型（如商品配置 [2]）才锁死下拉；产品配置 [1,3] 允许自产↔礼盒切换
    lockType.value = allowedTypes.value.length === 1;
    // 触发类型分支字段初始化（如礼盒 belongType='gift_box'）
    onTypeChange(presetType);
  }
  await Promise.all([loadSupplierOptionsIfNeeded(), loadProductCandidates(), loadLocationOptions()]);
  visible.value = true;
};

const openEdit = async (id: number | string, types?: number[]) => {
  reset();
  allowedTypes.value = types ? [...types] : [];
  const [, , , res] = await Promise.all([
    loadSupplierOptionsIfNeeded(),
    loadProductCandidates(id),
    loadLocationOptions(),
    getProduct(id)
  ]);
  const data = res.data;
  form.value = {
    ...defaultForm(),
    ...data,
    materialNum: data.materialNum != null ? Number(data.materialNum) : undefined
  };
  visible.value = true;
  // 回填 OSS 图片
  await nextTick();
  if (form.value.productThumb) {
    try {
      const ossRes = await listOssByIds(form.value.productThumb);
      const items = (ossRes.data || []).map((o) => ({
        ossId: String(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossThumbRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[ProductInfoForm] listOssByIds thumb failed', e);
    }
  }
};

defineExpose({ openCreate, openEdit });

const reset = () => {
  form.value = defaultForm();
  lockType.value = false;
  allowedTypes.value = [];
};

const handleClosed = () => {
  formRef.value?.resetFields();
  reset();
};

const onTypeChange = (newType: number) => {
  if (newType === 1) {
    form.value.buyClass = undefined;
    form.value.supplierId = undefined;
  } else if (newType === 2) {
    form.value.belongType = undefined;
    form.value.productAttr = undefined;
    form.value.productWorkshop = undefined;
    form.value.productMaterial = undefined;
    form.value.materialNum = undefined;
    // 切到外购才需要供应商下拉：尚未加载则懒加载一次（产品配置入口 [1,3] 初始不拉慢接口）
    if (supplierOptions.value.length === 0) {
      void loadSupplierOptions();
    }
  } else if (newType === 3) {
    form.value.belongType = 'gift_box';
    form.value.buyClass = undefined;
    form.value.supplierId = undefined;
    form.value.productAttr = undefined;
    form.value.productWorkshop = undefined;
    form.value.productMaterial = undefined;
    form.value.materialNum = undefined;
  }
};

/** 产品属性切换：离开「生产产品」(1) 时清空原材料关联，避免遗留孤儿映射 */
const onProductAttrChange = (attr?: number) => {
  if (attr !== 1) {
    form.value.productMaterial = undefined;
    form.value.materialNum = undefined;
  }
  // row69：切到原材料(2)后生产车间转非必填，清掉可能残留的旧必填错误文案
  formRef.value?.clearValidate('productWorkshop');
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

/**
 * 供应商下拉仅外购(productType=2)使用，慢接口（N+1）。
 * 只有「可能用到外购」时才加载：入口 allowedTypes 含 2，或当前 productType 已是 2。
 * 产品配置入口 [1,3] 完全跳过；切到外购时由 onTypeChange 懒加载。
 */
const loadSupplierOptionsIfNeeded = async () => {
  const mayUseSupplier = allowedTypes.value.includes(2) || form.value.productType === 2;
  if (!mayUseSupplier) return;
  await loadSupplierOptions();
};

const loadLocationOptions = async () => {
  if (locationOptions.value.length > 0) return;
  try {
    const res = await listLocation({ pageNum: 1, pageSize: 500 } as any);
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: number | string; locationName: string }>;
    locationOptions.value = rows.map((r) => ({ id: r.id, locationName: r.locationName }));
  } catch (e) {
    console.warn('[ProductInfoForm] loadLocationOptions failed', e);
    locationOptions.value = [];
  }
};

/**
 * 原材料候选（product_attr=2）：生产产品关联原材料下拉，编辑态排除自身（不能关联自己当原材料）。
 * 后端 list 不按 product_attr 过滤，故全量拉取后前端筛。
 */
const loadProductCandidates = async (excludeId?: number | string) => {
  try {
    const res = await listProduct({ pageNum: 1, pageSize: 500, productStatus: 0 });
    const rows = (res.rows ?? res.data ?? []) as ProductInfoVO[];
    materialCandidates.value = rows.filter((r) => r.productAttr === 2 && (excludeId == null || String(r.id) !== String(excludeId)));
  } catch (e) {
    console.warn('[ProductInfoForm] loadProductCandidates failed', e);
    materialCandidates.value = [];
  }
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
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
