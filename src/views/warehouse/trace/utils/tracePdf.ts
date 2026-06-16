/**
 * 追溯码批量打印 PDF 生成（TRC-ADMIN-001，K6）。
 *
 * 容器走 jsPDF（Kevin 已批，强约束 #8 例外，pnpm add jspdf）；中文渲染走 html2canvas
 * 把"码样式 DOM"光栅化为图片放进 PDF——jsPDF 内置字体不含中文，addFont 注入完整中文 TTF
 * 会让 bundle 暴增数 MB（动态文字无法子集化），prompt #14 批准 html2canvas 作字体注入受阻
 * 时的二选一：中文走浏览器原生字体光栅化，绝不乱码。QR 推 V3（本块只出文字样式页）。
 *
 * window.print() 仅作 html2canvas/jsPDF 运行时异常的兜底。
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { TraceCodeDetailVO } from '@/api/warehouse/trace/types';
import { buildTraceUrl, genQrDataUrl } from '@/views/trace/useTrace';

/** 一张码样式卡片的字段（文字版，参 doc/06 TRC-WATERMARK 字段 + 原型）。 */
interface CardField {
  label: string;
  value: string;
}

/** 码样式页 i18n 标签（由调用方注入，避免 util 依赖 vue-i18n 上下文）。 */
export interface TracePdfLabels {
  title: string;
  serialNo: string;
  produceCode: string;
  productName: string;
  productSpec: string;
  pigEarNo: string;
  plotName: string;
  farmName: string;
  storeName: string;
  harvestDate: string;
  /** 二维码下方提示文案（如「微信扫码查看全链路溯源」）。 */
  scanHint: string;
  fileName: string;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 10;

function dash(v: string | number | undefined | null): string {
  if (v === undefined || v === null || v === '') {
    return '-';
  }
  return String(v);
}

/** 构建一张码卡片的可见字段（空值的关联行省略，避免一堆 '-'）。 */
function buildFields(code: TraceCodeDetailVO, labels: TracePdfLabels): CardField[] {
  const fields: CardField[] = [
    { label: labels.produceCode, value: dash(code.produceCode) },
    { label: labels.productName, value: dash(code.productName) }
  ];
  if (code.productSpec) fields.push({ label: labels.productSpec, value: code.productSpec });
  if (code.pigEarNo) fields.push({ label: labels.pigEarNo, value: code.pigEarNo });
  if (code.plotName) fields.push({ label: labels.plotName, value: code.plotName });
  if (code.farmName) fields.push({ label: labels.farmName, value: code.farmName });
  if (code.storeName) fields.push({ label: labels.storeName, value: code.storeName });
  if (code.harvestDate) fields.push({ label: labels.harvestDate, value: code.harvestDate });
  return fields;
}

/** 渲染一张离屏码卡片 DOM（html2canvas 光栅化用，渲染后即移除）。 */
function renderCardElement(code: TraceCodeDetailVO, index: number, labels: TracePdfLabels, qrDataUrl: string): HTMLElement {
  const card = document.createElement('div');
  // 离屏但仍参与渲染（html2canvas 需元素可见尺寸）
  card.style.cssText = [
    'position:fixed',
    'left:-99999px',
    'top:0',
    'width:680px',
    'padding:28px 32px',
    'box-sizing:border-box',
    'background:#ffffff',
    'font-family:"PingFang SC","Microsoft YaHei","Helvetica Neue",Arial,sans-serif',
    'color:#1f2329'
  ].join(';');

  const fields = buildFields(code, labels);
  const rowsHtml = fields
    .map(
      (f) =>
        `<div style="display:flex;line-height:1.9;font-size:18px;border-bottom:1px dashed #e0e3e8;padding:4px 0;">
           <span style="width:120px;color:#646a73;flex-shrink:0;">${f.label}</span>
           <span style="flex:1;font-weight:500;word-break:break-all;">${f.value}</span>
         </div>`
    )
    .join('');

  // 溯源二维码：encode /trace/<type>/<code>，客户扫码进对应 H5 追溯页。无 QR 时降级不显示。
  const qrHtml = qrDataUrl
    ? `<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;margin-left:24px;">
         <img src="${qrDataUrl}" alt="QR" style="width:160px;height:160px;display:block;" />
         <span style="font-size:13px;color:#8a9099;margin-top:6px;">${labels.scanHint}</span>
       </div>`
    : '';

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;">
      <span style="font-size:22px;font-weight:700;">${labels.title}</span>
      <span style="font-size:16px;color:#8a9099;">${labels.serialNo} ${index + 1}</span>
    </div>
    <div style="display:flex;align-items:flex-start;">
      <div style="flex:1;min-width:0;">${rowsHtml}</div>
      ${qrHtml}
    </div>
  `;
  document.body.appendChild(card);
  return card;
}

/**
 * 批量出码：每张码占一页 A4，html2canvas 光栅化卡片 → jsPDF 等比贴入。
 *
 * @param codes 批量详情（后端已 JOIN product/store/plot/farm 组装展示字段）
 * @param labels i18n 标签（调用方从 t() 注入）
 */
export async function buildTracePdf(codes: TraceCodeDetailVO[], labels: TracePdfLabels): Promise<void> {
  if (!codes || codes.length === 0) {
    return;
  }
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const contentWidthMm = A4_WIDTH_MM - MARGIN_MM * 2;

  for (let i = 0; i < codes.length; i++) {
    // 每张码生成溯源二维码（encode /trace/<codeType>/<produceCode>）
    const qrDataUrl = await genQrDataUrl(buildTraceUrl(codes[i].codeType, codes[i].produceCode), 320);
    const el = renderCardElement(codes[i], i, labels, qrDataUrl);
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      // 等比缩放：宽度铺满内容区，高度按比例；超 A4 高度则裁到页内（卡片字段有限，通常远小于一页）
      const imgWidthMm = contentWidthMm;
      const imgHeightMm = (canvas.height / canvas.width) * imgWidthMm;
      const drawHeightMm = Math.min(imgHeightMm, A4_HEIGHT_MM - MARGIN_MM * 2);
      if (i > 0) {
        doc.addPage();
      }
      doc.addImage(imgData, 'PNG', MARGIN_MM, MARGIN_MM, imgWidthMm, drawHeightMm);
    } finally {
      document.body.removeChild(el);
    }
  }

  doc.save(labels.fileName);
}
