<!--
  需求量调整弹框（V6-R140「需求调整管理」）。

  从「需求调整管理」页 → 查看需求抽屉 → 操作列「调整」打开；仓库管理→需求管理那页不出这个入口
  （甲方要的是把改量单独挂到系统管理→数据管理下、单独授权）。

  只改需求量 + 一条备注，不动状态 / 确认人。后端每提交一次往 t_warehouse_demand_adjust_record
  追加一行留痕（需求日期 / 门店 / 产品编码 / 原量 / 新量 / 备注 / 调整人 / 调整时间）。
  可调范围由后端把关（发货之前：DRAFT / SUBMITTED / CONFIRMED），前端按同一套状态隐藏按钮。

  点蒙层自动关闭 —— 不设 close-on-click-modal=false（CLAUDE.md §6.13）。
-->
<template>
  <el-dialog v-model="visible" :title="t('demand.adjust.title')" width="480px" append-to-body destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item :label="t('demand.adjust.storeName')">
        <span class="adj-ro">{{ ctx.storeName || '—' }}</span>
      </el-form-item>
      <el-form-item :label="t('demand.adjust.productName')">
        <span class="adj-ro">{{ ctx.productName || '—' }}</span>
      </el-form-item>
      <el-form-item :label="t('demand.adjust.oldQuantity')">
        <span class="adj-ro">{{ oldQuantityText }}</span>
      </el-form-item>
      <el-form-item :label="t('demand.adjust.newQuantity')" prop="demandQuantity">
        <el-input-number
          v-model="form.demandQuantity"
          :min="minQuantity"
          :max="MAX_QUANTITY"
          :step="step"
          :precision="precision"
          controls-position="right"
          style="width: 220px"
        />
        <span v-if="ctx.productUnit" class="adj-unit">{{ ctx.productUnit }}</span>
      </el-form-item>
      <el-form-item :label="t('demand.adjust.remark')" prop="adjustRemark">
        <el-input
          v-model="form.adjustRemark"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
          :placeholder="t('demand.adjust.remarkPh')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="DemandAdjustDialog" lang="ts">
import { useI18n } from 'vue-i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { adjustDemand } from '@/api/djs-warehouse/demand';
import type { DemandManageVO } from '@/api/djs-warehouse/demand/types';
import { isKgUnit } from '@/utils/weight';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const emit = defineEmits<{ (e: 'success'): void }>();

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();

/** 打开时定格的那一行上下文（只读展示 + 提交时取 id）。 */
const ctx = reactive<{ id: string; storeName: string; productName: string; productUnit: string; oldQuantity: number }>({
  id: '',
  storeName: '',
  productName: '',
  productUnit: '',
  oldQuantity: 0
});

const form = reactive<{ demandQuantity: number | undefined; adjustRemark: string }>({
  demandQuantity: undefined,
  adjustRemark: ''
});

/**
 * kg 类单位保留三位小数、步进 0.1；其余按整件走整数步进。
 * 与列表 formatQty / 下单表单同一套口径，避免「列表显示 5、弹框里变成 5.000」这种视觉打架。
 */
const precision = computed(() => (isKgUnit(ctx.productUnit) ? 3 : 0));
const step = computed(() => (isKgUnit(ctx.productUnit) ? 0.1 : 1));
/** 后端拒 0（清零等于删单，走删除路径），前端下界同步给到最小可填值。 */
const minQuantity = computed(() => (isKgUnit(ctx.productUnit) ? 0.001 : 1));
/**
 * 上界对齐库表 demand_quantity DECIMAL(12,3) 的整数部分（9 位）。
 * 不设的话用户能从这个输入框直接打出超长整数，后端 @Digits 会拒，但用户白填一趟；
 * 且没有 @Digits 之前它会漏成通用 500「发生未知异常」。
 */
const MAX_QUANTITY = 999999999;

const oldQuantityText = computed(() => {
  const n = Number(ctx.oldQuantity ?? 0);
  const num = isKgUnit(ctx.productUnit) ? n.toFixed(3) : String(Math.round(n));
  return ctx.productUnit ? `${num} ${ctx.productUnit}` : num;
});

const rules = computed<FormRules>(() => ({
  demandQuantity: [
    { required: true, message: t('demand.adjust.rule.quantityRequired'), trigger: 'blur' },
    {
      validator: (_r: unknown, value: number, cb: (e?: Error) => void) => {
        if (value == null || Number.isNaN(Number(value))) return cb(new Error(t('demand.adjust.rule.quantityRequired')));
        if (Number(value) <= 0) return cb(new Error(t('demand.adjust.rule.quantityPositive')));
        if (Number(value) === Number(ctx.oldQuantity)) return cb(new Error(t('demand.adjust.rule.quantityUnchanged')));
        cb();
      },
      trigger: 'blur'
    }
  ]
}));

/** 抽屉操作列调用：定格该行上下文 → 需求量预填原值 → 打开。 */
function open(row: DemandManageVO, storeName: string) {
  ctx.id = String(row.id);
  ctx.storeName = storeName;
  ctx.productName = row.productName ?? '';
  ctx.productUnit = row.productUnit ?? '';
  ctx.oldQuantity = Number(row.demandQuantity ?? 0);
  form.demandQuantity = ctx.oldQuantity;
  form.adjustRemark = '';
  visible.value = true;
}

async function onSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    await adjustDemand(ctx.id, {
      demandQuantity: Number(form.demandQuantity),
      adjustRemark: form.adjustRemark || undefined
    });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>

<style scoped>
.adj-ro {
  color: var(--el-text-color-regular);
}
.adj-unit {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}
</style>
