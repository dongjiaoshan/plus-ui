import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';

/**
 * 电子秤本地配置（TSX-615 安卓一体秤 / ScaleAdapterTool 本机 5017 桥）。
 *
 * 每台设备各存本地（localStorage），互不影响：
 * - baseUrl：秤桥基址，设备浏览器访问本机环回（http→ws 由 useScaleWeight 推导）。
 * - scaleId：秤编号，单秤=0。
 * - autoFill：放稳后是否自动把重量填入输入框（默认开；关掉则仅手动「填入」）。
 *
 * 另有一份不落盘的「手改信号」（manualSeq / manualValue）：自动填入开着时工人在秤重量键盘上手改了重量，
 * 由 WeightNumpad 打点，useScaleAutoFill 据此暂停镜像，直到秤读数变化才再次覆盖（D-0149）。
 */
export const useScaleConfigStore = defineStore('scaleConfig', () => {
  const envBase = (import.meta.env as unknown as Record<string, string | undefined>).VITE_APP_SCALE_BASE;
  const baseUrl = useStorage<string>('djs-scale-base-url', envBase || 'http://127.0.0.1:5017');
  const scaleId = useStorage<string>('djs-scale-id', '0');
  const autoFill = useStorage<boolean>('djs-scale-auto-fill', true);

  /** 每次手改 +1；useScaleAutoFill 比对它判断「刚刚有人手改」 */
  const manualSeq = ref(0);
  /** 最近一次手改后的录入值（undefined = 手改成了空） */
  const manualValue = ref<number | undefined>(undefined);
  function markManualEdit(value: number | undefined): void {
    manualValue.value = value;
    manualSeq.value++;
  }

  return { baseUrl, scaleId, autoFill, manualSeq, manualValue, markManualEdit };
});
