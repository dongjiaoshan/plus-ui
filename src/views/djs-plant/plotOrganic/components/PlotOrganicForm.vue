<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="900px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('plantPlotOrganic.field.organicNo')" prop="organicNo">
            <el-input v-model="form.organicNo" :placeholder="t('plantPlotOrganic.placeholder.organicNo')" :disabled="!!form.id" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('plantPlotOrganic.field.organicCompany')" prop="organicCompany">
            <el-input v-model="form.organicCompany" :placeholder="t('plantPlotOrganic.placeholder.organicCompany')" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('plantPlotOrganic.field.organicValid')" prop="organicValid">
            <el-date-picker
              v-model="form.organicValid"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('plantPlotOrganic.placeholder.organicValid')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" />
        <el-col :span="12">
          <el-form-item :label="t('plantPlotOrganic.field.organicImagePreview')" prop="organicImagePreview">
            <OssUpload ref="ossThumbRef" v-model="thumbOssIdsModel" biz-type="plant_organic" :limit="1" :file-size="10" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('plantPlotOrganic.field.organicImageUrl')" prop="organicImageUrl">
            <OssUpload ref="ossImgRef" v-model="imgOssIdsModel" biz-type="plant_organic" :limit="9" :file-size="10" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('plantPlotOrganic.field.zone')" prop="zoneId">
            <el-select v-model="selectedZoneId" filterable clearable :placeholder="t('plantPlotOrganic.placeholder.zone')" style="width: 100%">
              <el-option v-for="z in zoneOptions" :key="z.id" :label="z.zoneName" :value="String(z.id)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('plantPlotOrganic.field.relatedPlots')" prop="plotIds">
            <el-transfer
              v-model="form.plotIds"
              :data="plotTransferData"
              :titles="[t('plantPlotOrganic.unselected'), t('plantPlotOrganic.selected')]"
              filterable
              :filter-placeholder="t('plantPlotOrganic.placeholder.search')"
              style="width: 100%"
            />
            <div class="form-tip">{{ t('plantPlotOrganic.tip.crossZone') }}</div>
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
import { addPlotOrganic, getPlotOrganic, updatePlotOrganic } from '@/api/djs-plant/plotOrganic';
import { listPlot } from '@/api/djs-plant/plot';
import { listAllZone } from '@/api/djs-plant/zone';
import OssUpload from '@/components/OssUpload/index.vue';
import { listByIds as listOssByIds } from '@/api/system/oss';
import type { PlotOrganicForm } from '@/api/djs-plant/plotOrganic/types';
import type { PlotInfoVO } from '@/api/djs-plant/plot/types';
import type { PlotZoneVO } from '@/api/djs-plant/zone/types';
import { useI18n } from 'vue-i18n';
import { useOssBridge } from '@/composables/useOssBridge';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const ossThumbRef = ref<InstanceType<typeof OssUpload>>();
const ossImgRef = ref<InstanceType<typeof OssUpload>>();

const allPlots = ref<PlotInfoVO[]>([]);
const zoneOptions = ref<PlotZoneVO[]>([]);
// K179：先选片区再选地块。选了片区只列该片区下地块；G7(a) 已选地块（跨片区）始终保留在右栏可见。
const selectedZoneId = ref<string>('');
const plotTransferData = computed(() => {
  const selected = new Set((form.value.plotIds || []).map(String));
  return allPlots.value
    .filter((p) => !selectedZoneId.value || String(p.zoneId) === selectedZoneId.value || selected.has(String(p.id)))
    .map((p) => ({
      key: String(p.id),
      label: `${p.plotCode}  ${p.plotName}`,
      disabled: false
    }));
});

const defaultForm = (): PlotOrganicForm & { plotIds: string[] } => ({
  id: undefined,
  organicNo: '',
  organicCompany: '',
  organicValid: '',
  organicImagePreview: undefined,
  organicImageUrl: undefined,
  plotIds: []
});

const form = ref<PlotOrganicForm & { plotIds: string[] }>(defaultForm());

// OssUpload v-model string[]（雪花 ossId 全链路 string）；业务字段是单/多 ossId 字符串（useOssBridge 桥接）
const thumbOssIdsModel = useOssBridge(form, 'organicImagePreview', 'single');
const imgOssIdsModel = useOssBridge(form, 'organicImageUrl', 'multi');

const rules = computed(() => ({
  organicNo: [{ required: true, message: t('plantPlotOrganic.rule.organicNo.required'), trigger: 'blur' }],
  organicCompany: [{ required: true, message: t('plantPlotOrganic.rule.organicCompany.required'), trigger: 'blur' }],
  organicValid: [{ required: true, message: t('plantPlotOrganic.rule.organicValid.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('plantPlotOrganic.title.edit') : t('plantPlotOrganic.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

async function ensurePlotList() {
  if (allPlots.value.length > 0) return;
  try {
    const res = await listPlot({ pageNum: 1, pageSize: 1000 } as any);
    allPlots.value = (res.rows ?? res.data ?? []) as PlotInfoVO[];
  } catch (e) {
    console.warn('[PlotOrganicForm] listPlot failed', e);
  }
}

async function ensureZoneList() {
  if (zoneOptions.value.length > 0) return;
  try {
    const res = await listAllZone();
    const all = (res.rows ?? res.data ?? []) as PlotZoneVO[];
    // 仅列启用片区（zoneStatus=1）
    zoneOptions.value = all.filter((z) => z.zoneStatus === 1);
  } catch (e) {
    console.warn('[PlotOrganicForm] listAllZone failed', e);
  }
}

const openCreate = async () => {
  await Promise.all([ensurePlotList(), ensureZoneList()]);
  selectedZoneId.value = '';
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  await Promise.all([ensurePlotList(), ensureZoneList()]);
  selectedZoneId.value = '';
  const res = await getPlotOrganic(id);
  const data = res.data;
  form.value = {
    ...defaultForm(),
    ...data,
    // el-transfer key 必须 string；后端 relatedPlots 是 [{plotId, plotName}]
    plotIds: (data.relatedPlots ?? []).map((p) => String(p.plotId))
  };
  visible.value = true;

  // 回填 OSS 图片
  await nextTick();
  if (form.value.organicImagePreview) {
    try {
      const ossRes = await listOssByIds(form.value.organicImagePreview);
      const items = (ossRes.data || []).map((o) => ({
        ossId: String(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossThumbRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[PlotOrganicForm] thumb listOssByIds failed', e);
    }
  }
  if (form.value.organicImageUrl) {
    try {
      const ossRes = await listOssByIds(form.value.organicImageUrl);
      const items = (ossRes.data || []).map((o) => ({
        ossId: String(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossImgRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[PlotOrganicForm] img listOssByIds failed', e);
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
      const payload: PlotOrganicForm = {
        ...form.value,
        // string[] → number[]（后端 List<Long>，但 ruoyi Jackson 已配 Long → String 互转）
        plotIds: (form.value.plotIds || []).map((s) => s)
      } as PlotOrganicForm;
      if (form.value.id) {
        await updatePlotOrganic(payload);
      } else {
        await addPlotOrganic(payload);
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
