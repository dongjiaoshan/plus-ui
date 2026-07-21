import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

/**
 * 电子秤本地配置（TSX-615 安卓一体秤 / ScaleAdapterTool 本机 5017 桥）。
 *
 * 每台设备各存本地（localStorage），互不影响：
 * - baseUrl：秤桥基址，设备浏览器访问本机环回（http→ws 由 useScaleWeight 推导）。
 * - scaleId：秤编号，单秤=0。
 * - autoFill：放稳后是否自动把重量填入输入框（默认开；关掉则仅手动「填入」）。
 */
export const useScaleConfigStore = defineStore('scaleConfig', () => {
  const envBase = (import.meta.env as unknown as Record<string, string | undefined>).VITE_APP_SCALE_BASE;
  const baseUrl = useStorage<string>('djs-scale-base-url', envBase || 'http://127.0.0.1:5017');
  const scaleId = useStorage<string>('djs-scale-id', '0');
  const autoFill = useStorage<boolean>('djs-scale-auto-fill', true);

  return { baseUrl, scaleId, autoFill };
});
