import { computed, onActivated, onMounted, ref, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { listTareOptions, type TareOption, type TarePosition } from '@/api/djs-warehouse/tareSpec';

/**
 * 称重页去皮（V7-R4，口径 D-0147 fallback）：
 * - 只列配置到本页（可选位置含 position）的规格；实际默认项（多个默认取更新时间最近）排第一并预选。
 * - 重量框仍是「称重」（秤读数或手输），扣皮后的实重 = 称重 − 去皮，提交与校验一律用实重。
 * - 本页没配任何规格时整块不显示，实重 = 称重，页面行为与之前一致。
 * 单位 kg（六个去皮页录入都是 kg 三位小数）。
 */
export function useTare(position: TarePosition, gross: MaybeRefOrGetter<number | undefined>) {
  const options = ref<TareOption[]>([]);
  /** '' = 不去皮 */
  const selectedId = ref('');
  const loadFailed = ref(false);

  async function load() {
    try {
      const { data } = await listTareOptions(position);
      options.value = data;
      loadFailed.value = false;
      if (!data.some((o) => o.id === selectedId.value)) selectedId.value = data.find((o) => o.selected)?.id ?? '';
    } catch {
      // request.ts 已提示错误；规格取不到时按不去皮，不挡称重提交。
      options.value = [];
      selectedId.value = '';
      loadFailed.value = true;
    }
  }
  onMounted(load);
  onActivated(load);

  const selected = computed(() => options.value.find((o) => o.id === selectedId.value));
  const tareKg = computed<number>(() => Number(selected.value?.tareWeight ?? 0));
  const grossKg = computed<number | undefined>(() => {
    const v = toValue(gross);
    return v == null || !Number.isFinite(v) ? undefined : Number(v);
  });
  /** 实重 kg（三位小数，整数毫克运算防浮点尾差） */
  const net = computed<number | undefined>(() =>
    grossKg.value === undefined ? undefined : (Math.round(grossKg.value * 1000) - Math.round(tareKg.value * 1000)) / 1000
  );

  /** 选规格；'' = 不去皮 */
  function select(id: string) {
    selectedId.value = id;
  }

  return { options, selectedId, selected, tareKg, grossKg, net, loadFailed, load, select };
}

export type TareState = ReturnType<typeof useTare>;
