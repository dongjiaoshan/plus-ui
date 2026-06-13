/**
 * 需求列表共享逻辑（WMS-DEMAND-001）。
 *
 * 统一列表页用：数据加载 / 删除 / 状态机操作 / 弹窗调度。
 * 不传 productType → 列表返回全部业态需求；传则按业态过滤（保留向后兼容）。
 */
import { ref, reactive, computed } from 'vue';
import { cancelDemand, confirmDemand, listDemand, removeDemand, submitDemand } from '@/api/djs-warehouse/demand';
import type { DemandManageQuery, DemandManageVO, DemandProductType, DemandStatusCode } from '@/api/djs-warehouse/demand/types';

export function useDemandList(productType?: DemandProductType) {
  const list = ref<DemandManageVO[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const pageNum = ref(1);
  const pageSize = ref(10);

  const searchModel = reactive<Record<string, any>>({
    demandNo: undefined,
    productType: undefined,
    demandStatus: undefined,
    storeId: undefined,
    beginDate: undefined,
    endDate: undefined
  });

  async function fetchList() {
    loading.value = true;
    try {
      const query: DemandManageQuery = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        // 不传则取全部业态；显式 productType 闭包优先，否则用搜索表单选的业态
        productType: productType ?? (searchModel.productType as DemandProductType | undefined),
        demandNo: searchModel.demandNo,
        demandStatus: searchModel.demandStatus,
        storeId: searchModel.storeId,
        beginDate: searchModel.beginDate,
        endDate: searchModel.endDate
      };
      const res = await listDemand(query);
      // ruoyi TableDataInfo: { rows, total, code, msg }；某些场景下挂在 data 上

      const rsp: any = res;
      list.value = (rsp.rows ?? rsp.data ?? []) as DemandManageVO[];
      total.value = (rsp.total ?? 0) as number;
    } finally {
      loading.value = false;
    }
  }

  async function handleDelete(rows: DemandManageVO[]) {
    if (!rows.length) return;
    const ids = rows.map((r) => r.id);
    await removeDemand(ids);
    await fetchList();
  }

  async function handleSubmit(id: string, remark?: string) {
    await submitDemand(id, remark);
    await fetchList();
  }

  async function handleConfirm(id: string, remark?: string) {
    await confirmDemand(id, remark);
    await fetchList();
  }

  async function handleCancel(id: string, remark?: string) {
    await cancelDemand(id, remark);
    await fetchList();
  }

  /** 按状态返回允许的状态机操作（admin 列表按钮显示逻辑用）。 */
  function allowedActions(status: DemandStatusCode): string[] {
    switch (status) {
      case 'DRAFT':
        return ['edit', 'submit', 'cancel', 'remove'];
      case 'SUBMITTED':
        return ['confirm', 'cancel', 'assign_pig'];
      case 'CONFIRMED':
        // 决策 #7：确认即终态，去「开始排产」；保留指派猪只为可选后置动作 + 取消。
        return ['cancel', 'assign_pig'];
      case 'IN_PRODUCTION':
      case 'PARTIAL_SHIPPED':
        return ['history'];
      case 'COMPLETED':
      case 'CANCELLED':
        return ['history'];
      default:
        return [];
    }
  }

  const hasSelection = computed(() => list.value.length > 0);

  return {
    list,
    total,
    loading,
    pageNum,
    pageSize,
    searchModel,
    hasSelection,
    fetchList,
    handleDelete,
    handleSubmit,
    handleConfirm,
    handleCancel,
    allowedActions
  };
}
