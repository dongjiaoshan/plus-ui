<template>
  <div class="p-2 trace-pork">
    <el-row :gutter="16">
      <!-- 左：追溯猪只选择 + 部位卡 -->
      <el-col :xs="24" :md="16">
        <el-card shadow="never">
          <template #header>
            <span class="title">{{ t('storeTrace.pork.pickPig') }}</span>
          </template>
          <div v-loading="pigLoading" class="pig-chips">
            <el-tag
              v-for="p in pigs"
              :key="p.earNo"
              :effect="selectedEarNo === p.earNo ? 'dark' : 'plain'"
              class="pig-chip"
              :type="selectedEarNo === p.earNo ? 'warning' : 'info'"
              @click="selectPig(p)"
            >
              {{ p.earNo }}
            </el-tag>
            <el-empty v-if="!pigLoading && !pigs.length" :description="t('storeTrace.pork.noPig')" :image-size="60" />
          </div>

          <el-divider />
          <div class="section-label">{{ t('storeTrace.pork.pickCut') }}</div>
          <div class="cut-grid">
            <div
              v-for="c in cutOptions"
              :key="c.value"
              class="cut-card"
              :class="{ active: form.cutLabel === c.value }"
              @click="form.cutLabel = c.value"
            >
              <el-icon class="cut-ico"><Food /></el-icon>
              <div class="cut-name">{{ c.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右：猪只信息 + 重量 + 生码打印 -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="op-card">
          <template #header>
            <span class="title">{{ t('storeTrace.pork.opPanel') }}</span>
          </template>
          <el-descriptions :column="1" border size="small" class="pig-info">
            <el-descriptions-item :label="t('storeTrace.pork.pigId')">{{ selectedPig?.earNo ?? '-' }}</el-descriptions-item>
            <el-descriptions-item :label="t('storeTrace.pork.pigSex')">
              <dict-tag v-if="selectedPig?.pigSex" :options="djs_pig_sex" :value="selectedPig.pigSex" />
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item :label="t('storeTrace.pork.pigBreed')">{{ selectedPig?.pigBreedLabel ?? '-' }}</el-descriptions-item>
            <el-descriptions-item :label="t('storeTrace.pork.ageDays')">{{ selectedPig?.ageDays != null ? selectedPig.ageDays + ' ' + t('storeTrace.pork.daysUnit') : '-' }}</el-descriptions-item>
          </el-descriptions>

          <div class="weight-box">
            <div class="section-label">{{ t('storeTrace.pork.weight') }}</div>
            <el-input-number v-model="form.weight" :min="0.01" :precision="2" :step="1" :placeholder="t('storeTrace.pork.weightPlaceholder')" style="width: 100%" />
          </div>

          <el-button
            v-hasPermi="['djs:store:trace:print']"
            type="primary"
            class="gen-btn"
            :loading="genLoading"
            :disabled="!canGen"
            @click="handleGen"
          >
            {{ t('storeTrace.pork.genPrint') }}
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="StoreTracePork" lang="ts">
import { Food } from '@element-plus/icons-vue';
import { listTraceablePig, genStoreTraceCode } from '@/api/djs-store/trace';
import type { TraceablePigVO } from '@/api/djs-store/trace/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_pig_sex, djs_pork_cut_product } = toRefs<any>(proxy?.useDict('djs_pig_sex', 'djs_pork_cut_product'));

const pigs = ref<TraceablePigVO[]>([]);
const pigLoading = ref(false);
const genLoading = ref(false);
const selectedEarNo = ref<string>();

const form = reactive<{ cutLabel?: string; weight?: number }>({ cutLabel: undefined, weight: undefined });

const selectedPig = computed(() => pigs.value.find((p) => p.earNo === selectedEarNo.value) ?? null);
const cutOptions = computed(() => (djs_pork_cut_product?.value ?? []) as { label: string; value: string }[]);
const canGen = computed(() => !!selectedEarNo.value && !!form.cutLabel && (form.weight ?? 0) > 0);

async function loadPigs() {
  pigLoading.value = true;
  try {
    const res = await listTraceablePig({ pageNum: 1, pageSize: 200 });
    pigs.value = (res.rows ?? res.data ?? []) as TraceablePigVO[];
  } finally {
    pigLoading.value = false;
  }
}

function selectPig(p: TraceablePigVO) {
  selectedEarNo.value = p.earNo;
}

async function handleGen() {
  if (!canGen.value) return;
  genLoading.value = true;
  try {
    const res = await genStoreTraceCode({ earNo: selectedEarNo.value, cutLabel: form.cutLabel, weight: form.weight });
    const code = (res.data as unknown as string) ?? '';
    proxy?.$modal.msgSuccess(t('storeTrace.pork.genOk', { code }));
    printLabel(code, form.cutLabel ?? '');
    form.weight = undefined;
  } finally {
    genLoading.value = false;
  }
}

function printLabel(code: string, cut: string) {
  if (!code) return;
  const w = window.open('', '_blank', 'width=420,height=320');
  if (!w) return;
  w.document.write(
    `<html><head><title>${code}</title></head><body style="font-family:sans-serif;text-align:center;padding:24px">` +
      `<h3 style="margin:0 0 12px">${cut}</h3>` +
      `<div style="font-size:20px;letter-spacing:1px;border:1px dashed #333;padding:16px;border-radius:8px">${code}</div>` +
      `</body></html>`
  );
  w.document.close();
  w.focus();
  w.print();
}

onMounted(() => loadPigs());
</script>

<style lang="scss" scoped>
.trace-pork {
  .title {
    font-weight: 600;
  }

  .pig-chips {
    min-height: 48px;

    .pig-chip {
      margin: 0 8px 8px 0;
      cursor: pointer;
    }
  }

  .section-label {
    margin: 4px 0 8px;
    font-size: 13px;
    color: #606266;
  }

  .cut-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;

    .cut-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 8px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        border-color: #e6a23c;
      }

      &.active {
        border-color: #e6a23c;
        background: #fdf6ec;
      }

      .cut-ico {
        font-size: 28px;
        color: #e6a23c;
      }

      .cut-name {
        margin-top: 8px;
        font-size: 14px;
      }
    }
  }

  .op-card {
    .pig-info {
      margin-bottom: 16px;
    }

    .weight-box {
      margin-bottom: 16px;
    }

    .gen-btn {
      width: 100%;
    }
  }
}
</style>
