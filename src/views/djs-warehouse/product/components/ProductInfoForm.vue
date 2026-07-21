<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="920px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <!-- 公共字段：编码 / 名称 / 单位 / 规格（产品类型由菜单入口预置固定：产品配置=自产，商品配置=外购；礼盒 = 自产 + 产品类别选「礼盒产品」） -->
      <el-row :gutter="16">
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
        <!-- row15：产品别名（非必填），规格字段后 -->
        <el-col :span="12">
          <el-form-item :label="t('product.field.productAlias')" prop="productAlias">
            <el-input
              v-model="form.productAlias"
              maxlength="128"
              show-word-limit
              :placeholder="t('product.placeholder.productAlias')"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 自产专属 -->
      <template v-if="form.productType === 1">
        <el-row :gutter="16">
          <!-- row43①：产品属性与产品类别展示位置互换（产品属性在前）。row29：产品属性必填；礼盒为独立成品不要求 -->
          <el-col :span="12">
            <el-form-item :label="t('product.field.productAttr')" prop="productAttr" :required="!isGiftBoxForm()">
              <el-select v-model="form.productAttr" clearable @change="onProductAttrChange">
                <el-option v-for="d in djs_product_attr" :key="d.value" :label="d.label" :value="Number(d.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- row43②：存储仓库——产品属性=生产产品(product_attr=1)时非必填，其余维持必填；礼盒为独立成品不要求
               （需求措辞「产品类别=生产产品」：djs_belong_type 字典无「生产产品」值，「生产产品」= djs_product_attr=1，故按 productAttr===1 判定）-->
          <el-col :span="12">
            <el-form-item :label="t('product.field.storeLocation')" prop="storeLocationId" :required="!isGiftBoxForm() && form.productAttr !== 1">
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
          <!-- row43①：产品属性与产品类别展示位置互换（产品类别在后）。row29：自产产品「产品类别(归属类型)」必填，显示红星 -->
          <el-col :span="12">
            <el-form-item :label="t('product.field.belongType')" prop="belongType" required>
              <el-select v-model="form.belongType" clearable @change="onBelongTypeChange">
                <el-option v-for="d in djs_belong_type" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- row29：生产车间——原材料(productAttr=2)非必填，其余必填（row69）；礼盒不要求 -->
          <el-col :span="12">
            <el-form-item :label="t('product.field.productWorkshop')" prop="productWorkshop" :required="!isGiftBoxForm() && form.productAttr !== 2">
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
        <!-- row24：外购商品（productType=2）不展示「是否支持外购」；自产（含礼盒）保留 -->
        <el-col v-if="form.productType !== 2" :span="12">
          <el-form-item :label="t('product.field.isBuyOutSupport')">
            <el-radio-group v-model="form.isBuyOut">
              <el-radio v-for="d in djs_yes_no" :key="d.value" :value="Number(d.value)">{{ d.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <!-- 流程性问题 row11：是否原材料外售（自产产品可配；为「是」时门店盘点/退回按其关联原材料口径处理） -->
        <el-col v-if="form.productType !== 2" :span="12">
          <el-form-item :label="t('product.field.isMaterialSold')">
            <el-radio-group v-model="form.isMaterialSold">
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
const { djs_belong_type, djs_buy_class, djs_product_attr, djs_product_workshop, djs_yes_no, sys_normal_disable } = toRefs<any>(
  proxy?.useDict('djs_belong_type', 'djs_buy_class', 'djs_product_attr', 'djs_product_workshop', 'djs_yes_no', 'sys_normal_disable')
);

const visible = ref(false);
const submitting = ref(false);
/**
 * 入口允许的 productType 集合（产品配置 [1]=自产含礼盒 / 商品配置 [2]=外购）。
 * 由菜单入口预置并锁定 productType（无产品类型下拉，用户不可改）；用于区分商品/产品文案 + 供应商懒加载。
 */
const allowedTypes = ref<number[]>([]);
const formRef = ref<ElFormInstance>();
const ossThumbRef = ref<InstanceType<typeof OssUpload>>();

const supplierOptions = ref<Array<{ id: number | string; supplierName: string }>>([]);
/** 原材料候选池（product_attr=2 原材料，已排除自身）：全量拉取，下拉再按产品类别过滤。 */
const rawMaterialPool = ref<ProductInfoVO[]>([]);
/** 存储库位下拉（row118/119：归属类型右侧选存储库位，入库时锁定到此库位） */
const locationOptions = ref<Array<{ id: number | string; locationName: string }>>([]);

const defaultForm = (): ProductInfoForm => ({
  id: undefined,
  productId: '',
  productName: '',
  productType: 1,
  productUnit: '',
  productSpec: undefined,
  productAlias: undefined,
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
  isMaterialSold: 0,
  remark: undefined
});

const form = ref<ProductInfoForm>(defaultForm());

/**
 * 原材料下拉候选：只显示与当前产品「产品类别(belongType)」相同的原材料
 *（Kevin 2026-06-26：如鸡蛋产品只关联鸡蛋类原材料，不混其他类别）。
 * 产品类别未选时不过滤（避免选类别前下拉为空）。
 */
const materialCandidates = computed<ProductInfoVO[]>(() => {
  const cat = form.value.belongType;
  if (!cat) return rawMaterialPool.value;
  return rawMaterialPool.value.filter((m) => m.belongType === cat);
});

// OssUpload v-model string[]（雪花 ossId 全链路 string）；业务字段 productThumb 是单 ossId 字符串
const thumbOssIdsModel = computed<string[]>({
  get: () => (form.value.productThumb ? [form.value.productThumb] : []),
  set: (val: string[]) => {
    form.value.productThumb = val && val.length > 0 ? val[0] : undefined;
  }
});

/** 礼盒 = 自产（productType=1）+ 产品类别 gift_box：独立成品，跳过产品属性/生产车间/规格/存储仓库等额外必填。 */
const isGiftBoxForm = () => form.value.productType === 1 && form.value.belongType === 'gift_box';

/** 商品配置入口（仅外购 [2]）下文案显示「商品」；产品配置（自产含礼盒）显示「产品」 */
const isGoods = computed(() => allowedTypes.value.length === 1 && allowedTypes.value[0] === 2);

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
  // row24/row29：存储仓库必填（自产 productType=1 / 外购 productType=2）；礼盒（自产 + 产品类别 gift_box）为独立成品不要求
  // row43②：自产且产品属性=生产产品(product_attr=1)时非必填（需求「产品类别=生产产品」→ djs_belong_type 无此值，取 product_attr=1）
  storeLocationId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        const selfProducedExemptByAttr = form.value.productType === 1 && form.value.productAttr === 1;
        if (!isGiftBoxForm() && !selfProducedExemptByAttr && (form.value.productType === 1 || form.value.productType === 2) && !value) {
          callback(new Error(t('product.rule.storeLocation.required')));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  // row29：自产产品属性必填（礼盒为独立成品不要求）
  productAttr: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!isGiftBoxForm() && form.value.productType === 1 && (value === undefined || value === null || value === '')) {
          callback(new Error(t('product.rule.productAttr.required')));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  // row29/row69：自产生产车间必填，但原材料(productAttr=2)非必填、礼盒不要求
  productWorkshop: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!isGiftBoxForm() && form.value.productType === 1 && form.value.productAttr !== 2 && (value === undefined || value === null || value === '')) {
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
      // 生产产品(product_attr=1) 必填规格（doc/14 §4；打包卡按规格展示，「按重量/散装」非空即合规）；礼盒为独立成品不要求
      validator: (_rule: any, value: any, callback: any) => {
        if (!isGiftBoxForm() && form.value.productType === 1 && form.value.productAttr === 1 && !value) {
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
  // 入口预置并固定 productType（产品配置=1 自产 / 商品配置=2 外购）；无产品类型下拉，用户不可改。
  // 礼盒 = 自产 + 用户在「产品类别」选 gift_box。
  if (presetType !== undefined) {
    form.value.productType = presetType;
    // 初始化类型分支字段（外购清自产字段 + 懒加载供应商）
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
  allowedTypes.value = [];
};

const handleClosed = () => {
  formRef.value?.resetFields();
  reset();
};

/**
 * 入口预置 productType 后初始化类型分支字段（productType 由菜单入口固定，不再由用户切换）：
 * 产品配置=1 自产（清外购字段），商品配置=2 外购（清自产字段 + 懒加载供应商下拉）。
 * 礼盒 = 自产 + 用户在「产品类别」选 gift_box，无独立类型分支。
 */
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
    // 切到外购才需要供应商下拉：尚未加载则懒加载一次（产品配置入口 [1] 初始不拉慢接口）
    if (supplierOptions.value.length === 0) {
      void loadSupplierOptions();
    }
  }
};

/** 产品类别切换：原材料下拉按类别过滤，已选原材料若不在新类别候选内则清空，避免提交跨类别孤儿映射 */
const onBelongTypeChange = () => {
  if (form.value.productMaterial == null) return;
  const stillValid = materialCandidates.value.some((m) => String(m.id) === String(form.value.productMaterial));
  if (!stillValid) {
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
 * 产品配置入口 [1]（自产含礼盒）完全跳过。
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
    // admin row19：产品总数 >500，原「拉前 500 混合再客户端筛 attr=2」会把排在 500 之后的 pork 原材料
    // （分割间精瘦肉/排骨等）截断，导致原材料下拉只剩少数。改为服务端 productAttr=2 过滤只拉原材料（≤500 一页装下）。
    const res = await listProduct({ pageNum: 1, pageSize: 500, productStatus: 0, productAttr: 2 });
    const rows = (res.rows ?? res.data ?? []) as ProductInfoVO[];
    rawMaterialPool.value = rows.filter((r) => r.productAttr === 2 && (excludeId == null || String(r.id) !== String(excludeId)));
  } catch (e) {
    console.warn('[ProductInfoForm] loadProductCandidates failed', e);
    rawMaterialPool.value = [];
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
