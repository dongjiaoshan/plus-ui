<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="ph">
          <span class="pt">
            {{ t('farm.proto.penDetailTitle') }}
            <!-- 栏位名只存栏位名（不带栋舍名前缀），栋舍上下文放标题上，避免每行重复 -->
            <span v-if="barnName" class="pt-barn">{{ barnName }}</span>
          </span>
          <el-button link type="primary" @click="goBack">
            <el-icon><back /></el-icon>
            <span>{{ t('farm.proto.back') }}</span>
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 大栏：序号 + 头数 -->
        <el-tab-pane name="big" :label="`${t('farm.proto.tab.big')}(${counts.big})`">
          <el-table v-loading="loading" :data="rows.big" border>
            <el-table-column :label="t('farm.proto.col.bigSeq')" prop="penName" align="center" header-align="center" />
            <el-table-column :label="t('farm.proto.col.headCount')" align="center" header-align="center">
              <template #default="{ row }">{{ row.headCount ?? 0 }}</template>
            </el-table-column>
            <el-table-column :label="t('biz.table.column.action')" width="120" align="center" header-align="center">
              <template #default="{ row }">
                <el-button v-hasPermi="['djs:breed:pen:remove']" link type="danger" @click="onDel(row, 'big')">
                  {{ t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
            <template #empty><el-empty :description="t('farm.proto.empty')" /></template>
          </el-table>
        </el-tab-pane>

        <!-- 限位栏：栏号 + 单头耳号 -->
        <el-tab-pane name="stall" :label="`${t('farm.proto.tab.stall')}(${counts.stall})`">
          <el-table v-loading="loading" :data="rows.stall" border>
            <el-table-column :label="t('farm.proto.col.stallNo')" prop="penName" align="center" header-align="center" />
            <el-table-column :label="t('farm.proto.col.earNo')" align="center" header-align="center">
              <template #default="{ row }">
                <el-button v-if="row.earNo && row.pigId" link type="primary" @click="goPig(row.pigId)">{{ row.earNo }}</el-button>
                <span v-else>—</span>
              </template>
            </el-table-column>
            <el-table-column :label="t('biz.table.column.action')" width="120" align="center" header-align="center">
              <template #default="{ row }">
                <el-button v-hasPermi="['djs:breed:pen:remove']" link type="danger" @click="onDel(row, 'stall')">
                  {{ t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
            <template #empty><el-empty :description="t('farm.proto.empty')" /></template>
          </el-table>
        </el-tab-pane>

        <!-- 产床：床号 + 母猪耳号 + 仔猪数 -->
        <el-tab-pane name="farrow" :label="`${t('farm.proto.tab.farrow')}(${counts.farrow})`">
          <el-table v-loading="loading" :data="rows.farrow" border>
            <el-table-column :label="t('farm.proto.col.bedNo')" prop="penName" align="center" header-align="center" />
            <el-table-column :label="t('farm.proto.col.earNo')" align="center" header-align="center">
              <template #default="{ row }">
                <el-button v-if="row.earNo && row.pigId" link type="primary" @click="goPig(row.pigId)">{{ row.earNo }}</el-button>
                <span v-else>—</span>
              </template>
            </el-table-column>
            <el-table-column :label="t('farm.proto.col.pigletCount')" align="center" header-align="center">
              <template #default="{ row }">{{ row.pigletCount ?? '—' }}</template>
            </el-table-column>
            <el-table-column :label="t('biz.table.column.action')" width="120" align="center" header-align="center">
              <template #default="{ row }">
                <el-button v-hasPermi="['djs:breed:pen:remove']" link type="danger" @click="onDel(row, 'farrow')">
                  {{ t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
            <template #empty><el-empty :description="t('farm.proto.empty')" /></template>
          </el-table>
        </el-tab-pane>

        <!-- 散栏：序号 + 头数（多头栏，克隆大栏） -->
        <el-tab-pane name="scatter" :label="`${t('farm.proto.tab.scatter')}(${counts.scatter})`">
          <el-table v-loading="loading" :data="rows.scatter" border>
            <el-table-column :label="t('farm.proto.col.bigSeq')" prop="penName" align="center" header-align="center" />
            <el-table-column :label="t('farm.proto.col.headCount')" align="center" header-align="center">
              <template #default="{ row }">{{ row.headCount ?? 0 }}</template>
            </el-table-column>
            <el-table-column :label="t('biz.table.column.action')" width="120" align="center" header-align="center">
              <template #default="{ row }">
                <el-button v-hasPermi="['djs:breed:pen:remove']" link type="danger" @click="onDel(row, 'scatter')">
                  {{ t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
            <template #empty><el-empty :description="t('farm.proto.empty')" /></template>
          </el-table>
        </el-tab-pane>

        <!-- 保育栏：序号 + 头数（多头栏，克隆大栏） -->
        <el-tab-pane name="nursery_pen" :label="`${t('farm.proto.tab.nurseryPen')}(${counts.nursery_pen})`">
          <el-table v-loading="loading" :data="rows.nursery_pen" border>
            <el-table-column :label="t('farm.proto.col.bigSeq')" prop="penName" align="center" header-align="center" />
            <el-table-column :label="t('farm.proto.col.headCount')" align="center" header-align="center">
              <template #default="{ row }">{{ row.headCount ?? 0 }}</template>
            </el-table-column>
            <el-table-column :label="t('biz.table.column.action')" width="120" align="center" header-align="center">
              <template #default="{ row }">
                <el-button v-hasPermi="['djs:breed:pen:remove']" link type="danger" @click="onDel(row, 'nursery_pen')">
                  {{ t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
            <template #empty><el-empty :description="t('farm.proto.empty')" /></template>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup name="FarmPenDetail" lang="ts">
import { Back } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { delPen, getBarn, penDetail } from '@/api/djs-breed/farm';
import type { PenDetailVO } from '@/api/djs-breed/farm/types';
import { useI18n } from 'vue-i18n';

/**
 * 栏位详情子页（对齐原型）：从农场栋舍管理行操作「栏位详情」进入。
 * 5-tab 按 penType 展示：大栏（头数）/ 限位栏（单头耳号）/ 产床（耳号 + 仔猪数）/ 散栏（头数）/ 保育栏（头数）。只删不增。
 */
type PenType = 'big' | 'stall' | 'farrow' | 'scatter' | 'nursery_pen';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const barnId = computed(() => String(route.params.barnId ?? ''));
const barnName = ref('');
const activeTab = ref<PenType>('big');
const loading = ref(false);

const rows = reactive<Record<PenType, PenDetailVO[]>>({ big: [], stall: [], farrow: [], scatter: [], nursery_pen: [] });
const counts = reactive<Record<PenType, number>>({ big: 0, stall: 0, farrow: 0, scatter: 0, nursery_pen: 0 });

async function loadType(type: PenType) {
  const res = await penDetail(barnId.value, type);
  const data = (res.data ?? []) as PenDetailVO[];
  rows[type] = data;
  counts[type] = data.length;
}

async function loadBarnName() {
  const res = await getBarn(barnId.value);
  barnName.value = res.data?.barnName ?? '';
}

async function loadAll() {
  if (!barnId.value) return;
  loading.value = true;
  try {
    await Promise.all([
      loadBarnName(),
      loadType('big'),
      loadType('stall'),
      loadType('farrow'),
      loadType('scatter'),
      loadType('nursery_pen')
    ]);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.back();
}
function goPig(pigId: number | string) {
  router.push({ path: `/djs-breed/pig/detail/${pigId}` });
}

async function onDel(row: PenDetailVO, type: PenType) {
  await proxy?.$modal.confirm(t('farm.proto.confirmDelPen', { name: row.penName }));
  await delPen(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  await loadType(type);
}

onMounted(loadAll);
</script>

<style scoped>
.ph {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pt {
  font-weight: 600;
  font-size: 14px;
}
.pt-barn {
  margin-left: 8px;
  font-weight: 400;
  color: var(--el-text-color-regular);
}
</style>
