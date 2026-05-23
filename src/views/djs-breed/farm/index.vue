<template>
  <div class="farm-page p-2">
    <!-- 顶部：农场只读 panel -->
    <el-card class="farm-panel" shadow="never">
      <template #header>
        <div class="panel-header">
          <span class="panel-title">{{ t('farm.section.farmInfo') }}</span>
          <el-button v-hasPermi="['djs:breed:farm-info:edit']" type="primary" link @click="onEditFarmContact">
            <el-icon><edit /></el-icon>
            <span>{{ t('farm.action.editContact') }}</span>
          </el-button>
        </div>
      </template>
      <el-descriptions :column="3" border size="default">
        <el-descriptions-item :label="t('farm.field.farmName')">{{ farm?.farmName || '—' }}</el-descriptions-item>
        <el-descriptions-item :label="t('farm.field.farmCode')">{{ farm?.farmCode || '—' }}</el-descriptions-item>
        <el-descriptions-item :label="t('farm.field.farmStatus')">
          <dict-tag v-if="farm" :options="farmStatusDict" :value="String(farm.farmStatus)" />
        </el-descriptions-item>
        <el-descriptions-item :label="t('farm.field.contactName')">{{ farm?.contactName || '—' }}</el-descriptions-item>
        <el-descriptions-item :label="t('farm.field.contactPhone')">{{ farm?.contactPhone || '—' }}</el-descriptions-item>
        <el-descriptions-item :label="t('farm.field.address')" :span="3">{{ farm?.address || '—' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 中下：左侧 tree + 右侧详情 panel -->
    <el-row :gutter="12" class="tree-detail-row">
      <el-col :xs="24" :sm="10" :md="8" :lg="7" :xl="6">
        <el-card class="tree-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">{{ t('farm.section.tree') }}</span>
              <div class="header-actions">
                <el-button
                  v-if="!selectedNode || selectedNode.kind === 'barn'"
                  v-hasPermi="['djs:breed:pen:add']"
                  type="primary"
                  size="small"
                  :disabled="!selectedNode || selectedNode.kind !== 'barn'"
                  @click="onAddPen"
                >
                  <el-icon><plus /></el-icon>
                  {{ t('farm.action.addPen') }}
                </el-button>
                <el-button v-hasPermi="['djs:breed:barn:add']" type="primary" size="small" @click="onAddBarn">
                  <el-icon><plus /></el-icon>
                  {{ t('farm.action.addBarn') }}
                </el-button>
              </div>
            </div>
          </template>
          <el-input v-model="treeFilter" :placeholder="t('farm.placeholder.treeFilter')" clearable size="default" class="tree-filter" />
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="{ label: 'label', children: 'children' }"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            node-key="key"
            highlight-current
            default-expand-all
            :empty-text="t('farm.tip.emptyTree')"
            @node-click="onTreeNodeClick"
          >
            <template #default="{ data }">
              <span class="tree-node">
                <el-icon class="tree-node-icon">
                  <office-building v-if="data.kind === 'barn'" />
                  <house v-else />
                </el-icon>
                <span class="tree-node-label">{{ data.label }}</span>
                <el-tag v-if="data.statusTag === 'off'" type="info" size="small" class="tree-node-tag">{{ t('farm.tag.disabled') }}</el-tag>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="14" :md="16" :lg="17" :xl="18">
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">{{ detailTitle }}</span>
              <div v-if="selectedNode" class="header-actions">
                <el-button
                  v-if="selectedNode.kind === 'barn'"
                  v-hasPermi="['djs:breed:barn:edit']"
                  type="primary"
                  size="small"
                  @click="onEditCurrent"
                >
                  <el-icon><edit /></el-icon>
                  {{ t('common.edit') }}
                </el-button>
                <el-button v-if="selectedNode.kind === 'pen'" v-hasPermi="['djs:breed:pen:edit']" type="primary" size="small" @click="onEditCurrent">
                  <el-icon><edit /></el-icon>
                  {{ t('common.edit') }}
                </el-button>
                <el-button
                  v-if="selectedNode.kind === 'barn'"
                  v-hasPermi="['djs:breed:barn:remove']"
                  type="danger"
                  size="small"
                  @click="onDeleteCurrent"
                >
                  <el-icon><delete /></el-icon>
                  {{ t('common.delete') }}
                </el-button>
                <el-button
                  v-if="selectedNode.kind === 'pen'"
                  v-hasPermi="['djs:breed:pen:remove']"
                  type="danger"
                  size="small"
                  @click="onDeleteCurrent"
                >
                  <el-icon><delete /></el-icon>
                  {{ t('common.delete') }}
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="!selectedNode" class="empty-detail">
            <el-empty :description="t('farm.tip.selectNode')" />
          </div>

          <el-descriptions v-else-if="selectedNode.kind === 'barn' && selectedBarn" :column="2" border>
            <el-descriptions-item :label="t('farm.field.barnCode')">{{ selectedBarn.barnCode }}</el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.barnName')">{{ selectedBarn.barnName }}</el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.barnType')">
              <dict-tag :options="barnTypeDict" :value="selectedBarn.barnType" />
            </el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.barnStatus')">
              <el-tag :type="selectedBarn.barnStatus === 1 ? 'success' : 'info'">
                {{ selectedBarn.barnStatus === 1 ? t('farm.tag.enabled') : t('farm.tag.disabled') }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.capacity')">{{ selectedBarn.capacity ?? '—' }}</el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.currentCount')">{{ selectedBarn.currentCount ?? 0 }}</el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.remark')" :span="2">{{ selectedBarn.remark || '—' }}</el-descriptions-item>
          </el-descriptions>

          <el-descriptions v-else-if="selectedNode.kind === 'pen' && selectedPen" :column="2" border>
            <el-descriptions-item :label="t('farm.field.barn')">{{ parentBarnName }}</el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.penCode')">{{ selectedPen.penCode }}</el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.penName')">{{ selectedPen.penName }}</el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.penType')">
              <dict-tag :options="penTypeDict" :value="selectedPen.penType" />
            </el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.capacity')">{{ selectedPen.capacity ?? '—' }}</el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.currentCount')">{{ selectedPen.currentCount ?? 0 }}</el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.penStatus')">
              <el-tag :type="selectedPen.penStatus === 1 ? 'success' : 'info'">
                {{ selectedPen.penStatus === 1 ? t('farm.tag.enabled') : t('farm.tag.disabled') }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="t('farm.field.remark')" :span="2">{{ selectedPen.remark || '—' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <FarmContactForm ref="farmContactFormRef" @success="loadFarm" />
    <BarnForm ref="barnFormRef" @success="onBarnSuccess" />
    <PenForm ref="penFormRef" @success="onPenSuccess" />
  </div>
</template>

<script setup name="FarmIndex" lang="ts">
import { Delete, Edit, House, OfficeBuilding, Plus } from '@element-plus/icons-vue';
import { delBarn, delPen, getCurrentFarm, listBarn, listPen } from '@/api/djs-breed/farm';
import type { BarnVO, FarmInfoVO, PenVO } from '@/api/djs-breed/farm/types';
import BarnForm from './components/BarnForm.vue';
import FarmContactForm from './components/FarmContactForm.vue';
import PenForm from './components/PenForm.vue';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';

interface TreeNode {
  key: string;
  /** 'barn' | 'pen' */
  kind: 'barn' | 'pen';
  id: number | string;
  label: string;
  /** barn 节点专属：原始数据，pen 子节点也存一份方便回查 */
  raw: BarnVO | PenVO;
  /** barn 专属：所属栏位列表 */
  children?: TreeNode[];
  /** disabled 时显示 tag */
  statusTag?: 'on' | 'off';
}

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 字典
const farmDicts = useDict('djs_farm_status');
const farmStatusDict = computed(() => farmDicts['djs_farm_status'] ?? []);
const barnDicts = useDict('djs_barn_type');
const barnTypeDict = computed(() => barnDicts['djs_barn_type'] ?? []);
const penDicts = useDict('djs_pen_type');
const penTypeDict = computed(() => penDicts['djs_pen_type'] ?? []);

// 农场
const farm = ref<FarmInfoVO | null>(null);

// 栋舍 / 栏位列表（pen 全量拉，前端按 barnId group）
const barns = ref<BarnVO[]>([]);
const pens = ref<PenVO[]>([]);

const treeFilter = ref('');
const treeRef = ref<{ filter: (val: string) => void }>();

const selectedNode = ref<TreeNode | null>(null);

const treeData = computed<TreeNode[]>(() => {
  return barns.value.map<TreeNode>((barn) => {
    const penChildren = pens.value
      .filter((p) => String(p.barnId) === String(barn.id))
      .map<TreeNode>((pen) => ({
        key: 'pen-' + pen.id,
        kind: 'pen',
        id: pen.id,
        label: pen.penName + '（' + pen.penCode + '）',
        raw: pen,
        statusTag: pen.penStatus === 0 ? 'off' : 'on'
      }));
    return {
      key: 'barn-' + barn.id,
      kind: 'barn',
      id: barn.id,
      label: barn.barnName + '（' + barn.barnCode + '）',
      raw: barn,
      children: penChildren,
      statusTag: barn.barnStatus === 0 ? 'off' : 'on'
    };
  });
});

watch(treeFilter, (val) => {
  treeRef.value?.filter(val);
});

function filterNode(value: string, data: TreeNode) {
  if (!value) return true;
  return data.label.includes(value);
}

const selectedBarn = computed<BarnVO | null>(() => {
  if (!selectedNode.value || selectedNode.value.kind !== 'barn') return null;
  return selectedNode.value.raw as BarnVO;
});

const selectedPen = computed<PenVO | null>(() => {
  if (!selectedNode.value || selectedNode.value.kind !== 'pen') return null;
  return selectedNode.value.raw as PenVO;
});

const parentBarnName = computed(() => {
  if (!selectedPen.value) return '';
  const parent = barns.value.find((b) => String(b.id) === String(selectedPen.value!.barnId));
  return parent ? parent.barnName + '（' + parent.barnCode + '）' : String(selectedPen.value.barnId);
});

const detailTitle = computed(() => {
  if (!selectedNode.value) return t('farm.section.detail');
  return selectedNode.value.kind === 'barn' ? t('farm.section.barnDetail') : t('farm.section.penDetail');
});

const farmContactFormRef = ref<{ openEdit: (farm: FarmInfoVO) => void }>();
const barnFormRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();
const penFormRef = ref<{
  openCreate: (barnId: number | string, barnName: string) => void;
  openEdit: (id: number | string, barnName: string) => void;
}>();

async function loadFarm() {
  const res = await getCurrentFarm();
  farm.value = res.data;
}

async function loadBarns() {
  // 走 list 取全量（默认分页 10 不够，给 1000 兜底；超过 1000 是异常情况，下游 BRD-CORE-001 会限制）
  const res = await listBarn({ pageNum: 1, pageSize: 1000 });
  barns.value = (res.rows ?? res.data ?? []) as BarnVO[];
}

async function loadPens() {
  const res = await listPen({ pageNum: 1, pageSize: 1000 });
  pens.value = (res.rows ?? res.data ?? []) as PenVO[];
}

async function reloadAll() {
  await Promise.all([loadBarns(), loadPens()]);
}

function onTreeNodeClick(data: TreeNode) {
  selectedNode.value = data;
}

function onEditFarmContact() {
  if (!farm.value) return;
  farmContactFormRef.value?.openEdit(farm.value);
}

function onAddBarn() {
  barnFormRef.value?.openCreate();
}

function onAddPen() {
  if (!selectedNode.value || selectedNode.value.kind !== 'barn') {
    proxy?.$modal.msgWarning(t('farm.tip.selectBarnFirst'));
    return;
  }
  const barn = selectedNode.value.raw as BarnVO;
  penFormRef.value?.openCreate(barn.id, barn.barnName + '（' + barn.barnCode + '）');
}

function onEditCurrent() {
  if (!selectedNode.value) return;
  if (selectedNode.value.kind === 'barn') {
    barnFormRef.value?.openEdit(selectedNode.value.id);
  } else {
    penFormRef.value?.openEdit(selectedNode.value.id, parentBarnName.value);
  }
}

async function onDeleteCurrent() {
  if (!selectedNode.value) return;
  const node = selectedNode.value;
  await proxy?.$modal.confirm(
    node.kind === 'barn'
      ? t('farm.confirm.delBarn', { name: (node.raw as BarnVO).barnName })
      : t('farm.confirm.delPen', { name: (node.raw as PenVO).penName })
  );
  if (node.kind === 'barn') {
    await delBarn(node.id);
  } else {
    await delPen(node.id);
  }
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  selectedNode.value = null;
  await reloadAll();
}

async function onBarnSuccess() {
  await reloadAll();
}

async function onPenSuccess() {
  await reloadAll();
}

onMounted(async () => {
  await Promise.all([loadFarm(), reloadAll()]);
});
</script>

<style scoped>
.farm-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-weight: 600;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.tree-detail-row {
  margin-top: 4px;
}

.tree-card,
.detail-card {
  height: 100%;
}

.tree-filter {
  margin-bottom: 8px;
}

.tree-node {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tree-node-icon {
  color: var(--el-color-primary);
}

.tree-node-label {
  font-size: 14px;
}

.tree-node-tag {
  margin-left: 4px;
}

.empty-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>
