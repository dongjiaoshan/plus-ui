import { computed, ref, watch } from 'vue';
import { useIntervalFn, useWebSocket } from '@vueuse/core';
import { useScaleConfigStore } from '@/store/modules/scaleConfig';

/**
 * 秤桥返回/推送的重量帧（顶尖 OS2 协议；真机实测多带 PrinterStatus 等额外字段，解析只取需要的）。
 * - Code：0=秤异常 / 1=成功（与其他接口 0=失败相反）。
 * - IsSteady：0=晃动 / 1=稳定。
 * - Weight / TareWeight：kg（可能序列化成字符串，统一 Number 强转）。
 */
interface ScaleWeightFrame {
  IsSteady?: number | string | null;
  Weight?: number | string | null;
  TareWeight?: number | string | null;
  UnitName?: string | null;
  Code?: number | string | null;
  Message?: string;
}

const toNum = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? null : n;
};

/**
 * 读电子秤重量（TSX-615 安卓一体秤上的 ScaleAdapterTool，本机 127.0.0.1:5017）。
 *
 * 双通道取数（真机实测：部分固件 WS `/weight` 能握手但不推帧，只有 GET 稳定返数）：
 * - **主：轮询 `GET /api/Weight`**（已在真机验证可用；需秤桥开 CORS 才能跨源读取）。
 * - **辅：WebSocket `/weight`**（无 CORS 限制；能推就用，帧按 string/Blob/ArrayBuffer 都解）。
 * 任一通道拿到有效帧即刷新，`connected` 以"近 2s 是否收到帧"为准（比裸 socket 状态更真实）。
 *
 * - `zero()/tare()` 走裸 fetch 打 `api/Zero|Tare`（不走 request.ts 的 service，避免注入业务头）。
 * - `connect()/close()` 幂等启停两通道，供组件 onActivated/onDeactivated 配对（肉品打包页被 keep-alive 缓存）。
 * - 连不上不抛异常，只置 connected=false / lastError。
 */
export function useScaleWeight() {
  const cfg = useScaleConfigStore();
  const httpBase = computed(() => cfg.baseUrl.replace(/\/+$/, ''));
  const wsUrl = computed(() => httpBase.value.replace(/^http/i, 'ws') + '/weight');

  const weightKg = ref<number | null>(null);
  const tareWeightKg = ref<number | null>(null);
  const isSteady = ref<boolean>(false);
  const unitName = ref<string | null>(null);
  const code = ref<number | null>(null);
  const lastError = ref<string>('');
  const connected = ref<boolean>(false);

  // 数据新鲜度：任一通道拿到有效帧即置 connected=true 并重置 2s 计时；超 2s 无帧判失联。
  let staleTimer: ReturnType<typeof setTimeout> | null = null;
  const clearStale = (): void => {
    if (staleTimer) {
      clearTimeout(staleTimer);
      staleTimer = null;
    }
  };
  const applyFrame = (frame: ScaleWeightFrame): void => {
    code.value = toNum(frame.Code);
    isSteady.value = toNum(frame.IsSteady) === 1;
    weightKg.value = toNum(frame.Weight);
    tareWeightKg.value = toNum(frame.TareWeight);
    unitName.value = frame.UnitName ?? null;
    // 仅透传设备返回的 Message（不塞中文兜底；i18n 兜底在组件里做）
    lastError.value = code.value === 0 ? frame.Message || '' : '';
    connected.value = true;
    clearStale();
    staleTimer = setTimeout(() => {
      connected.value = false;
    }, 2000);
  };
  const tryApply = (s: string): void => {
    if (!s) return;
    try {
      applyFrame(JSON.parse(s) as ScaleWeightFrame);
    } catch {
      // 跳过单个坏帧（下一帧自恢复）；不把非 i18n 文案塞进 UI
    }
  };

  // 连不上时的退避（Kevin 2026-08-10）：没有秤桥的机器（如 Kevin 的 Mac 开 staging 页）原先是
  // 300ms 轮询 + 1.5s WS 无限重连 —— 每分钟约 200 个失败请求刷满 Network 面板和控制台。
  // 改成：连续失败满 DEGRADE_AFTER_MS 就把轮询降到慢档，收到任一有效帧立刻回快档。
  // 不做「彻底停止」是因为秤上 ScaleAdapterTool 可能比浏览器起得晚、或中途重启，
  // 停死了工人就得手动点重试；慢档 10s 一次既把噪声降到 1/33，又能自愈。
  const POLL_FAST_MS = 300;
  const POLL_SLOW_MS = 10_000;
  const DEGRADE_AFTER_MS = 30_000;
  const pollMs = ref<number>(POLL_FAST_MS);
  /** 第一次连续失败的时刻（成功即清空）；null = 当前不处于失败串 */
  let firstFailureAt: number | null = null;

  // —— 通道 1：WebSocket 推送（无 CORS 限制；帧可能是 text / Blob / ArrayBuffer，全解一遍）——
  // retries 有限：秤桥不在时无限重连同样是噪声源。轮询恢复（收到有效帧）时会重新 open 一次。
  const {
    data,
    open: wsOpen,
    close: wsClose
  } = useWebSocket(wsUrl, {
    immediate: false,
    autoReconnect: { retries: 3, delay: 1500 }
  });
  watch(data, (raw) => {
    if (typeof raw === 'string') tryApply(raw);
    else if (raw instanceof Blob) void raw.text().then(tryApply);
    else if (raw instanceof ArrayBuffer) tryApply(new TextDecoder().decode(raw));
  });

  // —— 通道 2：轮询 GET /api/Weight（主通道，真机已验证可用）——
  let inFlight = false;
  const pollOnce = async (): Promise<void> => {
    if (inFlight) return;
    inFlight = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1000);
    try {
      const res = await fetch(`${httpBase.value}/api/Weight?scaleId=${encodeURIComponent(cfg.scaleId)}`, { signal: ctrl.signal });
      applyFrame((await res.json()) as ScaleWeightFrame);
      // 恢复：回快档；若之前退避过，顺手把 WS 也重新拉起来（它的 retries 可能已经用尽）
      firstFailureAt = null;
      if (pollMs.value !== POLL_FAST_MS) {
        pollMs.value = POLL_FAST_MS;
        wsOpen();
      }
    } catch {
      // 本次拉取失败（网络/CORS/超时），等下次；失联由 staleTimer 收敛为 connected=false。
      // 连续失败超过 DEGRADE_AFTER_MS → 降到慢档，别再每 300ms 刷一条失败请求。
      if (firstFailureAt === null) firstFailureAt = Date.now();
      else if (Date.now() - firstFailureAt >= DEGRADE_AFTER_MS) pollMs.value = POLL_SLOW_MS;
    } finally {
      clearTimeout(timer);
      inFlight = false;
    }
  };
  // interval 传 ref：VueUse 会在值变化时按新周期重启定时器（快档 ↔ 慢档切换靠它）
  const { pause: pollPause, resume: pollResume, isActive: pollActive } = useIntervalFn(pollOnce, pollMs, { immediate: false });

  const connect = (): void => {
    // 每次进页面（onMounted / keep-alive onActivated）都从快档重来：上一轮退避的状态不带过来，
    // 否则切走时秤没插、切回来插好了却要等 10s 才发现。
    firstFailureAt = null;
    pollMs.value = POLL_FAST_MS;
    wsOpen();
    if (!pollActive.value) pollResume();
    void pollOnce(); // 立即拉一次，首帧不等 300ms
  };
  const close = (): void => {
    wsClose();
    pollPause();
    clearStale();
    connected.value = false;
  };

  const post = async (action: 'Zero' | 'Tare'): Promise<{ ok: boolean; message: string }> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch(`${httpBase.value}/api/${action}?scaleId=${encodeURIComponent(cfg.scaleId)}`, {
        method: 'POST',
        signal: ctrl.signal
      });
      const json = (await res.json()) as { Code?: number | string | null; Message?: string };
      return { ok: toNum(json.Code) === 1, message: json.Message ?? '' };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : String(e) };
    } finally {
      clearTimeout(timer);
    }
  };

  return {
    connected,
    weightKg,
    tareWeightKg,
    isSteady,
    unitName,
    code,
    lastError,
    connect,
    close,
    zero: () => post('Zero'),
    tare: () => post('Tare')
  };
}
