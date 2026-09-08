/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

/**
 * 需求下单「产品明细」**请求入参**契约（row204 / D-0048）。
 *
 * <h3>为什么要有这条</h3>
 * Java 侧那两条 SQL 契约测试
 * （`ProductProductionMapperSqlContractTest#arrivedQuantityHasNoDeliverDestFilter`、
 *  `ProductProductionServiceImplTest#queryItemPageList_byDemandAndDeliveryChecked_ignoresProduceDate`）
 * 只跑「demandId + deliveryChecked」这一组入参 —— 谁在本组件里把 `excludeGiftDeliver: true` 加回去，
 * 那两条照样全绿，线上却会重演「到店量 100 / 明细只有 50」（少的 50 是 deliver_dest='warehouse_out'
 * 的仓库自用出库，它计进到店量）。出问题的那一层在**前端传参**，所以约束必须落在这里：
 * 挂载真组件、走真 `loadList()`，断言实际递给 `listProductionItems` 的那个对象。
 */

const { listProductionItems } = vi.hoisted(() => ({ listProductionItems: vi.fn() }));

vi.mock('@/api/djs-warehouse/production', () => ({ listProductionItems }));

// 组件树无关本约束：列表壳与标损弹框都换成空壳，避免拖进字典 store / OSS 上传。
const BizTableStub = { name: 'BizTable', emits: ['search', 'reset', 'page-change'], render: () => null };
vi.mock('@/components/BizTable/index.vue', () => ({ default: BizTableStub }));
vi.mock('./DamageEvidenceForm.vue', () => ({
  default: { name: 'DamageEvidenceForm', render: () => null }
}));

// 文案不影响入参，i18n 一律回显 key（`@/lang/index` 是「出库去向」列格式化工具的依赖）。
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock('@/lang/index', () => ({ default: { global: { t: (key: string) => key } } }));

const ProductDetailDialog = (await import('./ProductDetailDialog.vue')).default;

/** 挂载弹框并按需求 id 打开（= 组件里唯一的入口，open() 内部直接触发 loadList）。 */
async function openWithDemand(demandId = '2089615514926686209') {
  listProductionItems.mockResolvedValue({ rows: [], total: 0 });
  const wrapper = mount(ProductDetailDialog);
  (wrapper.vm as unknown as { open: (p: { demandId: string; productType?: string; productUnit?: string }) => void }).open({
    demandId,
    productType: 'veg',
    productUnit: '斤'
  });
  await flushPromises();
  return wrapper;
}

/** 本轮实际递给 api 的入参（只会有一次调用，多一次就是有别的路径在偷偷发请求）。 */
function sentParams(): Record<string, unknown> {
  expect(listProductionItems, '产品明细必须发且只发一次列表请求').toHaveBeenCalledTimes(1);
  return listProductionItems.mock.calls[0][0] as Record<string, unknown>;
}

describe('产品明细弹框的请求入参（row204 / D-0048）', () => {
  beforeEach(() => {
    listProductionItems.mockReset();
  });

  it('按 demandId 下钻，并且只取已发货清点的产出', async () => {
    await openWithDemand('2089615514926686209');

    const params = sentParams();
    expect(params.demandId).toBe('2089615514926686209');
    // 与到店量聚合的 is_delivery_check = 1 同条件
    expect(params.deliveryChecked).toBe(true);
  });

  it('🔒 不得再带 excludeGiftDeliver —— 到店量聚合没有 deliver_dest 过滤，多一道明细就少行', async () => {
    // 线上实证：需求 2089615514926686209 到店量 100，带上这个 flag 只查得到 1 行 50。
    // D-0048 拍板前明细如实列全，靠「出库去向」列把仓库自用那类行标出来。
    // 要改先改到店量那一侧（ProductProductionMapper#selectArrivedQuantityByDemandIds），两处同步。
    await openWithDemand();

    expect(Object.keys(sentParams())).not.toContain('excludeGiftDeliver');
  });

  it('不得按生产日期 / 产品 / 门店筛（产出记生产当天、需求挂到店那天，差一天就查空）', async () => {
    await openWithDemand();

    const keys = Object.keys(sentParams());
    expect(keys).not.toContain('produceDate');
    expect(keys).not.toContain('productId');
    expect(keys).not.toContain('storeId');
  });
});
