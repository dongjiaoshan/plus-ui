/**
 * 需求单（门店订货单）打印（V7-R8）。
 *
 * 版式按甲方样张：标题「<门店>-订货单」→ 灰底信息条（订货日期 / 订货门店 / 订货品类总数）→
 * 明细表（序号 / 产品名称 / 产品规格 / 需求量 / 单位 / 备注 / 是否已备完货）。
 * 「是否已备完货」列打印为空，供仓库打印后在纸面上手工勾选登记（系统不回写）。
 *
 * 实现沿用毛菜间出库单 `vegOut/printSheet.ts` 的「隐藏 iframe + @page + cw.print()」骨架：
 * 文字保持矢量，不走 html2canvas 光栅化。纸张 A4 横向（`@page { size: A4 landscape }`）。
 *
 * 分页交给浏览器排版：产品多时自然换页，`thead { display: table-header-group }` 让表头每页重复，
 * `tr { break-inside: avoid }` 防止一行被拆到两页。标题与信息条只在首页出现（样张即单页形态）。
 */
import type { DemandPrintDetailVO } from '@/api/djs-warehouse/demandPrint';
import { formatOrderQuantity, formatQtyByUnit } from '@/utils/weight';

/** 打印页固定文案（由调用方从 i18n 取好传入，本文件不直接依赖 vue-i18n 实例）。 */
export interface DemandSheetLabels {
  titleSuffix: string;
  demandDate: string;
  storeName: string;
  categoryCount: string;
  seq: string;
  productName: string;
  productSpec: string;
  demandQuantity: string;
  unit: string;
  remark: string;
  prepared: string;
  /** 白条单位（与需求管理列表一致：白条按「头」展示） */
  unitHead: string;
}

/** 白条产品类别值（djs_belong_type）。 */
const BELONG_WHITE_BAR = 'white_bar';

/** 七列列宽（%），按样张比例：序号 / 产品名称 / 产品规格 / 需求量 / 单位 / 备注 / 是否已备完货。 */
const COL_WIDTHS = [7, 21, 18, 12, 9, 18, 15] as const;

const COLGROUP = `<colgroup>${COL_WIDTHS.map((w) => `<col style="width:${w}%" />`).join('')}</colgroup>`;

function esc(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function buildHtml(detail: DemandPrintDetailVO, labels: DemandSheetLabels): string {
  const storeName = detail.storeName ?? '';
  const rows = (detail.items ?? [])
    .map((it, i) => {
      const isWhiteBar = it.belongType === BELONG_WHITE_BAR;
      const unit = isWhiteBar ? labels.unitHead : (it.productUnit ?? '');
      const qty = isWhiteBar ? formatOrderQuantity(it.demandQuantity, it.productUnit, true) : formatQtyByUnit(it.demandQuantity, it.productUnit);
      return `<tr>
        <td>${i + 1}</td>
        <td class="name">${esc(it.productName)}</td>
        <td>${esc(it.productSpec)}</td>
        <td>${esc(qty)}</td>
        <td>${esc(unit)}</td>
        <td>${esc(it.demandRemark)}</td>
        <td></td>
      </tr>`;
    })
    .join('');

  return `<h1>${esc(storeName)}-${esc(labels.titleSuffix)}</h1>
    <div class="meta">
      <span><em>${esc(labels.demandDate)}：</em><b>${esc(detail.demandDate)}</b></span>
      <span><em>${esc(labels.storeName)}：</em><b>${esc(storeName)}</b></span>
      <span><em>${esc(labels.categoryCount)}：</em><b>${esc(detail.categoryCount)}</b></span>
    </div>
    <table>
      ${COLGROUP}
      <thead>
        <tr>
          <th>${esc(labels.seq)}</th>
          <th class="name">${esc(labels.productName)}</th>
          <th>${esc(labels.productSpec)}</th>
          <th>${esc(labels.demandQuantity)}</th>
          <th>${esc(labels.unit)}</th>
          <th>${esc(labels.remark)}</th>
          <th>${esc(labels.prepared)}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

const STYLE = `
@page { size: A4 landscape; margin: 10mm; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; font-family: "Microsoft YaHei", "PingFang SC", sans-serif; color: #333;
             -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1 { margin: 0 0 5mm; font-size: 6mm; text-align: center; font-weight: 700; letter-spacing: 0.3mm; }
/* 信息条三段等分、各段居中（样张：日期 / 门店 / 品类总数横向均布） */
.meta { display: grid; grid-template-columns: repeat(3, 1fr); background: #f5f7fa; border-radius: 1.5mm;
        padding: 3mm 0; margin-bottom: 5mm; font-size: 3.6mm; text-align: center; }
.meta em { font-style: normal; color: #666; }
.meta b { font-size: 4.2mm; color: #222; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 3.4mm; }
/* 表头每页重复 + 行不跨页拆开 */
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
th, td { border: 0.25mm solid #ccc; height: 8.5mm; padding: 0 2mm; text-align: center; word-break: break-all; }
th { background: #f5f7fa; font-weight: 700; color: #222; }
/* 样张产品名称列左对齐，其余居中 */
th.name, td.name { text-align: left; }
`;

/**
 * 打印一张门店订货单。
 *
 * iframe 必须真实挂进文档（不能 display:none，否则部分浏览器不渲染内容），打印完成后延时移除。
 */
export function printDemandSheet(detail: DemandPrintDetailVO, labels: DemandSheetLabels): void {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const cw = iframe.contentWindow;
  if (!cw) {
    iframe.remove();
    return;
  }
  const title = `${detail.storeName ?? ''}-${labels.titleSuffix}`;
  const doc = cw.document;
  doc.open();
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${STYLE}</style></head><body>${buildHtml(detail, labels)}</body></html>`
  );
  doc.close();
  // 等排版完成再唤起打印；浏览器以 --kiosk-printing 启动时 print() 静默送默认打印机，否则弹系统框
  cw.setTimeout(() => {
    cw.focus();
    cw.print();
    window.setTimeout(() => iframe.remove(), 1000);
  }, 200);
}
