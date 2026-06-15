/**
 * 猪只列表共用 composable（BRD-LIST-001）。
 *
 * 4 类独立 .vue（sow / boar / piglet / fattening）通过本 composable 共享：
 *  - searchModel + load + reset 的状态机
 *  - 固定 pigType 透传到 /djs/breed/pig/list
 *  - excludeEnd 默认 true（终态不显示在主列表，需要看历史走"事件台账"）
 *
 * 各 vue 自己定义 columns / searchSchema / dictTypes，本 composable 只管 data flow。
 */
import { ref, reactive } from 'vue';
import { listPig } from '@/api/djs-breed/pig';
import type { PigLifecycle, PigQuery, PigType, PigVO } from '@/api/djs-breed/pig/types';

export interface UsePigListExtraQuery {
  earNo?: string;
  pigSex?: 'F' | 'M';
  currentStatus?: PigLifecycle;
  /** 栋舍名称模糊（后端反查 barn_id 集合过滤） */
  barnName?: string;
  /** 栏位名称模糊（后端反查 pen_id 集合过滤） */
  penName?: string;
  motherEar?: string;
}

export function usePigListByType(pigType: PigType) {
  const list = ref<PigVO[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const pageNum = ref(1);
  const pageSize = ref(10);

  const searchModel = reactive<UsePigListExtraQuery & { excludeEnd: boolean }>({
    earNo: undefined,
    pigSex: undefined,
    currentStatus: undefined,
    barnName: undefined,
    penName: undefined,
    motherEar: undefined,
    excludeEnd: true
  });

  async function load() {
    loading.value = true;
    try {
      const params = {
        ...searchModel,
        pigType,
        pageNum: pageNum.value,
        pageSize: pageSize.value
      } as PigQuery;
      // backend 返回字段约定: rows / total（ruoyi TableDataInfo）；本 ticket 通过 listPig 调 /djs/breed/pig/list
      const res = (await listPig(params)) as any;
      list.value = (res.rows ?? []) as PigVO[];
      total.value = (res.total ?? 0) as number;
    } finally {
      loading.value = false;
    }
  }

  function handleSearch(payload: UsePigListExtraQuery) {
    Object.assign(searchModel, payload);
    pageNum.value = 1;
    load();
  }

  function handleReset() {
    Object.assign(searchModel, {
      earNo: undefined,
      pigSex: undefined,
      currentStatus: undefined,
      barnName: undefined,
      penName: undefined,
      motherEar: undefined,
      excludeEnd: true
    });
    pageNum.value = 1;
    load();
  }

  function handlePageChange(p: number, s: number) {
    pageNum.value = p;
    pageSize.value = s;
    load();
  }

  return {
    list,
    total,
    loading,
    pageNum,
    pageSize,
    searchModel,
    load,
    handleSearch,
    handleReset,
    handlePageChange
  };
}
