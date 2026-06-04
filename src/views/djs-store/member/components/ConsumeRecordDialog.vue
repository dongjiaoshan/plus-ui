<template>
  <el-dialog v-model="visible" :title="t('storeMember.consume.title', { name: memberName })" destroy-on-close append-to-body width="760px">
    <div class="mb-3 flex justify-end">
      <el-button v-hasPermi="['djs:store:member:consume:add']" type="primary" icon="Plus" @click="openEntry">
        {{ t('storeMember.consume.add') }}
      </el-button>
    </div>

    <el-table v-loading="loading" :data="records" border height="360">
      <el-table-column :label="t('storeMember.consume.consumeDate')" prop="consumeDate" width="170" align="center" />
      <el-table-column :label="t('storeMember.consume.sku')" prop="sku" min-width="140" show-overflow-tooltip />
      <el-table-column :label="t('storeMember.consume.quantity')" prop="quantity" width="90" align="right" />
      <el-table-column :label="t('storeMember.consume.amountManual')" prop="amountManual" width="100" align="right" />
      <el-table-column :label="t('storeMember.consume.notes')" prop="notes" min-width="140" show-overflow-tooltip />
      <el-table-column :label="t('storeMember.consume.operator')" prop="operatorName" width="100" align="center" />
      <el-table-column :label="t('storeMember.consume.createTime')" prop="createTime" width="160" align="center" />
      <template #empty>{{ t('storeMember.consume.empty') }}</template>
    </el-table>

    <!-- 录入弹窗 -->
    <el-dialog v-model="entryVisible" :title="t('storeMember.consume.entryTitle')" append-to-body width="460px" @closed="resetEntry">
      <el-form ref="entryFormRef" :model="entryForm" :rules="entryRules" label-width="90px">
        <el-form-item :label="t('storeMember.consume.consumeDate')" prop="consumeDate">
          <el-date-picker
            v-model="entryForm.consumeDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            :placeholder="t('storeMember.consume.consumeDatePlaceholder')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('storeMember.consume.sku')">
          <el-input v-model="entryForm.sku" maxlength="64" :placeholder="t('storeMember.consume.skuPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('storeMember.consume.quantity')">
          <el-input-number v-model="entryForm.quantity" :min="0" :precision="2" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('storeMember.consume.amountManual')">
          <el-input-number v-model="entryForm.amountManual" :min="0" :precision="2" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('storeMember.consume.notes')">
          <el-input v-model="entryForm.notes" type="textarea" :rows="2" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="entryVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submitEntry">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup name="ConsumeRecordDialog" lang="ts">
import { listStoreMemberConsume, addStoreMemberConsume } from '@/api/djs-store/member';
import type { StoreMemberConsumptionForm, StoreMemberConsumptionVO, StoreMemberVO } from '@/api/djs-store/member/types';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const loading = ref(false);
const memberId = ref<string>('');
const memberName = ref<string>('');
const memberStoreId = ref<string | undefined>(undefined);
const records = ref<StoreMemberConsumptionVO[]>([]);

const entryVisible = ref(false);
const submitting = ref(false);
const entryFormRef = ref<FormInstance>();

const defaultEntry = (): StoreMemberConsumptionForm => ({
  memberId: '',
  consumeDate: '',
  storeId: undefined,
  sku: '',
  quantity: undefined,
  amountManual: undefined,
  notes: ''
});
const entryForm = reactive<StoreMemberConsumptionForm>(defaultEntry());

const entryRules: FormRules = {
  consumeDate: [{ required: true, message: t('storeMember.consume.consumeDateRequired'), trigger: 'change' }]
};

function open(row: StoreMemberVO) {
  memberId.value = row.id;
  memberName.value = row.memberName;
  memberStoreId.value = row.storeId ?? undefined;
  visible.value = true;
  fetchRecords();
}

async function fetchRecords() {
  loading.value = true;
  try {
    const res = await listStoreMemberConsume(memberId.value);
    records.value = (res.data ?? []) as StoreMemberConsumptionVO[];
  } finally {
    loading.value = false;
  }
}

function openEntry() {
  Object.assign(entryForm, defaultEntry());
  entryForm.memberId = memberId.value;
  entryForm.storeId = memberStoreId.value;
  // 默认消费日期 = 当前时间
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  entryForm.consumeDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  entryVisible.value = true;
}

function resetEntry() {
  entryFormRef.value?.resetFields();
}

async function submitEntry() {
  await entryFormRef.value?.validate();
  submitting.value = true;
  try {
    await addStoreMemberConsume({ ...entryForm, memberId: memberId.value });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    entryVisible.value = false;
    fetchRecords();
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>
