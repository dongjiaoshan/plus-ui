import { ref, type Ref } from 'vue';
import { listSupplier } from '@/api/djs-common/supplier';

/**
 * 供应商主数据下拉选项（可搜索下拉共用唯一取数口径）。
 *
 * 「入库记录」搜索区与「入库汇总」弹窗搜索区都要一个 `el-select + filterable` 的供应商筛选，
 * 两处的选项来源必须是同一份，否则同一个供应商在两页里能出现「一页搜得到、一页搜不到」。
 *
 * value 取供应商 ID 的 **string** 形态：t_md_supplier.id 已排到 19 位（> 2^53），
 * 转 number 末位会被截断，选出来的筛选条件对不上任何一行（coder-djs-cross-layer-contract 契约 1）。
 *
 * 供应商是主数据、量级固定在数百家，一次拉全量交给 el-select 本地过滤即可，
 * 不做 remote 搜索 —— 打字过滤零延迟，也避免每敲一个字打一次接口。
 */

/** el-select 选项：label = 供应商名称，value = 供应商 ID（string） */
export interface SupplierOption {
  label: string;
  value: string;
}

export interface UseSupplierOptionsReturn {
  supplierOptions: Ref<SupplierOption[]>;
  loadSupplierOptions: () => Promise<void>;
}

/** 一次拉全量的页大小（供应商主数据条数远小于此值） */
const SUPPLIER_PAGE_SIZE = 500;

/** request 拦截器已把响应拆成业务体，声明的 AxiosPromise 泛型对不上，这里按实际结构收窄 */
interface SupplierListPayload {
  rows?: Array<{ id: number | string; supplierName: string }>;
  data?: Array<{ id: number | string; supplierName: string }>;
}

export function useSupplierOptions(): UseSupplierOptionsReturn {
  const supplierOptions = ref<SupplierOption[]>([]);

  /** 拉取失败只降级成空下拉 + 控制台告警：供应商筛选是辅助条件，不该把整页搜索区拖崩 */
  async function loadSupplierOptions(): Promise<void> {
    try {
      const res = (await listSupplier({ pageNum: 1, pageSize: SUPPLIER_PAGE_SIZE })) as unknown as SupplierListPayload;
      const rows = res.rows ?? res.data ?? [];
      supplierOptions.value = rows.map((r) => ({ label: r.supplierName, value: String(r.id) }));
    } catch (e) {
      console.warn('[useSupplierOptions] listSupplier failed', e);
      supplierOptions.value = [];
    }
  }

  return { supplierOptions, loadSupplierOptions };
}
