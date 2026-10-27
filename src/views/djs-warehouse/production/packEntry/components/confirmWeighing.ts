import { h } from 'vue';
import { ElMessageBox } from 'element-plus';
import i18n from '@/lang/index';

export interface WeighingConfirm {
  /** 按钮是入库还是出库：决定弹框标题与提问 */
  direction: 'in' | 'out';
  /** kg */
  gross: number;
  /** kg，未去皮传 0 */
  tare: number;
  /** kg */
  net: number;
  /** 去向文案（如「白条库」「门店：XX店」「仓库出库：XX」） */
  destination: string;
  /** 去向行标签，缺省入库=「去向」/ 出库=「出库去向」 */
  destinationLabel?: string;
  /** 去向之后追加的行（如果蔬入库的采摘班组、绩效百分比） */
  extraRows?: { label: string; value: string }[];
}

/**
 * 出入库二次确认（V7-R5）：标题按按钮为「入库 / 出库」，突出显示称重 / 去皮 / 实际重量 / 去向，
 * 再点确定才提交。取消 → reject（调用方 catch 后不提交）。
 * 弹框尺寸与居中大按钮走全局样式 `.weigh-confirm-box`（assets/styles/element-ui.scss）。
 */
export function confirmWeighing(c: WeighingConfirm): Promise<unknown> {
  const t = i18n.global.t;
  const kg = (v: number) => `${Number(v).toFixed(3)} Kg`;
  const row = (label: string, value: string, strong = false) =>
    h('div', { style: 'display:flex;justify-content:space-between;gap:16px;padding:6px 0;font-size:18px' }, [
      h('span', { style: 'color:var(--el-text-color-secondary)' }, label),
      h('strong', { style: `font-size:${strong ? 24 : 19}px;color:${strong ? 'var(--el-color-primary)' : 'var(--el-text-color-primary)'}` }, value)
    ]);
  const message = h('div', { style: 'width:100%' }, [
    row(t('tareSpec.station.grossWeight'), kg(c.gross)),
    row(t('tareSpec.station.tareWeightLabel'), kg(c.tare)),
    row(t('tareSpec.station.netWeight'), kg(c.net), true),
    row(
      c.destinationLabel || (c.direction === 'in' ? t('tareSpec.station.destination') : t('tareSpec.station.outDestination')),
      c.destination || '—'
    ),
    ...(c.extraRows ?? []).map((r) => row(r.label, r.value || '—')),
    h(
      'p',
      { style: 'margin:16px 0 0;font-size:18px;font-weight:600;text-align:center' },
      c.direction === 'in' ? t('tareSpec.station.askIn') : t('tareSpec.station.askOut')
    )
  ]);
  return ElMessageBox.confirm(message, c.direction === 'in' ? t('tareSpec.station.confirmIn') : t('tareSpec.station.confirmOut'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    customClass: 'weigh-confirm-box',
    confirmButtonClass: 'weigh-confirm-btn',
    cancelButtonClass: 'weigh-confirm-btn',
    distinguishCancelAndClose: false
  });
}
