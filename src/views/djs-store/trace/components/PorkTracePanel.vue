<template>
  <div class="trace-pork">
    <el-row :gutter="16">
      <!-- 左：追溯猪只 picker（chip）+ 5 张零售部位卡（带产品图） -->
      <el-col :xs="24" :md="17">
        <el-card shadow="never">
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

          <div class="cut-grid">
            <div
              v-for="c in cutOptions"
              :key="c.value"
              class="cut-card"
              :class="{ active: form.cutLabel === c.value }"
              @click="form.cutLabel = c.value"
            >
              <div class="cut-img-wrap">
                <el-image v-if="cutImgMap[c.label]" :src="cutImgMap[c.label]" fit="cover" class="cut-img" :preview-disabled="true">
                  <template #error>
                    <div class="cut-img-ph">
                      <el-icon><Food /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else class="cut-img-ph">
                  <el-icon><Food /></el-icon>
                </div>
              </div>
              <div class="cut-name">{{ c.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右：操作面板（追溯猪只信息 + 追溯产品 + 重量 + 追溯码打印） -->
      <el-col :xs="24" :md="7">
        <el-card shadow="never" class="op-card">
          <template #header>
            <span class="title">{{ t('storeTrace.pork.opPanel') }}</span>
          </template>

          <div class="section-label">{{ t('storeTrace.pork.tracePig') }}</div>
          <el-descriptions :column="1" border size="small" class="pig-info">
            <el-descriptions-item :label="t('storeTrace.pork.pigId')">{{ selectedPig?.earNo ?? '-' }}</el-descriptions-item>
            <el-descriptions-item :label="t('storeTrace.pork.pigSex')">
              <dict-tag v-if="selectedPig?.pigSex" :options="djs_pig_sex" :value="selectedPig.pigSex" />
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item :label="t('storeTrace.pork.pigBreed')">{{ selectedPig?.pigBreedLabel ?? '-' }}</el-descriptions-item>
            <el-descriptions-item :label="t('storeTrace.pork.ageDays')">
              {{ selectedPig?.ageDays != null ? selectedPig.ageDays + ' ' + t('storeTrace.pork.daysUnit') : '-' }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="section-label">{{ t('storeTrace.pork.traceProduct') }}</div>
          <el-descriptions :column="1" border size="small" class="product-info">
            <el-descriptions-item :label="t('storeTrace.pork.productName')">{{ form.cutLabel ?? '-' }}</el-descriptions-item>
          </el-descriptions>

          <div class="weight-box">
            <div class="section-label">{{ t('storeTrace.pork.weight') }}</div>
            <el-input-number
              v-model="form.weight"
              :min="0.01"
              :precision="2"
              :step="1"
              :placeholder="t('storeTrace.pork.weightPlaceholder')"
              style="width: 100%"
            />
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

    <!-- 追溯码打印弹框（录重量 + 结构化标签卡 + 二维码） -->
    <TraceLabelDialog ref="labelDialogRef" />
  </div>
</template>

<script setup name="PorkTracePanel" lang="ts">
import { Food } from '@element-plus/icons-vue';
import { listTraceablePig, genStoreTraceCode, listStorePackProducts } from '@/api/djs-store/trace';
import type { TraceablePigVO, StorePackProductVO } from '@/api/djs-store/trace/types';
import { listImage } from '@/api/djs-common/image';
import type { ImageLibraryVO } from '@/api/djs-common/image/types';
import TraceLabelDialog from './TraceLabelDialog.vue';
import frontLeg from '@/assets/images/pork-cut/front-leg.png';
import porkBelly from '@/assets/images/pork-cut/pork-belly.png';
import ribsImg from '@/assets/images/pork-cut/ribs.png';
import elbowImg from '@/assets/images/pork-cut/elbow.png';
import porkChop from '@/assets/images/pork-cut/pork-chop.png';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_pig_sex, djs_pork_cut_product } = toRefs<Record<string, { label: string; value: string }[]>>(
  proxy?.useDict('djs_pig_sex', 'djs_pork_cut_product')
);

const pigs = ref<TraceablePigVO[]>([]);
const pigLoading = ref(false);
const genLoading = ref(false);
const selectedEarNo = ref<string>();
const labelDialogRef = ref<InstanceType<typeof TraceLabelDialog>>();
// 门店猪肉打包产品（生产车间「门店打包间」workshop=5，邓博 2026-06-21 定调）；空则回退部位字典
const packProducts = ref<StorePackProductVO[]>([]);

// 部位中文名 → 本地原型抠图兜底（前腿肉/五花肉/排骨/肘子/大排，从原型截图裁出）；图库命中则覆盖
const LOCAL_CUT_IMG: Record<string, string> = {
  前腿肉: frontLeg,
  五花肉: porkBelly,
  排骨: ribsImg,
  肘子: elbowImg,
  大排: porkChop
};
// 部位中文名 → imageUrl：ADR-0014 公共图库按 imageName 精确/别名命中则用图库图，否则用本地兜底图
const cutImgMap = ref<Record<string, string>>({ ...LOCAL_CUT_IMG });

const form = reactive<{ cutLabel?: string; weight?: number }>({ cutLabel: undefined, weight: undefined });

const selectedPig = computed(() => pigs.value.find((p) => p.earNo === selectedEarNo.value) ?? null);
// 产品卡数据源：优先「门店打包间(workshop=5)」产品（产品名做卡片标题 + 生码 cutLabel）；
// 无 workshop=5 产品时回退旧部位字典 djs_pork_cut_product，保证功能不空。
const cutOptions = computed<{ label: string; value: string }[]>(() => {
  if (packProducts.value.length) {
    return packProducts.value.map((p) => ({ label: p.productName, value: p.productName }));
  }
  return (djs_pork_cut_product?.value ?? []) as { label: string; value: string }[];
});
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

// 门店打包产品（workshop=5）；失败/空 → 空数组，cutOptions 自动回退部位字典
async function loadPackProducts() {
  try {
    const res = await listStorePackProducts();
    packProducts.value = (res.rows ?? res.data ?? []) as StorePackProductVO[];
  } catch (e) {
    console.warn('[PorkTracePanel] loadPackProducts failed', e);
    packProducts.value = [];
  }
}

// 从公共图库按部位名拉图（前腿肉/五花肉/排骨/肘子/大排），命中 imageUrl 用真实图，未命中保持占位
async function loadCutImages() {
  const labels = cutOptions.value.map((c) => c.label).filter(Boolean);
  if (!labels.length) return;
  try {
    const res = await listImage({ pageNum: 1, pageSize: 500, status: '0' });
    const rows = ((res as unknown as { rows?: ImageLibraryVO[]; data?: ImageLibraryVO[] }).rows ?? []) as ImageLibraryVO[];
    const map: Record<string, string> = { ...LOCAL_CUT_IMG };
    labels.forEach((label) => {
      const hit = rows.find(
        (r) =>
          r.imageUrl &&
          (r.imageName === label ||
            (r.aliases ?? '')
              .split(',')
              .map((a) => a.trim())
              .includes(label))
      );
      if (hit?.imageUrl) map[label] = hit.imageUrl;
    });
    cutImgMap.value = map;
  } catch (e) {
    console.warn('[PorkTracePanel] loadCutImages failed', e);
    cutImgMap.value = { ...LOCAL_CUT_IMG };
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
    // 弹框录重量（默认本次生码重量）→ 结构化标签卡 + 二维码 → 打印
    labelDialogRef.value?.open(
      {
        productCode: code,
        produceDate: todayYmd(),
        productName: form.cutLabel,
        sourceLabel: t('storeTrace.label.earNo'),
        sourceValue: selectedEarNo.value,
        produceCode: code,
        traceType: 'pork'
      },
      form.weight
    );
    form.weight = undefined;
  } finally {
    genLoading.value = false;
  }
}

function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

onMounted(async () => {
  await loadPigs();
  await loadPackProducts();
  loadCutImages();
});
</script>

<style lang="scss" scoped>
.trace-pork {
  .title {
    font-weight: 600;
  }

  .pig-chips {
    min-height: 48px;
    margin-bottom: 20px;

    .pig-chip {
      margin: 0 8px 8px 0;
      cursor: pointer;
      font-size: 14px;
    }
  }

  .section-label {
    margin: 4px 0 8px;
    font-size: 13px;
    color: #606266;
  }

  .cut-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;

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

      .cut-img-wrap {
        width: 88px;
        height: 88px;
        border-radius: 50%;
        overflow: hidden;
        background: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;

        .cut-img {
          width: 100%;
          height: 100%;
        }

        .cut-img-ph {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c0c4cc;
          font-size: 32px;
        }
      }

      .cut-name {
        margin-top: 10px;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .op-card {
    .pig-info,
    .product-info {
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
