<template>
  <div class="trace-pork">
    <el-row :gutter="16" class="trace-row">
      <!-- 左：追溯猪只 picker（chip）+ 5 张零售部位卡（带产品图） -->
      <el-col :xs="24" :md="17" class="trace-col">
        <el-card shadow="never" class="left-card">
          <!-- row82：白条 chip 区固定不随页滚动（内容多时自身内部滚动，不撑高整页） -->
          <div v-loading="pigLoading" class="pig-chips">
            <el-tag
              v-for="p in pigs"
              :key="pigKey(p)"
              :effect="selectedKey === pigKey(p) ? 'dark' : 'plain'"
              class="pig-chip"
              :class="{ 'is-exhausted': isExhausted(p) }"
              :type="selectedKey === pigKey(p) ? 'warning' : 'info'"
              @click="selectPig(p)"
            >
              {{ p.earNo || p.whiteBarNo }}
              <text class="chip-weight">{{ chipWeightText(p) }}</text>
            </el-tag>
            <el-empty v-if="!pigLoading && !pigs.length" :description="t('storeTrace.pork.noPig')" :image-size="60" />
          </div>

          <!-- row82：仅猪肉产品列表内部滚动，整页不滚动 -->
          <div class="cut-grid">
            <div
              v-for="c in cutOptions"
              :key="c.value"
              class="cut-card"
              :class="{ active: form.cutLabel === c.value }"
              @click="form.cutLabel = c.value"
            >
              <div class="cut-img-wrap">
                <el-image v-if="cardImg(c)" :src="cardImg(c)" fit="cover" class="cut-img" :preview-disabled="true">
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
      <el-col :xs="24" :md="7" class="trace-col">
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
            <!-- DENGBO-R34：产品重量输入单位 g（零售部位按克，与列表实际重量 g 展示一致）；提交前 g→kg 换算给后端 -->
            <!-- row200-2：录重形式改为与仓库肉品打包一致的触屏数字键盘（WeightNumpad，g 整数 precision=0）。 -->
            <WeightNumpad
              v-model="form.weight"
              unit="g"
              :precision="0"
              :placeholder="t('storeTrace.pork.weightPlaceholder')"
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
import { listByIds as listOssByIds } from '@/api/system/oss';
import TraceLabelDialog from './TraceLabelDialog.vue';
import WeightNumpad from '@/views/djs-warehouse/production/packEntry/components/WeightNumpad.vue';
import { useStoreContextStore } from '@/store/modules/storeContext';
import frontLeg from '@/assets/images/pork-cut/front-leg.png';
import porkBelly from '@/assets/images/pork-cut/pork-belly.png';
import ribsImg from '@/assets/images/pork-cut/ribs.png';
import elbowImg from '@/assets/images/pork-cut/elbow.png';
import porkChop from '@/assets/images/pork-cut/pork-chop.png';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const storeCtx = useStoreContextStore();
// 当前所选门店名（追溯码打印弹框「销售门店」= 当前门店；未选/超管跨店时 undefined → 弹框显 '-'）
function currentStoreName(): string | undefined {
  return storeCtx.myStores.find((s) => String(s.id) === String(storeCtx.currentStoreId))?.storeName;
}
const { djs_pig_sex, djs_pork_cut_product } = toRefs<Record<string, { label: string; value: string }[]>>(
  proxy?.useDict('djs_pig_sex', 'djs_pork_cut_product')
);

const pigs = ref<TraceablePigVO[]>([]);
const pigLoading = ref(false);
const genLoading = ref(false);
// 选中键 = 白条流水号（半只级）；旧数据无 white_bar_no 时回落耳号（整猪一条）。同猪两半只 earNo 相同、靠 white_bar_no 区分。
const selectedKey = ref<string>();
function pigKey(p: TraceablePigVO): string {
  return p.whiteBarNo ?? p.earNo;
}
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
// 部位中文名 → imageUrl：用本地原型抠图（前腿肉/五花肉/排骨/肘子/大排）
const cutImgMap = ref<Record<string, string>>({ ...LOCAL_CUT_IMG });
// admin row62：门店打包产品配置图 ossId → url（product_thumb 优先、回落 image_oss_id）
const ossUrlMap = ref<Record<string, string>>({});

const form = reactive<{ cutLabel?: string; weight?: number }>({ cutLabel: undefined, weight: undefined });

const selectedPig = computed(() => pigs.value.find((p) => pigKey(p) === selectedKey.value) ?? null);
// 产品卡数据源：优先「门店打包间(workshop=5)」产品（产品名做卡片标题 + 生码 cutLabel）；
// 无 workshop=5 产品时回退旧部位字典 djs_pork_cut_product，保证功能不空。
const cutOptions = computed<{ label: string; value: string; productThumb?: string; imageOssId?: string }[]>(() => {
  if (packProducts.value.length) {
    return packProducts.value.map((p) => ({
      label: p.productName,
      value: p.productName,
      productThumb: p.productThumb,
      imageOssId: p.imageOssId
    }));
  }
  return (djs_pork_cut_product?.value ?? []) as { label: string; value: string }[];
});
// admin row62：产品卡图优先取产品配置图（COALESCE(product_thumb, image_oss_id) → oss url）；
// 回退部位字典分支无图字段则走本地部位抠图；都没有则模板占位。
function cardImg(c: { label: string; productThumb?: string; imageOssId?: string }): string | undefined {
  const ossId = c.productThumb || c.imageOssId;
  if (ossId && ossUrlMap.value[String(ossId)]) return ossUrlMap.value[String(ossId)];
  return cutImgMap.value[c.label];
}
const canGen = computed(() => !!selectedKey.value && !!form.cutLabel && (form.weight ?? 0) > 0);

// ---- 白条剩余可打包重量（到货 − 已现场打包；≤0 禁选） ----
function fmtKg(v?: number): string {
  // admin row63：白条 chip 重量（剩余/到货）显示 3 位小数（如 4.600/4.800kg）
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toFixed(3) : '0.000';
}
function remainingOf(p?: TraceablePigVO | null): number {
  return Number(p?.remainingWeight ?? 0);
}
function isExhausted(p: TraceablePigVO): boolean {
  return remainingOf(p) <= 0;
}
function chipWeightText(p: TraceablePigVO): string {
  return isExhausted(p)
    ? `（${t('storeTrace.pork.exhaustedTag')}）`
    : `（${t('storeTrace.pork.remainOf', { remain: fmtKg(p.remainingWeight), arrived: fmtKg(p.arrivedWeight) })}）`;
}

async function loadPigs() {
  pigLoading.value = true;
  try {
    const res = await listTraceablePig({ pageNum: 1, pageSize: 200 });
    pigs.value = (res.rows ?? res.data ?? []) as TraceablePigVO[];
    // admin row61：进页自动选中第一个可用(未打包完)白条，无需用户手点；全用完则不选。
    if (!selectedKey.value) {
      const first = pigs.value.find((p) => !isExhausted(p));
      if (first) selectedKey.value = pigKey(first);
    }
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

// admin row62：批量取门店打包产品配置图 url（product_thumb 优先、回落 image_oss_id）。
// listByIds 走 /resource/oss/listByIds 需 system:oss:query；djs 角色若 403 静默降级（不阻断卡片渲染）。
async function loadProductImages() {
  const ids = Array.from(new Set(packProducts.value.map((p) => p.productThumb || p.imageOssId).filter((v): v is string => !!v)));
  if (!ids.length) {
    ossUrlMap.value = {};
    return;
  }
  try {
    const res = await listOssByIds(ids.join(','));
    const map: Record<string, string> = {};
    (res.data ?? []).forEach((o: any) => {
      if (o?.ossId != null && o?.url) map[String(o.ossId)] = o.url;
    });
    ossUrlMap.value = map;
  } catch (e) {
    console.warn('[PorkTracePanel] loadProductImages failed', e);
    ossUrlMap.value = {};
  }
}

function selectPig(p: TraceablePigVO) {
  if (isExhausted(p)) {
    proxy?.$modal.msgWarning(t('storeTrace.pork.exhausted'));
    return;
  }
  selectedKey.value = pigKey(p);
}

async function handleGen() {
  if (!canGen.value) return;
  // 输入单位 g（DENGBO-R34），后端/白条剩余/标签均按 kg → g÷1000 换算
  const weightKg = (form.weight ?? 0) / 1000;
  // 本次打包重量不得超过该白条剩余可打包重量（白条为 kg 口径）
  const remaining = remainingOf(selectedPig.value);
  if (remaining > 0 && weightKg > remaining) {
    proxy?.$modal.msgWarning(t('storeTrace.pork.overWeight', { remain: fmtKg(remaining) }));
    return;
  }
  genLoading.value = true;
  try {
    const res = await genStoreTraceCode({ earNo: selectedPig.value?.earNo, cutLabel: form.cutLabel, weight: weightKg });
    // row84：后端返回追溯码 produceCode（二维码用）+ 门店生产编码 productionCode（<生产标识码>YYMMDD####，标签展示用）
    const traceCode = res.data?.produceCode ?? '';
    const productionCode = res.data?.productionCode ?? '';
    proxy?.$modal.msgSuccess(t('storeTrace.pork.genOk', { code: productionCode || traceCode }));
    // 弹框录重量（默认本次生码重量 kg，弹框内按业态转 g 展示）→ 结构化标签卡 + 二维码 → 打印
    labelDialogRef.value?.open(
      {
        productCode: productionCode,
        // row84：门店「生产编码」= <生产标识码>YYMMDD####（门店生产标识码 + 每日流水），非追溯码本身
        serialNo: productionCode,
        produceDate: todayYmd(),
        productName: form.cutLabel,
        sourceLabel: t('storeTrace.label.earNo'),
        sourceValue: selectedPig.value?.earNo,
        // row201-2：销售门店取当前所选门店（对齐仓库肉品打包 SkuPackForm 本地解析写法）
        storeName: currentStoreName(),
        // 二维码仍 encode 追溯码 traceCode（C 端扫码 /trace/pork/{code} 查得到）
        produceCode: traceCode,
        traceType: 'pork'
      },
      weightKg
    );
    form.weight = undefined;
    // 刷新白条剩余可打包重量（本次打包后该白条剩余减少，用完则禁选）
    await loadPigs();
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
  await loadProductImages();
});
</script>

<style lang="scss" scoped>
.trace-pork {
  // row82：整页不滚动 —— 左右两版块定高铺满视口，滚动只发生在猪肉产品列表内部
  overflow: hidden;

  // 让左右两版块铺满屏幕高度（内容少时也不留大片空白）
  .trace-row {
    align-items: stretch;
    height: calc(100vh - 140px);
  }

  // el-col flex 拉伸，内部 card 撑满列高
  .trace-col {
    display: flex;
    min-height: 0; // 允许内部子元素在 flex 容器内收缩，overflow 才生效
  }

  .left-card,
  .op-card {
    width: 100%;
    height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0; // 卡片 body 可收缩，内部 cut-grid 的 overflow 才能生效
      display: flex;
      flex-direction: column;
    }
  }

  // 右侧操作面板固定不随内容撑高（白条信息 + 产品 + 重量 + 打印按钮，内容超出时自身滚动）
  .op-card {
    :deep(.el-card__body) {
      overflow-y: auto;
    }
  }

  .title {
    font-weight: 600;
  }

  // row82：白条 chip 区固定高度、内部滚动，不撑高整页
  .pig-chips {
    flex: none;
    min-height: 48px;
    max-height: 120px;
    overflow-y: auto;
    margin-bottom: 20px;

    .pig-chip {
      margin: 0 8px 8px 0;
      cursor: pointer;
      font-size: 14px;

      .chip-weight {
        margin-left: 4px;
        font-size: 12px;
        opacity: 0.8;
      }

      &.is-exhausted {
        cursor: not-allowed;
        opacity: 0.45;
        text-decoration: line-through;
      }
    }
  }

  .section-label {
    margin: 4px 0 8px;
    font-size: 13px;
    color: #606266;
  }

  // row82：猪肉产品列表占满剩余高度、仅自身内部纵向滚动（整页不滚动）
  .cut-grid {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    grid-auto-rows: min-content;
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
