import { ref, type Ref } from 'vue';
import { listUser } from '@/api/system/user';

/**
 * 记录人下拉选项（V6-R186 入库明细 / 出库明细两个弹窗共用唯一取数口径）。
 *
 * 甲方 row186 的筛选条件是「入库记录人 / 出库记录人」。选项直接取系统用户列表，
 * 与「毛菜间出库管理」页的操作人下拉同一份来源 —— 不按「本区间内出现过的记录人」动态派生：
 * 那样一改日期区间下拉就跟着变，用户刚选中的人可能凭空消失，反而更难用。
 *
 * value 取 user_id 的 **string** 形态：雪花 id 可能超 2^53，转 number 末位会被截断，
 * 选出来的筛选条件对不上任何一行。
 *
 * 用户量级固定在数百，一次拉全量交给 el-select 本地过滤即可，不做 remote 搜索。
 */

/** el-select 选项：label = 用户昵称，value = user_id（string） */
export interface OperatorOption {
  label: string;
  value: string;
}

export interface UseOperatorOptionsReturn {
  operatorOptions: Ref<OperatorOption[]>;
  loadOperatorOptions: () => Promise<void>;
}

/** 一次拉全量的页大小（系统用户条数远小于此值） */
const USER_PAGE_SIZE = 500;

/** request 拦截器已把响应拆成业务体，声明的 AxiosPromise 泛型对不上，这里按实际结构收窄 */
interface UserListPayload {
  rows?: Array<{ userId: number | string; nickName: string }>;
  data?: Array<{ userId: number | string; nickName: string }>;
}

export function useOperatorOptions(): UseOperatorOptionsReturn {
  const operatorOptions = ref<OperatorOption[]>([]);

  /** 拉取失败只降级成空下拉 + 控制台告警：记录人筛选是辅助条件，不该把整个弹窗拖崩 */
  async function loadOperatorOptions(): Promise<void> {
    if (operatorOptions.value.length) {
      return;
    }
    try {
      const res = (await listUser({ pageNum: 1, pageSize: USER_PAGE_SIZE })) as unknown as UserListPayload;
      const rows = res.rows ?? res.data ?? [];
      operatorOptions.value = rows.map((r) => ({ label: r.nickName, value: String(r.userId) }));
    } catch (e) {
      console.warn('[useOperatorOptions] listUser failed', e);
      operatorOptions.value = [];
    }
  }

  return { operatorOptions, loadOperatorOptions };
}
