<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="900px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-tabs v-model="activeTab">
        <!-- Tab 1：基础信息 -->
        <el-tab-pane :label="t('plantPlot.tab.basic')" name="basic">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.zoneId')" prop="zoneId">
                <el-select v-model="form.zoneId" :placeholder="t('plantPlot.placeholder.zoneId')" filterable style="width: 100%">
                  <el-option v-for="z in zoneList" :key="z.id" :label="z.zoneName" :value="z.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.plotCode')" prop="plotCode">
                <el-input v-model="form.plotCode" :placeholder="t('plantPlot.placeholder.plotCode')" :disabled="!!form.id" maxlength="32" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.plotName')" prop="plotName">
                <el-input v-model="form.plotName" :placeholder="t('plantPlot.placeholder.plotName')" maxlength="64" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.plotType')" prop="plotType">
                <el-select v-model="form.plotType" :placeholder="t('plantPlot.placeholder.plotType')" clearable style="width: 100%">
                  <el-option v-for="d in djs_plot_type" :key="d.value" :label="d.label" :value="d.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.plotStatus')" prop="plotStatus">
                <el-radio-group v-model="form.plotStatus">
                  <el-radio v-for="d in djs_plot_status" :key="d.value" :value="Number(d.value)">{{ d.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.isLease')" prop="isLease">
                <el-radio-group v-model="form.isLease">
                  <el-radio v-for="d in djs_yes_no" :key="d.value" :value="Number(d.value)">{{ d.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.plotImagePreview')" prop="plotImagePreview">
                <OssUpload ref="ossThumbRef" v-model="thumbOssIdsModel" biz-type="plant_plot" :limit="1" :file-size="10" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.plotImageUrl')" prop="plotImageUrl">
                <OssUpload ref="ossImgRef" v-model="imgOssIdsModel" biz-type="plant_plot" :limit="9" :file-size="10" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="t('plantPlot.field.plotRemark')" prop="plotRemark">
                <el-input v-model="form.plotRemark" type="textarea" :rows="2" maxlength="500" :placeholder="t('plantPlot.placeholder.plotRemark')" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- Tab 2：位置 & 面积 -->
        <el-tab-pane :label="t('plantPlot.tab.location')" name="location">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.plotArea')" prop="plotArea">
                <el-input-number
                  v-model="form.plotArea"
                  :min="0"
                  :precision="2"
                  :step="0.1"
                  :placeholder="t('plantPlot.placeholder.plotArea')"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="t('plantPlot.field.plotLocationDesc')" prop="plotLocationDesc">
                <el-input
                  v-model="form.plotLocationDesc"
                  type="textarea"
                  :rows="2"
                  maxlength="500"
                  :placeholder="t('plantPlot.placeholder.plotLocationDesc')"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.plotLocationX')" prop="plotLocationX">
                <el-input-number v-model="form.plotLocationX" :min="-180" :max="180" :precision="7" :step="0.0001" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.plotLocationY')" prop="plotLocationY">
                <el-input-number v-model="form.plotLocationY" :min="-90" :max="90" :precision="7" :step="0.0001" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- Tab 3：土壤 & 环境 -->
        <el-tab-pane :label="t('plantPlot.tab.soil')" name="soil">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.soilType')" prop="soilType">
                <el-select v-model="form.soilType" :placeholder="t('plantPlot.placeholder.soilType')" clearable style="width: 100%">
                  <el-option v-for="d in djs_soil_type" :key="d.value" :label="d.label" :value="d.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.soilFertility')" prop="soilFertility">
                <el-select v-model="form.soilFertility" :placeholder="t('plantPlot.placeholder.soilFertility')" clearable style="width: 100%">
                  <el-option v-for="d in djs_soil_fertility" :key="d.value" :label="d.label" :value="d.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.soilPh')" prop="soilPh">
                <el-input-number
                  v-model="form.soilPh"
                  :min="0"
                  :max="14"
                  :precision="2"
                  :step="0.1"
                  :placeholder="t('plantPlot.placeholder.soilPh')"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.terrainCondition')" prop="terrainCondition">
                <el-select v-model="form.terrainCondition" :placeholder="t('plantPlot.placeholder.terrainCondition')" clearable style="width: 100%">
                  <el-option v-for="d in djs_terrain_condition" :key="d.value" :label="d.label" :value="d.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.lightCondition')" prop="lightCondition">
                <el-select v-model="form.lightCondition" :placeholder="t('plantPlot.placeholder.lightCondition')" clearable style="width: 100%">
                  <el-option v-for="d in djs_light_condition" :key="d.value" :label="d.label" :value="d.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('plantPlot.field.drainCondition')" prop="drainCondition">
                <el-select v-model="form.drainCondition" :placeholder="t('plantPlot.placeholder.drainCondition')" clearable style="width: 100%">
                  <el-option v-for="d in djs_drain_condition" :key="d.value" :label="d.label" :value="d.value" />
                </el-select>
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
import { addPlot, getPlot, updatePlot } from '@/api/djs-plant/plot';
import { listAllZone } from '@/api/djs-plant/zone';
import OssUpload from '@/components/OssUpload/index.vue';
import { listByIds as listOssByIds } from '@/api/system/oss';
import type { PlotInfoForm } from '@/api/djs-plant/plot/types';
import type { PlotZoneVO } from '@/api/djs-plant/zone/types';
import { useI18n } from 'vue-i18n';
import { useOssBridge } from '@/composables/useOssBridge';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// ★ Vue 3 范式：toRefs(proxy?.useDict(...))（D04 BRD-MD-003 整页空白教训）
const {
  djs_plot_type,
  djs_plot_status,
  djs_yes_no,
  djs_soil_type,
  djs_soil_fertility,
  djs_terrain_condition,
  djs_light_condition,
  djs_drain_condition
} = toRefs<any>(
  proxy?.useDict(
    'djs_plot_type',
    'djs_plot_status',
    'djs_yes_no',
    'djs_soil_type',
    'djs_soil_fertility',
    'djs_terrain_condition',
    'djs_light_condition',
    'djs_drain_condition'
  )
);

interface Props {
  zoneList?: PlotZoneVO[];
  defaultZoneId?: number | string | null;
}
const props = withDefaults(defineProps<Props>(), {
  zoneList: () => [],
  defaultZoneId: null
});

const visible = ref(false);
const submitting = ref(false);
const activeTab = ref('basic');
const formRef = ref<ElFormInstance>();
const ossThumbRef = ref<InstanceType<typeof OssUpload>>();
const ossImgRef = ref<InstanceType<typeof OssUpload>>();

// 兜底 zoneList（若父组件未传，本组件自己拉）
const internalZones = ref<PlotZoneVO[]>([]);
const zoneList = computed<PlotZoneVO[]>(() => (props.zoneList.length > 0 ? props.zoneList : internalZones.value));

const defaultForm = (): PlotInfoForm => ({
  id: undefined,
  plotCode: '',
  plotImagePreview: undefined,
  plotImageUrl: undefined,
  zoneId: undefined,
  plotType: undefined,
  plotName: '',
  plotStatus: 1,
  isLease: 0,
  plotRemark: undefined,
  plotArea: undefined,
  plotLocationDesc: undefined,
  plotLocationX: undefined,
  plotLocationY: undefined,
  soilType: undefined,
  soilFertility: undefined,
  soilPh: undefined,
  terrainCondition: undefined,
  lightCondition: undefined,
  drainCondition: undefined
});

const form = ref<PlotInfoForm>(defaultForm());

// OssUpload v-model 期望 number[]；业务字段是单/多 ossId 字符串（useOssBridge 桥接）
const thumbOssIdsModel = useOssBridge(form, 'plotImagePreview', 'single');
const imgOssIdsModel = useOssBridge(form, 'plotImageUrl', 'multi');

const rules = computed(() => ({
  zoneId: [{ required: true, message: t('plantPlot.rule.zoneId.required'), trigger: 'change' }],
  plotCode: [{ required: true, message: t('plantPlot.rule.plotCode.required'), trigger: 'blur' }],
  plotName: [{ required: true, message: t('plantPlot.rule.plotName.required'), trigger: 'blur' }],
  plotArea: [{ required: true, message: t('plantPlot.rule.plotArea.required'), trigger: 'blur' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('plantPlot.title.edit') : t('plantPlot.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

async function ensureZoneList() {
  if (zoneList.value.length === 0) {
    try {
      const res = await listAllZone();
      internalZones.value = (res.data ?? []) as PlotZoneVO[];
    } catch (e) {
      console.warn('[PlotForm] listAllZone failed', e);
    }
  }
}

const openCreate = async (zoneId?: number | string) => {
  await ensureZoneList();
  form.value = defaultForm();
  form.value.zoneId = zoneId ?? props.defaultZoneId ?? undefined;
  activeTab.value = 'basic';
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  await ensureZoneList();
  const res = await getPlot(id);
  const data = res.data;
  form.value = {
    ...defaultForm(),
    ...data,
    plotArea: data.plotArea != null ? Number(data.plotArea) : undefined,
    plotLocationX: data.plotLocationX != null ? Number(data.plotLocationX) : undefined,
    plotLocationY: data.plotLocationY != null ? Number(data.plotLocationY) : undefined,
    soilPh: data.soilPh != null ? Number(data.soilPh) : undefined
  };
  activeTab.value = 'basic';
  visible.value = true;

  // 回填 OSS 图片（D04 testing-human #2 教训：setExistingFiles 必须 await nextTick）
  await nextTick();
  if (form.value.plotImagePreview) {
    try {
      const ossRes = await listOssByIds(form.value.plotImagePreview);
      const items = (ossRes.data || []).map((o: any) => ({
        ossId: Number(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossThumbRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[PlotForm] thumb listOssByIds failed', e);
    }
  }
  if (form.value.plotImageUrl) {
    try {
      const ossRes = await listOssByIds(form.value.plotImageUrl);
      const items = (ossRes.data || []).map((o: any) => ({
        ossId: Number(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossImgRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[PlotForm] img listOssByIds failed', e);
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
        await updatePlot(form.value);
      } else {
        await addPlot(form.value);
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
