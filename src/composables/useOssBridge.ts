import { computed, type Ref, type WritableComputedRef } from 'vue';

/**
 * OssUpload v-model 桥接（D9 closing Group B / _open-issues #13）。
 *
 * OssUpload 组件期望 v-model 类型 `number[]`，但业务 BO 字段是 string
 * （单 id：`"123"`；多 id：`"123,456,789"`），需要双向转换。
 *
 * 本 composable 把 6+ Form 各自手写的 `computed<number[]>({ get, set })` 桥接代码
 * 收敛成一行调用。
 *
 * 用法：
 * ```ts
 * const form = ref<PlotInfoForm>(defaultForm());
 * const thumbOssIds = useOssBridge(form, 'plotImagePreview', 'single');
 * const imgOssIds = useOssBridge(form, 'plotImageUrl', 'multi');
 * // template: <OssUpload v-model="thumbOssIds" />
 * ```
 *
 * @param modelRef form 的 Ref（推荐）或对象本体（直接传 ref.value 也行）
 * @param key 字段名（业务 BO 上的 string 字段，类型必须能赋 string | undefined）
 * @param mode 'single' = 单 id（字符串无逗号）/ 'multi' = 多 id（逗号分隔）
 * @returns WritableComputedRef<number[]>，直接给 v-model
 */
export function useOssBridge<T extends Record<string, unknown>>(
  modelRef: Ref<T> | T,
  key: keyof T,
  mode: 'single' | 'multi' = 'multi'
): WritableComputedRef<number[]> {
  return computed<number[]>({
    get() {
      const m = (isRef(modelRef) ? modelRef.value : modelRef) as T;
      const raw = m[key] as string | undefined | null;
      if (!raw) return [];
      if (mode === 'single') {
        const n = Number(raw);
        return Number.isNaN(n) ? [] : [n];
      }
      return String(raw)
        .split(',')
        .filter(Boolean)
        .map((x) => Number(x))
        .filter((x) => !Number.isNaN(x));
    },
    set(arr) {
      const m = (isRef(modelRef) ? modelRef.value : modelRef) as T;
      const safe = Array.isArray(arr) ? arr : [];
      const str = mode === 'single' ? (safe[0] != null ? String(safe[0]) : undefined) : safe.length > 0 ? safe.join(',') : undefined;
      (m as Record<keyof T, unknown>)[key] = str;
    }
  });
}

function isRef<U>(v: Ref<U> | U): v is Ref<U> {
  return !!v && typeof v === 'object' && 'value' in (v as object);
}
