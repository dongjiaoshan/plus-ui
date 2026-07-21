import { computed, ref, watch } from 'vue';
import { useWebSocket } from '@vueuse/core';
import { useScaleConfigStore } from '@/store/modules/scaleConfig';

/**
 * 秤桥推送/返回的重量帧（顶尖 OS2 协议）。
 * - Code：0=秤异常 / 1=成功（与其他接口 0=失败相反）。
 * - IsSteady：0=晃动 / 1=稳定。
 * - Weight / TareWeight：kg（后端 Decimal 序列化可能是字符串，统一 Number 强转）。
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
 * - WS `ws://<base>/weight` 持续推重量帧；`status==='OPEN'` 即 connected。
 * - `zero()/tare()` 走**裸 fetch** 打 `<base>/api/Zero|Tare`（**不走 utils/request.ts 的 service**，
 *   避免注入 token / Current-Store-Id 等业务头——秤桥是本机第三方服务）。
 * - 连不上**不抛异常**，只置 connected=false / lastError；组件卸载自动断连（useWebSocket 默认行为）。
 *
 * 返回的都是 ref，调用方按 `const { connected, weightKg, ... } = useScaleWeight()` 解构（模板自动解包）。
 */
export function useScaleWeight() {
  const cfg = useScaleConfigStore();
  const wsUrl = computed(() => cfg.baseUrl.replace(/\/+$/, '').replace(/^http/i, 'ws') + '/weight');

  const weightKg = ref<number | null>(null);
  const tareWeightKg = ref<number | null>(null);
  const isSteady = ref<boolean>(false);
  const unitName = ref<string | null>(null);
  const code = ref<number | null>(null);
  const lastError = ref<string>('');

  const { status, data, open, close } = useWebSocket(wsUrl, {
    immediate: false,
    autoReconnect: { retries: () => true, delay: 1500 }
  });

  const connected = computed<boolean>(() => status.value === 'OPEN');

  // 幂等连接：已连 / 连接中不重复 open。供组件在 onMounted/onActivated 调用——
  // 肉品打包页被 keep-alive 缓存，切走 deactivate、切回 activate，靠此配对 connect/close，
  // 避免离开页面后 WS 每 1.5s 无限重连 + 后台持续解析重量帧（资源泄漏）。
  const connect = (): void => {
    if (status.value !== 'OPEN' && status.value !== 'CONNECTING') open();
  };

  watch(data, (raw) => {
    if (typeof raw !== 'string' || raw.length === 0) return;
    let frame: ScaleWeightFrame;
    try {
      frame = JSON.parse(raw) as ScaleWeightFrame;
    } catch {
      // 跳过单个坏帧（秤桥持续推送，下一帧自恢复）；不把非 i18n 文案塞进 UI
      return;
    }
    code.value = toNum(frame.Code);
    isSteady.value = toNum(frame.IsSteady) === 1;
    weightKg.value = toNum(frame.Weight);
    tareWeightKg.value = toNum(frame.TareWeight);
    unitName.value = frame.UnitName ?? null;
    // 仅透传设备返回的 Message（不塞中文兜底；i18n 兜底在组件里做）
    lastError.value = code.value === 0 ? frame.Message || '' : '';
  });

  const post = async (action: 'Zero' | 'Tare'): Promise<{ ok: boolean; message: string }> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const base = cfg.baseUrl.replace(/\/+$/, '');
      const res = await fetch(`${base}/api/${action}?scaleId=${encodeURIComponent(cfg.scaleId)}`, {
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
