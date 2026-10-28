// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { printDemandSheet, type DemandSheetLabels } from './printDemandSheet';

const labels: DemandSheetLabels = {
  titleSuffix: '订货单',
  demandDate: '订货日期',
  storeName: '订货门店',
  categoryCount: '订货品类总数',
  seq: '序号',
  productName: '产品名称',
  productSpec: '产品规格',
  demandQuantity: '需求量',
  unit: '单位',
  remark: '备注',
  prepared: '是否已备完货',
  unitHead: '头',
  preparedBy: '制单人',
  printDate: '制单日期',
  footerStore: '门店'
};

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('需求单打印', () => {
  it('保留斤、吨等计量小数，白条按原始头数，完整转义备注且备货栏留空', () => {
    let html = '';
    const frameWindow = {
      document: {
        open: vi.fn(),
        write: (value: string) => {
          html = value;
        },
        close: vi.fn()
      },
      setTimeout: vi.fn()
    };
    vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockReturnValue(frameWindow as unknown as Window);
    const remark = '备货要求'.repeat(120) + '尾部标记；<script>不可执行</script>';

    printDemandSheet(
      {
        demandDate: '2026-10-27',
        storeId: '7',
        storeName: '验收店',
        categoryCount: 5,
        items: [
          { productId: '1', productName: '斤产品', demandQuantity: '1.250', productUnit: '斤', demandRemark: remark },
          { productId: '2', productName: '吨产品', demandQuantity: '2.500', productUnit: '吨' },
          { productId: '3', productName: 'KG产品', demandQuantity: '3.500', productUnit: 'KG' },
          { productId: '4', productName: '白条', demandQuantity: '0.500', productUnit: 'kg', belongType: 'white_bar' },
          { productId: '5', productName: '鸡蛋', demandQuantity: '3.000', productUnit: '个' }
        ]
      },
      labels,
      { preparedBy: '当前<管理员>', printDate: '2026-10-28' }
    );

    const printed = document.createElement('div');
    printed.innerHTML = html;
    const rows = [...printed.querySelectorAll('tbody tr')];
    expect(rows.map((row) => row.children[3].textContent)).toEqual(['1.25', '2.5', '3.500', '0.5', '3']);
    expect(rows.map((row) => row.children[4].textContent)).toEqual(['斤', '吨', 'KG', '头', '个']);
    expect(rows[0].children[5].textContent).toBe(remark);
    expect(printed.querySelector('script')).toBeNull();
    expect(rows.every((row) => row.children[6].textContent === '')).toBe(true);
    expect(html).toContain('@page { size: A4 landscape;');
    expect(html).toContain('margin: 0;');
    expect(printed.querySelector('.print-footer')?.textContent).toContain('制单人：当前<管理员>');
    expect(printed.querySelector('.print-footer')?.textContent).toContain('制单日期：2026-10-28');
    expect(printed.querySelector('.print-footer')?.textContent).toContain('门店：验收店');
  });
});
