/**
 * 毛菜间出库单打印（admin row196）。
 *
 * 纸张 241×140mm 三联码单（针式连续纸），版式按甲方提供的模板图 1:1 还原。
 *
 * <p><b>为什么不走 html2canvas</b>：项目里追溯码贴纸（TraceLabelDialog）是先光栅化成 PNG 再打的，
 * 那是因为 30mm 小贴纸要保中文渲染。本单是 241×140mm 的表格式单据，`scale:2` 光栅化后约
 * 3800×2200px，文字在针式/激光打印机上会发虚。故直接把 HTML 写进隐藏 iframe，
 * 文字保持矢量、清晰可读；仍复用那套「隐藏 iframe + @page + cw.print()」骨架
 * （含 --kiosk-printing 静默打印兼容）。</p>
 *
 * <p><b>分页</b>（Kevin D6）：模板表格是固定 8 个数据行 + 合计行。超过 8 行自动分页，
 * 每页重复表头与单号，合计出现在**每页末尾**（本页小计）与**最后一页**（总合计）。</p>
 */

/** 打印单一行。 */
export interface VegOutPrintRow {
  productName: string;
  productSpec?: string;
  productUnit?: string;
  /** 出库量（打印时按甲方要求不显示小数） */
  quantity: number;
  /** 销售单价 */
  unitPrice: number;
}

export interface VegOutPrintPayload {
  /** 出库单号（7 位数字） */
  batchNo: string;
  /** 出货日期（yyyy-MM-dd） */
  outDate: string;
  /** 客户名称（= 出库去向的中文label） */
  customerName: string;
  rows: VegOutPrintRow[];
}

/** 公司抬头，甲方指定固定文案。 */
const COMPANY_NAME = '鑫东生态农业有限公司';

/** 模板表格固定 8 个数据行。 */
const ROWS_PER_PAGE = 8;

function esc(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** 出库量打印不显示小数（甲方原文「出库量：显示出库重量，不显示小数」）。 */
function qtyText(v: number): string {
  return String(Math.round(Number(v) || 0));
}

function money(v: number): string {
  const n = Number(v) || 0;
  return n.toFixed(2);
}

function buildPage(payload: VegOutPrintPayload, pageRows: VegOutPrintRow[], pageNo: number, pageCount: number, allRows: VegOutPrintRow[]): string {
  // 不足 8 行补空行，保持表格高度与模板一致（针式纸走纸位置固定）
  const padded: (VegOutPrintRow | null)[] = [...pageRows];
  while (padded.length < ROWS_PER_PAGE) padded.push(null);

  const body = padded
    .map((r, i) => {
      if (!r) return `<tr><td>${i + 1}</td><td></td><td></td><td></td><td></td><td></td></tr>`;
      const name = r.productSpec ? `${r.productName} ${r.productSpec}` : r.productName;
      return `<tr>
        <td>${i + 1}</td>
        <td class="l">${esc(name)}</td>
        <td>${esc(r.productUnit || '')}</td>
        <td>${qtyText(r.quantity)}</td>
        <td>${money(r.unitPrice)}</td>
        <td>${money(r.quantity * r.unitPrice)}</td>
      </tr>`;
    })
    .join('');

  // 合计只合出库量与总金额（甲方原文第 8 点）。
  // ⚠️ 末页标「总合计」就必须真的是**全部行**的合计，不能只算末页那几行（否则单据上
  // 「总合计」比各页小计还小，客户一加就发现对不上）。
  const isGrandTotal = pageCount === 1 || pageNo === pageCount;
  const sumRows = isGrandTotal ? allRows : pageRows;
  // 出库量按甲方要求取整打印，**但金额必须用真实量算**：这张三联单是财务凭证，
  // 金额要跟系统里的「出库金额」对得上。用取整量算的话 2.5kg×¥12.50 会印成 ¥37.50，
  // 而系统记的是 ¥31.25 —— 单据和账目对不上比「拿计算器按不整除」严重得多。
  // 代价是整数列 × 单价 ≠ 打印金额，甲方看样张时需要知道这一点。
  const sumQty = sumRows.reduce((s, r) => s + Math.round(Number(r.quantity) || 0), 0);
  const sumAmount = sumRows.reduce((s, r) => s + (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0), 0);
  const totalLabel = pageCount > 1 ? (pageNo === pageCount ? '总合计' : '本页小计') : '合计';

  return `<section class="sheet">
    <div class="main">
      <h1>${esc(COMPANY_NAME)}</h1>
      <h2>销售出货单</h2>
      <div class="meta">
        <span>客户名称：${esc(payload.customerName)}</span>
        <span class="right">
          出库单号：${esc(payload.batchNo)}<br />出货日期：${esc(payload.outDate)}
          ${pageCount > 1 ? `<br />第 ${pageNo} / ${pageCount} 页` : ''}
        </span>
      </div>
      <table>
        <thead>
          <tr><th>序号</th><th>产品及规格</th><th>单位</th><th>出库量</th><th>单价</th><th>总金额</th></tr>
        </thead>
        <tbody>
          ${body}
          <tr class="total"><td colspan="3">${totalLabel}</td><td>${qtyText(sumQty)}</td><td></td><td>${money(sumAmount)}</td></tr>
        </tbody>
      </table>
      <div class="sign">
        <span>收货单位及经手人（盖章）</span>
        <span>送货单位及经手人（盖章）</span>
      </div>
    </div>
    <!-- 三联纸右侧竖排联次标识（Kevin D5：按模板 1:1 保留） -->
    <aside class="copies"><span>白联：财务</span><span>红联：记账</span><span>黄联：车间</span></aside>
  </section>`;
}

const STYLE = `
@page { size: 241mm 140mm; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; font-family: "Microsoft YaHei", "PingFang SC", sans-serif; color: #000; }
.sheet { width: 241mm; height: 140mm; padding: 4mm 5mm; display: flex; gap: 2mm; page-break-after: always; }
.sheet:last-child { page-break-after: auto; }
.main { flex: 1; min-width: 0; }
h1 { margin: 0; font-size: 5mm; text-align: center; font-weight: 700; }
h2 { margin: 1mm 0 2mm; font-size: 4.2mm; text-align: center; font-weight: 700; }
.meta { display: flex; justify-content: space-between; font-size: 3mm; margin-bottom: 1.5mm; }
.meta .right { text-align: right; line-height: 1.5; }
table { width: 100%; border-collapse: collapse; font-size: 3mm; }
th, td { border: 0.3mm solid #000; height: 8.5mm; text-align: center; padding: 0 1mm; }
th { font-weight: 700; }
td.l { text-align: left; }
tr.total td { font-weight: 700; }
.sign { display: flex; justify-content: space-between; font-size: 3mm; margin-top: 3mm; }
/* 右侧竖排联次列 */
.copies { width: 7mm; display: flex; flex-direction: column; justify-content: space-around; align-items: center;
          border-left: 0.3mm solid #000; font-size: 2.8mm; }
.copies span { writing-mode: vertical-rl; letter-spacing: 0.5mm; }
`;

/**
 * 打印出库单。
 *
 * 复用 TraceLabelDialog 的隐藏 iframe 骨架：iframe 必须真实挂进文档（不能 display:none，
 * 否则部分浏览器不渲染内容），打印完成后延时移除。
 */
export function printVegOutSheet(payload: VegOutPrintPayload): void {
  const rows = payload.rows ?? [];
  const pageCount = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  const pages: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    pages.push(buildPage(payload, rows.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE), i + 1, pageCount, rows));
  }

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const cw = iframe.contentWindow;
  if (!cw) {
    document.body.removeChild(iframe);
    return;
  }
  const doc = cw.document;
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><style>${STYLE}</style></head><body>${pages.join('')}</body></html>`);
  doc.close();
  // 等排版完成再唤起打印；浏览器以 --kiosk-printing 启动时 print() 静默送默认打印机，否则弹系统框
  cw.setTimeout(() => {
    cw.focus();
    cw.print();
    window.setTimeout(() => iframe.remove(), 1000);
  }, 200);
}
