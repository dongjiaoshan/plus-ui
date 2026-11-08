import { computed, onActivated, onMounted, ref, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { useI18n } from 'vue-i18n';
import { listTareOptions, type TareOption, type TarePosition } from '@/api/djs-warehouse/tareSpec';

/**
 * 称重页去皮（V7-R4，口径 D-0147 / D-0158）：
 * - 只列配置到本页（可选位置含 position）的规格；实际默认项（多个默认取更新时间最近）排第一并预选。
 * - 录入（秤自动填入 / 键盘手输）的仍是「称重」（秤读数），实重 = 称重 − 去皮，提交与校验一律用实重。
 * - 选了去皮规格时重量大框改显示实重，下方小字给称重与去皮（numpadProps 绑到 WeightNumpad）；
 *   提交时除实重外另存称重与皮重（weighPayload）。
 * - 本页没配任何规格 / 选「不去皮」时大框照常显示称重，实重 = 称重，页面行为与之前一致。
 * 单位 kg（六个去皮页录入都是 kg 三位小数）。
 */
export function useTare(position: TarePosition, gross: MaybeRefOrGetter<number | undefined>) {
  const { t } = useI18n();
  const options = ref<TareOption[]>([]);
  /** '' = 不去皮 */
  const selectedId = ref('');
  const cumulativeEnabled = ['pig_in', 'cut_out', 'veg_out', 'veg_in'].includes(position);
  const mode = ref<'fixed' | 'cumulative'>('fixed');
  const cumulativeKg = ref(0);
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
  const tareKg = computed<number>(() => (mode.value === 'cumulative' ? cumulativeKg.value : Number(selected.value?.tareWeight ?? 0)));
  const grossKg = computed<number | undefined>(() => {
    const v = toValue(gross);
    return v == null || !Number.isFinite(v) ? undefined : Number(v);
  });
  /** 实重 kg（三位小数，整数毫克运算防浮点尾差） */
  const net = computed<number | undefined>(() =>
    grossKg.value === undefined ? undefined : (Math.round(grossKg.value * 1000) - Math.round(tareKg.value * 1000)) / 1000
  );

  /** 切换模式从零开始累计，固定规格仍沿用已有选择。 */
  function setMode(value: 'fixed' | 'cumulative') {
    if (value === 'cumulative' && !cumulativeEnabled) return;
    mode.value = value;
    cumulativeKg.value = 0;
  }

  /** 当前总称重成为新的零点；不能重复累加总读数，否则第二次去皮会扣重两次。 */
  function captureTare() {
    if (mode.value !== 'cumulative' || grossKg.value == null || grossKg.value < 0) return;
    cumulativeKg.value = Math.round(grossKg.value * 1000) / 1000;
  }

  function restoreTare() {
    cumulativeKg.value = 0;
  }

  /** 选规格；'' = 不去皮 */
  function select(id: string) {
    selectedId.value = id;
  }

  /** 绑到 WeightNumpad（v-bind）：选了规格 → 大框显示实重 + 小字「称重：x，去皮：y」；否则空对象，大框照旧 */
  const numpadProps = computed<{ displayValue?: number; displayLabel?: string; displayHint?: string; emphasize?: boolean }>(() => {
    if (mode.value === 'fixed' && !selected.value) return { emphasize: cumulativeEnabled };
    return {
      emphasize: cumulativeEnabled,
      displayValue: net.value,
      displayLabel: t('tareSpec.station.net'),
      displayHint: `${t('tareSpec.station.gross')}：${kgText(grossKg.value)}，${t('tareSpec.station.tareWeight')}：${kgText(tareKg.value)}`
    };
  });

  /** 提交时另存的称重 / 皮重（kg 三位小数字符串；不去皮皮重 = "0.000"）。调用方已保证称重有值 */
  function weighPayload(): { grossWeight: string; tareWeight: string } {
    // 与 net 同口径按整数克（千分位）取整，保证 grossWeight − tareWeight 与提交的实重逐位相等
    const milli = (v: number) => (Math.round(v * 1000) / 1000).toFixed(3);
    return { grossWeight: milli(grossKg.value ?? 0), tareWeight: milli(tareKg.value) };
  }

  return {
    options,
    selectedId,
    selected,
    tareKg,
    grossKg,
    net,
    loadFailed,
    load,
    select,
    numpadProps,
    weighPayload,
    cumulativeEnabled,
    mode,
    setMode,
    captureTare,
    restoreTare
  };
}

export type TareState = ReturnType<typeof useTare>;

function kgText(v: number | undefined): string {
  return v == null ? '—' : `${Number(v).toFixed(3)}Kg`;
}
