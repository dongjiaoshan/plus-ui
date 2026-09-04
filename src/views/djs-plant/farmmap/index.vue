<template>
  <div class="p-2 farmmap-page" v-loading="loading">
    <!-- 全屏的目标是这一层：把卡片整个铺满屏幕，图例和覆盖率跟着一起留在视野里 -->
    <div ref="fsTarget" class="farmmap-shell">
      <el-card shadow="never">
        <template #header>
          <div class="farmmap-header">
            <span class="text-base font-medium">{{ t('plantFarmMap.pageTitle') }}</span>
            <div class="farmmap-header__right">
              <span class="farmmap-header__stat">
                {{ t('plantFarmMap.stat.bound', { n: boundCount, total: plotTotal }) }}
                <span class="farmmap-header__stat-off">{{ t('plantFarmMap.stat.offMap', { n: unboundPlots.length }) }}</span>
              </span>
              <el-radio-group v-model="colorMode" size="small">
                <el-radio-button value="status">{{ t('plantFarmMap.colorBy.status') }}</el-radio-button>
                <el-radio-button value="origin">{{ t('plantFarmMap.colorBy.origin') }}</el-radio-button>
              </el-radio-group>
              <el-tooltip :content="t(isFullscreen ? 'plantFarmMap.action.exitFullscreen' : 'plantFarmMap.action.fullscreen')">
                <el-button size="small" @click="toggleFullscreen">
                  <svg-icon :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" />
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </template>

        <div class="farmmap-body">
          <!-- 外面这层壳专管尺寸：FarmMapCanvas 根节点自带 width/height:100%，
               宽高比要是写在它身上会被它自己的 width:100% 盖掉 -->
          <div class="farmmap-body__canvas">
            <FarmMapCanvas ref="canvasRef" :states="states" :selected-key="selectedKey" :color-mode="colorMode" @region-click="onRegionClick" />
          </div>

          <aside class="farmmap-body__side">
            <!-- 图例 -->
            <div class="farmmap-side-block">
              <div class="farmmap-side-title">{{ t('plantFarmMap.legend.title') }}</div>
              <div v-for="item in legend" :key="item.status" class="farmmap-legend-row">
                <i class="farmmap-legend-swatch" :class="`farmmap-legend-swatch--${item.status}`" />
                <span>{{ item.text }}</span>
              </div>
            </div>

            <!-- 当前选中的格子：挂了就给详情 + 解绑，没挂就给地块选择器 -->
            <div class="farmmap-side-block farmmap-side-block--grow">
              <div class="farmmap-side-title">
                {{ t('plantFarmMap.selected.title') }}
                <span v-if="selectedKey" class="farmmap-side-key">{{ selectedKey }}</span>
              </div>

              <div v-if="!selectedKey" class="farmmap-side-tip">{{ t('plantFarmMap.selected.empty') }}</div>

              <template v-else-if="selectedRegionVo">
                <div class="farmmap-selected-name">{{ selectedRegionVo.plotName || selectedRegionVo.plotCode }}</div>
                <div class="farmmap-kv">
                  <span>{{ t('plantFarmMap.field.plotCode') }}</span
                  >{{ selectedRegionVo.plotCode || '-' }}
                </div>
                <div class="farmmap-kv">
                  <span>{{ t('plantFarmMap.field.zoneName') }}</span
                  >{{ selectedRegionVo.zoneName || '-' }}
                </div>
                <div class="farmmap-kv">
                  <span>{{ t('plantFarmMap.field.plotStatus') }}</span>
                  <dict-tag :options="djs_plot_status" :value="selectedRegionVo.plotStatus" />
                </div>
                <div class="farmmap-kv">
                  <span>{{ t('plantFarmMap.field.plotArea') }}</span
                  >{{ selectedRegionVo.plotArea ?? '-' }}
                </div>
                <el-button v-hasPermi="['djs:plant:farmmap:bind']" class="mt-2" size="small" type="danger" plain @click="handleUnbind">
                  {{ t('plantFarmMap.action.unbind') }}
                </el-button>
              </template>

              <template v-else>
                <div class="farmmap-side-tip mb-2">{{ t('plantFarmMap.selected.unbound') }}</div>
                <el-select
                  v-model="pickedPlotId"
                  v-hasPermi="['djs:plant:farmmap:bind']"
                  filterable
                  clearable
                  size="small"
                  class="w-full"
                  :placeholder="t('plantFarmMap.action.pickPlot')"
                >
                  <el-option-group v-for="group in unboundGroups" :key="group.zoneName" :label="group.zoneName">
                    <el-option v-for="p in group.plots" :key="p.id" :label="`${p.plotName || p.plotCode}（${p.plotCode}）`" :value="p.id" />
                  </el-option-group>
                </el-select>
                <el-button
                  v-hasPermi="['djs:plant:farmmap:bind']"
                  class="mt-2"
                  size="small"
                  type="primary"
                  :disabled="!pickedPlotId"
                  @click="handleBind"
                >
                  {{ t('plantFarmMap.action.bind') }}
                </el-button>
              </template>
            </div>

            <!-- 图外地块：图上挂不上的地块在这儿列出来，覆盖率不假装是 100% -->
            <div class="farmmap-side-block">
              <div class="farmmap-side-title">{{ t('plantFarmMap.offMap.title', { n: unboundPlots.length }) }}</div>
              <div class="farmmap-offmap-list">
                <el-tag v-for="p in unboundPlots" :key="p.id" type="info" size="small" class="mr-1 mb-1">
                  {{ p.plotName || p.plotCode }}
                </el-tag>
                <span v-if="!unboundPlots.length" class="farmmap-side-tip">{{ t('plantFarmMap.offMap.allBound') }}</span>
              </div>
              <div class="farmmap-side-tip">{{ t('plantFarmMap.offMap.tip') }}</div>
            </div>

            <div class="farmmap-side-tip farmmap-side-tip--foot">{{ t('plantFarmMap.opTip') }}</div>
          </aside>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="PlantFarmMap">
import { useI18n } from 'vue-i18n';
import { ComponentInternalInstance } from 'vue';
import FarmMapCanvas, { type RegionState, type RegionStatus } from './components/FarmMapCanvas.vue';
import { MAP_REGIONS } from './map/regions';
import { bindFarmMapRegion, getFarmMapOverview, unbindFarmMapRegion } from '@/api/djs-plant/farmmap';
import type { FarmMapRegionVO, FarmMapUnboundPlotVO } from '@/api/djs-plant/farmmap/types';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_plot_status } = toRefs<any>(proxy?.useDict('djs_plot_status'));

const loading = ref(false);
const colorMode = ref<'status' | 'origin'>('status');
const selectedKey = ref('');
const pickedPlotId = ref<string>('');

const fsTarget = ref<HTMLElement>();
const canvasRef = ref<InstanceType<typeof FarmMapCanvas>>();
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(fsTarget);

/**
 * 进出全屏后把地图复位。
 *
 * 容器尺寸变了，之前平移/放大留下的 translate 可能把图推出视口外；
 * 复位比让用户自己找回来省事（clampTranslate 只在下一次交互时才纠正）。
 */
watch(isFullscreen, async () => {
  await nextTick();
  canvasRef.value?.reset();
});

const regions = ref<FarmMapRegionVO[]>([]);
const unboundPlots = ref<FarmMapUnboundPlotVO[]>([]);
const plotTotal = ref(0);
const boundCount = ref(0);

/** regionKey → 已挂地块。没进这张表的格子就是没挂。 */
const regionByKey = computed(() => new Map(regions.value.map((r) => [r.regionKey, r])));

const selectedRegionVo = computed(() => (selectedKey.value ? regionByKey.value.get(selectedKey.value) : undefined));

/**
 * 地块状态 → 图上颜色。
 *
 * 直接映射字典 djs_plot_status（1=空闲 / 2=种植 / 3=采摘），不另造一套：
 * 图上的颜色和地块列表的状态列必须说同一件事。
 */
function statusOf(vo?: FarmMapRegionVO): RegionStatus {
  if (!vo) return 'unbound';
  if (vo.plotStatus === 2) return 'planting';
  if (vo.plotStatus === 3) return 'harvesting';
  return 'idle';
}

const states = computed<Record<string, RegionState>>(() => {
  const result: Record<string, RegionState> = {};
  for (const region of MAP_REGIONS) {
    const vo = regionByKey.value.get(region.key);
    const status = statusOf(vo);
    result[region.key] = {
      status,
      label: vo ? vo.plotName || vo.plotCode || region.key : region.key,
      tooltip: vo
        ? [`${t('plantFarmMap.field.zoneName')}${vo.zoneName || '-'}`, `${t('plantFarmMap.field.plotCode')}${vo.plotCode || '-'}`]
        : [t('plantFarmMap.legend.unbound')]
    };
  }
  return result;
});

const legend = computed(() => {
  const keys: RegionStatus[] = ['unbound', 'idle', 'planting', 'harvesting'];
  return keys.map((status) => ({ status, text: t(`plantFarmMap.legend.${status}`) }));
});

/** 图外地块按片区分组，绑定时从 167 块里挑才找得动。 */
const unboundGroups = computed(() => {
  const map = new Map<string, FarmMapUnboundPlotVO[]>();
  for (const p of unboundPlots.value) {
    const key = p.zoneName || t('plantFarmMap.noZone');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return [...map.entries()].map(([zoneName, plots]) => ({ zoneName, plots }));
});

async function loadOverview() {
  loading.value = true;
  try {
    const res = await getFarmMapOverview();
    regions.value = res.data.regions ?? [];
    unboundPlots.value = res.data.unboundPlots ?? [];
    plotTotal.value = res.data.plotTotal ?? 0;
    boundCount.value = res.data.boundCount ?? 0;
  } finally {
    loading.value = false;
  }
}

function onRegionClick(key: string) {
  selectedKey.value = selectedKey.value === key ? '' : key;
  pickedPlotId.value = '';
}

async function handleBind() {
  if (!selectedKey.value || !pickedPlotId.value) return;
  await bindFarmMapRegion({ regionKey: selectedKey.value, plotId: pickedPlotId.value });
  proxy?.$modal.msgSuccess(t('plantFarmMap.msg.bound'));
  pickedPlotId.value = '';
  await loadOverview();
}

async function handleUnbind() {
  if (!selectedKey.value) return;
  await proxy?.$modal.confirm(t('plantFarmMap.msg.unbindConfirm'));
  await unbindFarmMapRegion(selectedKey.value);
  proxy?.$modal.msgSuccess(t('plantFarmMap.msg.unbound'));
  await loadOverview();
}

onMounted(loadOverview);
</script>

<style scoped>
/*
  高度链：页面 → shell → el-card → card body → farmmap-body → 地图壳。
  每一层都得 min-height:0 + flex:1，中间断一层地图就塌回内容高度。
  84px = AppMain.vue 里同一个常量（navbar 50 + tagsView 34），不是我拍的数。
*/
.farmmap-page {
  display: flex;
  height: calc(100vh - 84px);
}

.farmmap-shell {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* el-card 内部结构不带本组件的 scope id，只能 :deep */
.farmmap-shell :deep(.el-card) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.farmmap-shell :deep(.el-card__body) {
  display: flex;
  flex: 1;
  min-height: 0;
  /* 默认 15/20/20 太厚，地图是竖版按高度定宽，省下的每一像素都会变成宽度 */
  padding: 10px 12px 12px;
}

/* 原生全屏的元素默认是黑底，且不继承页面留白 */
.farmmap-shell:fullscreen {
  padding: 8px;
  background-color: var(--el-bg-color-page);
}

.farmmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.farmmap-header__right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.farmmap-header__stat {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.farmmap-header__stat-off {
  margin-left: 8px;
}

.farmmap-body {
  /* flex:1 不能少：它自己也是 card body 的 flex item，不撑开就按内容收缩、整体贴左，
     右边空一大片（全屏时尤其明显） */
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: stretch;
  min-width: 0;
  height: 100%;
  min-height: 0;
}

.farmmap-body__canvas {
  /*
    甲方那张图是竖版（1102×1428）。若让画布占满剩余宽度，SVG 的 xMidYMid meet 会按高度
    缩放并居中，左右各留一大片死米色。所以这里按图的宽高比反算宽度，让画布正好裹住地图。
    窄屏时 max-width 兜底，宁可回到 letterbox 也不横向溢出。
  */
  flex: 0 1 auto;
  aspect-ratio: 1102 / 1428;
  max-width: 100%;
  /* 高度由父级 flex 给满，宽度按图的宽高比反算 —— 给得越高图越大，全屏时最明显 */
  height: 100%;
  /* 竖版图在横屏上必然吃不满宽度；左右 auto 让它在侧栏之外的空间里居中，
     而不是贴着左边、把空白全甩到右边 */
  margin-inline: auto;
}

.farmmap-body__side {
  display: flex;
  flex: 0 0 240px;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  overflow-y: auto;
}

.farmmap-side-block {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.farmmap-side-block--grow {
  flex: 1 1 auto;
}

.farmmap-side-title {
  display: flex;
  gap: 6px;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.farmmap-side-key {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.farmmap-legend-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.farmmap-legend-swatch {
  width: 16px;
  height: 12px;
  border: 1.4px solid;
  border-radius: 2px;
}

.farmmap-legend-swatch--unbound {
  background-color: #fff;
  border-style: dashed;
  border-color: #c2c6bd;
}

.farmmap-legend-swatch--idle {
  background-color: #e6e9ec;
  border-color: #c9ced3;
}

.farmmap-legend-swatch--planting {
  background-color: #a8d98b;
  border-color: #7fbb5f;
}

.farmmap-legend-swatch--harvesting {
  background-color: #f5b969;
  border-color: #dd9339;
}

.farmmap-selected-name {
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.farmmap-kv {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.farmmap-kv > span {
  color: var(--el-text-color-secondary);
}

.farmmap-offmap-list {
  max-height: 148px;
  margin-bottom: 6px;
  overflow-y: auto;
}

.farmmap-side-tip {
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.farmmap-side-tip--foot {
  margin-top: auto;
}
</style>
