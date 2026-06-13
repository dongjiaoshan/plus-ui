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
                    <div class="cut-img-ph"><el-icon><Food /></el-icon></div>
                  </template>
                </el-image>
                <div v-else class="cut-img-ph"><el-icon><Food /></el-icon></div>
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

    <!-- 已生成追溯码管理列表（91-1，对齐果蔬追溯码管理：查询 / 列表 / 补打） -->
    <el-card shadow="never" class="code-list-card">
      <template #header>
        <span class="title">{{ t('storeTrace.pork.codeListTitle') }}</span>
      </template>
      <BizTable
        :data="codeList"
        :total="codeTotal"
        :loading="codeLoading"
        :columns="codeColumns"
        :search-schema="codeSearchSchema"
        :search-model="codeSearchModel"
        :page-num="codePageNum"
        :page-size="codePageSize"
        row-key="id"
        :selectable="false"
        :show-add="false"
        :show-row-edit="false"
        :show-export="false"
        perm-prefix="djs:store:trace"
        @search="handleCodeSearch"
        @reset="handleCodeReset"
        @page-change="handleCodePageChange"
      >
        <template #action="{ row }">
          <el-button v-hasPermi="['djs:store:trace:print']" link type="primary" icon="Printer" @click="handleReprint(row)">
            {{ t('storeTrace.pork.reprint') }}
          </el-button>
        </template>
      </BizTable>
    </el-card>
  </div>
</template>

<script setup name="PorkTracePanel" lang="ts">
import { Food } from '@element-plus/icons-vue';
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import {
  listTraceablePig,
  genStoreTraceCode,
  listStorePorkTrace,
  batchStorePorkTraceDetail
} from '@/api/djs-store/trace';
import type { TraceablePigVO } from '@/api/djs-store/trace/types';
import type { TraceCodeVO, TraceCodeQuery } from '@/api/warehouse/trace/types';
import { listImage } from '@/api/djs-common/image';
import type { ImageLibraryVO } from '@/api/djs-common/image/types';
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
const cutOptions = computed(() => (djs_pork_cut_product?.value ?? []) as { label: string; value: string }[]);
const canGen = computed(() => !!selectedEarNo.value && !!form.cutLabel && (form.weight ?? 0) > 0);

// —— 已生成追溯码管理列表（91-1，恒 codeType=pork，只读 + 补打）——
const codeList = ref<TraceCodeVO[]>([]);
const codeTotal = ref(0);
const codeLoading = ref(false);
const codePageNum = ref(1);
const codePageSize = ref(10);
const codeSearchModel = reactive<Record<string, unknown>>({ produceCode: undefined, pigEarNo: undefined, codeDate: undefined });

const codeSearchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'produceCode', label: t('storeTrace.pork.codeNo'), type: 'input' },
  { field: 'pigEarNo', label: t('storeTrace.pork.pigEarNo'), type: 'input' },
  { field: 'codeDate', label: t('storeTrace.pork.codeDate'), type: 'date' }
]);

const codeColumns = computed<BizTableColumn[]>(() => [
  { prop: 'produceCode', label: t('storeTrace.pork.codeNo'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'pigEarNo', label: t('storeTrace.pork.pigEarNo'), width: 120, align: 'center' },
  { prop: 'productName', label: t('storeTrace.pork.codeProductName'), minWidth: 130, showOverflowTooltip: true },
  { prop: 'remark', label: t('storeTrace.pork.remark'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'creatorName', label: t('storeTrace.pork.creatorName'), width: 110, align: 'center' },
  { prop: 'createTime', label: t('storeTrace.pork.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function fetchCodeList() {
  codeLoading.value = true;
  try {
    const codeDate = (codeSearchModel.codeDate as string) || undefined;
    const query: TraceCodeQuery = {
      pageNum: codePageNum.value,
      pageSize: codePageSize.value,
      codeType: 'pork',
      produceCode: (codeSearchModel.produceCode as string) || undefined,
      pigEarNo: (codeSearchModel.pigEarNo as string) || undefined,
      // 生成日期单日 → 起止同日（后端按生成时间区间过滤）
      beginDate: codeDate ? `${codeDate} 00:00:00` : undefined,
      endDate: codeDate ? `${codeDate} 23:59:59` : undefined
    };
    const res = await listStorePorkTrace(query);
    codeList.value = (res.rows ?? res.data ?? []) as TraceCodeVO[];
    codeTotal.value = res.total ?? 0;
  } finally {
    codeLoading.value = false;
  }
}

function handleCodeSearch(payload?: Record<string, unknown>) {
  Object.assign(codeSearchModel, payload ?? {});
  codePageNum.value = 1;
  fetchCodeList();
}
function handleCodeReset() {
  Object.keys(codeSearchModel).forEach((k) => (codeSearchModel[k] = undefined));
  codePageNum.value = 1;
  fetchCodeList();
}
function handleCodePageChange(p: number, s: number) {
  codePageNum.value = p;
  codePageSize.value = s;
  fetchCodeList();
}

// 补打：批量取详情（含事件链）→ 复用 printLabel 重出码标签
async function handleReprint(row: BizRow) {
  const r = row as unknown as TraceCodeVO;
  if (!r.id) return;
  const res = await batchStorePorkTraceDetail([String(r.id)]);
  const detail = (res.data ?? [])[0];
  const code = String(detail?.produceCode ?? r.produceCode ?? '');
  const name = String(detail?.productName ?? r.productName ?? '');
  if (!code) {
    proxy?.$modal.msgWarning(t('storeTrace.pork.noCode'));
    return;
  }
  printLabel(code, name);
}

async function loadPigs() {
  pigLoading.value = true;
  try {
    const res = await listTraceablePig({ pageNum: 1, pageSize: 200 });
    pigs.value = (res.rows ?? res.data ?? []) as TraceablePigVO[];
  } finally {
    pigLoading.value = false;
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
          (r.imageName === label || (r.aliases ?? '').split(',').map((a) => a.trim()).includes(label))
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
    printLabel(code, form.cutLabel ?? '');
    form.weight = undefined;
    // 新码生成后刷新已生码列表，回首页
    codePageNum.value = 1;
    fetchCodeList();
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

onMounted(async () => {
  await loadPigs();
  loadCutImages();
  fetchCodeList();
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

  .code-list-card {
    margin-top: 16px;
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
