/**
 * 公开追溯 H5 共享逻辑：取数 + 二维码 URL 构造。
 */
import QRCode from 'qrcode';
import { getPublicTrace } from '@/api/trace';
import type { PublicTraceVo } from '@/api/trace/types';

/**
 * 构造追溯 H5 落地 URL（二维码 encode 目标）。
 * admin 域名按环境派生对应 trace 域名（admin(-staging).dongjiaoshan.com → trace(-staging).dongjiaoshan.com），
 * 使 staging admin 生成的码落到 trace-staging、prod admin 落到 trace，无需分环境打包。
 * 其它 host（本地开发等）回退 VITE_APP_TRACE_BASE 或 location.origin。
 */
export function buildTraceUrl(type: string, code: string): string {
  const host = window.location.hostname;
  const base = host.startsWith('admin')
    ? `${window.location.protocol}//${host.replace(/^admin/, 'trace')}`
    : (import.meta.env.VITE_APP_TRACE_BASE as string) || window.location.origin;
  return `${base.replace(/\/$/, '')}/trace/${type}/${code}`;
}

/** 生成二维码 dataURL（PNG base64），失败返空串。 */
export async function genQrDataUrl(url: string, size = 160): Promise<string> {
  try {
    return await QRCode.toDataURL(url, { width: size, margin: 1, errorCorrectionLevel: 'M' });
  } catch {
    return '';
  }
}

export interface TraceLoadResult {
  data: PublicTraceVo | null;
  /** 错误 i18n key 后缀（state.*）；无错为空串 */
  errorKey: string;
}

/** 按 produce_code 拉公开追溯聚合（@SaIgnore，无 token）。 */
export async function loadTrace(code: string): Promise<TraceLoadResult> {
  if (!code) {
    return { data: null, errorKey: 'missingCode' };
  }
  try {
    const res = await getPublicTrace(code);
    const data = (res as unknown as { data?: PublicTraceVo }).data ?? null;
    if (!data) {
      return { data: null, errorKey: 'notFound' };
    }
    return { data, errorKey: '' };
  } catch {
    return { data: null, errorKey: 'loadFailed' };
  }
}
