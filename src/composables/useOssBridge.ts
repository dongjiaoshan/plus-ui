import { computed, type Ref, type WritableComputedRef } from 'vue';

/**
 * OssUpload v-model 桥接（D9 closing Group B / _open-issues #13）。
 *
 * OssUpload 组件 v-model 类型 `string[]`，业务 BO 字段也是 string
 * （单 id：`"123"`；多 id：`"123,456,789"`），需要在「逗号分隔 string ↔ string[]」之间双向转换。
 *
 * ossId 是 19 位雪花（> 2^53），全链路保持 string，**禁 Number()**（coder-djs-cross-layer-contract 契约 1）——
 * 转 number 会末位截断，提交写坏 ossId，再编辑反查不到图，关联丢失。
 *
 * 本 composable 把 6+ Form 各自手写的 `computed<string[]>({ get, set })` 桥接代码
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
 * @returns WritableComputedRef<string[]>，直接给 v-model
 */
export function useOssBridge<T extends Record<string, unknown>>(
  modelRef: Ref<T> | T,
  key: keyof T,
  mode: 'single' | 'multi' = 'multi'
): WritableComputedRef<string[]> {
  return computed<string[]>({
    get() {
      const m = (isRef(modelRef) ? modelRef.value : modelRef) as T;
      const raw = m[key] as string | undefined | null;
      if (!raw) return [];
      if (mode === 'single') {
        return [String(raw)];
      }
      return String(raw).split(',').filter(Boolean);
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
