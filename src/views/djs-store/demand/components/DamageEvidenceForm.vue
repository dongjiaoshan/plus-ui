<template>
  <!-- 记为损坏 / 修改损坏凭证（规则 13：el-dialog 默认点蒙层关闭，不加 :close-on-click-modal） -->
  <el-dialog v-model="visible" :title="dialogTitle" width="560px" destroy-on-close append-to-body @closed="onClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('storeDemand.damage.evidence')" prop="evidenceOssIds">
        <OssUpload
          ref="ossRef"
          v-model="form.evidenceOssIds"
          biz-type="warehouse_damage_evidence"
          :limit="9"
          :file-size="10"
          @update:model-value="onOssChange"
        />
      </el-form-item>
      <el-form-item :label="t('storeDemand.damage.remark')" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" :maxlength="200" show-word-limit :placeholder="t('storeDemand.damage.remarkPh')" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="DamageEvidenceForm" lang="ts">
import OssUpload from '@/components/OssUpload/index.vue';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { markProductionDamage } from '@/api/djs-warehouse/production';
import type { ProductProductionVO } from '@/api/djs-warehouse/production/types';
import { useI18n } from 'vue-i18n';
import type { FormInstance, FormRules } from 'element-plus';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const emit = defineEmits<{ (e: 'success'): void }>();

const visible = ref(false);
const submitting = ref(false);
const ossRef = ref<InstanceType<typeof OssUpload>>();
const formRef = ref<FormInstance>();

/** 当前操作的产品生产记录 id（雪花 string）；标损 / 修改共用 */
const currentId = ref<string>('');
/** 是否「修改」（已损坏 → 改凭证）；否则「记为损坏」 */
const isEdit = ref(false);

const form = reactive<{ evidenceOssIds: string[]; remark: string }>({
  evidenceOssIds: [],
  remark: ''
});

const dialogTitle = computed(() => (isEdit.value ? t('storeDemand.damage.editTitle') : t('storeDemand.damage.markTitle')));

const rules = computed<FormRules>(() => ({
  evidenceOssIds: [
    {
      required: true,
      // OssUpload v-model 是 string[]，用 validator 判空（required 单独对数组不触发）
      validator: (_rule, value, callback) => {
        if (Array.isArray(value) && value.length > 0) {
          callback();
        } else {
          callback(new Error(t('storeDemand.damage.evidenceRequired')));
        }
      },
      trigger: 'change'
    }
  ]
}));

/** OssUpload 上传 / 删除后同步触发校验，清掉已满足时的红字 */
function onOssChange() {
  formRef.value?.validateField('evidenceOssIds').catch(() => undefined);
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    await markProductionDamage({
      id: currentId.value,
      evidenceOssIds: form.evidenceOssIds.join(','),
      remark: form.remark || undefined
    });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

function onClosed() {
  form.evidenceOssIds = [];
  form.remark = '';
  currentId.value = '';
  isEdit.value = false;
}

/**
 * 打开弹框。
 * @param row 产品生产记录（is_damaged=1 → 修改模式，回填已有凭证 / 备注）
 */
async function open(row: ProductProductionVO) {
  currentId.value = String(row.id);
  isEdit.value = row.isDamaged === 1;
  form.remark = row.damageRemark ?? '';
  // 修改模式回填已有凭证 ossId（CSV → string[]）。OssUpload 不 watch v-model，编辑回显必须显式
  // listByIds 拿 url 再 setExistingFiles，否则上传区空白、用户看不到/删不掉已有凭证图。
  const ossIds = row.damageEvidenceOssIds ? row.damageEvidenceOssIds.split(',').filter(Boolean) : [];
  form.evidenceOssIds = ossIds;
  visible.value = true;
  await nextTick();
  if (ossIds.length) {
    try {
      const ossRes = await listOssByIds(ossIds.join(','));
      const items = (ossRes.data || []).map((o) => ({
        ossId: String(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[DamageEvidenceForm] listOssByIds failed', e);
    }
  }
}

defineExpose({ open });
</script>
