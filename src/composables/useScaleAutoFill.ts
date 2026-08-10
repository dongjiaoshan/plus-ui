import { computed, onActivated, onDeactivated, onMounted, onUnmounted, ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { useScaleWeight } from '@/composables/useScaleWeight';
import { useScaleConfigStore } from '@/store/modules/scaleConfig';

/**
 * 电子秤「自动填入」唯一口径（打包页称重录入共用；秤连接本身见 useScaleWeight）。
 *
 * **口径：自动填入打开时，录入框完全镜像秤当前推送的重量**（Kevin 2026-08-10）——
 * 放上去显示实重、取下来立刻回 0、加料减料实时跟随，晃动中也跟（稳不稳由状态条的「稳定/晃动」标示，
 * 不拿它拦显示）。要手输/改数就把「自动填入」关掉，这是唯一的手动闸。
 *
 * 三条边界：
 * - **零点死区**：|重量| < MIN_KG(5g) 一律读作 0，滤掉空秤噪声（否则「取下」显示成 2g 而不是 0）。
 * - **失联/秤异常(Code=0) 不改值**：只停止跟随，保留框里现有的值，不把手输值抹成 0。
 * - **同值不重复写**：镜像值与当前录入值相等就不 emit，避免每 300ms 一次无谓的表单更新。
 */

/** 零点死区（kg）：小于此值（含负数）一律读作 0 */
const MIN_KG = 0.005;

export interface UseScaleAutoFillOptions {
  /** 录入单位是否为克（肉品/果蔬打包=true，秤给 kg → ×1000 取整）；否则 kg 三位小数 */
  inGram: MaybeRefOrGetter<boolean>;
  /** 写回录入值（含空秤回 0） */
  onFill: (v: number) => void;
  /**
   * 取当前录入值。传了就按它做镜像 diff（真镜像：外部改了也会被秤下一帧纠回来）；
   * 不传则退化成与「本 composable 上次写入的值」比（调用方拿不到父级当前值时用）。
   */
  current?: () => number | undefined;
  /** 暂停自动填入（如提交中 / 该页当前不该跟随） */
  disabled?: MaybeRefOrGetter<boolean>;
}

export function useScaleAutoFill(opts: UseScaleAutoFillOptions) {
  const cfg = useScaleConfigStore();
  const scale = useScaleWeight();

  // 秤连接生命周期绑到 keep-alive 的激活/停用（打包页被缓存：切走 deactivate 不 unmount）。
  // 否则离开页面后 WS 不断连、每 1.5s 无限重连 + 后台持续轮询解析重量帧（资源泄漏 / 控制台喷错）。
  onMounted(scale.connect);
  onActivated(scale.connect);
  onDeactivated(scale.close);
  onUnmounted(scale.close);

  /** 秤读数 → 录入口径数值（含零点死区）；null（尚无帧）按 0 处理由调用方 gate 拦住 */
  const convert = (kg: number): number => {
    const eff = Math.abs(kg) < MIN_KG ? 0 : kg;
    return toValue(opts.inGram) ? Math.round(eff * 1000) : Number(eff.toFixed(3));
  };

  /** 秤当前读数按录入口径展示（未连接/无帧=null，由调用方显示占位） */
  const displayValue = computed<number | null>(() => (scale.weightKg.value === null ? null : convert(scale.weightKg.value)));

  /** 正在跟随（自动填入开 + 已连接 + 秤正常）——UI 用它区分「跟随中」和「已连接但没在跟」 */
  const following = computed<boolean>(() => cfg.autoFill && scale.connected.value && scale.code.value === 1 && !toValue(opts.disabled));

  const lastPushed = ref<number | null>(null);
  // ⚠️ watch 源里**必须**带上 `opts.current?.()` —— 它让「当前录入值」成为响应式依赖，
  // 于是外部把值改掉/清空（如选卡片时程序化置 undefined、提交后 reset）也会重新触发镜像纠回来。
  // 少了这一项就只在「秤读数变化」时才推：秤上放着东西读数恒定时，被清空的框永远填不回来
  // （2026-08-10 独立 QA 在 pickup 页实测复现：秤 20.5kg 稳定，点卡片后框空 5s 不回填）。
  // 不会死循环：回填后 `cur === v` 直接早退；本项目所有消费方都是把值原样赋给父级，不做变换。
  watch(
    () =>
      [
        scale.weightKg.value,
        scale.connected.value,
        scale.code.value,
        cfg.autoFill,
        toValue(opts.disabled),
        opts.current ? opts.current() : null
      ] as const,
    () => {
      if (!following.value) return;
      const kg = scale.weightKg.value;
      if (kg === null) return;
      const v = convert(kg);
      const cur = opts.current ? opts.current() : lastPushed.value;
      if (cur !== undefined && cur !== null && cur === v) return;
      opts.onFill(v);
      lastPushed.value = v;
    },
    { immediate: true }
  );

  return {
    connected: scale.connected,
    isSteady: scale.isSteady,
    weightKg: scale.weightKg,
    unitName: scale.unitName,
    code: scale.code,
    lastError: scale.lastError,
    zero: scale.zero,
    tare: scale.tare,
    displayValue,
    following,
    autoFill: computed<boolean>(() => cfg.autoFill)
  };
}
