/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, type Slots } from 'vue';

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
const productionOverrides = vi.hoisted(() => ({}) as { deliverDest?: string; deliverType?: number; productAttr?: number; storeId?: string });
beforeEach(() => {
  delete productionOverrides.deliverDest;
  delete productionOverrides.deliverType;
  delete productionOverrides.productAttr;
  delete productionOverrides.storeId;
});

vi.mock('@/api/djs-warehouse/production', () => ({ listProductionItems }));

// 组件树无关本约束：列表壳与标损弹框都换成空壳，避免拖进字典 store / OSS 上传。
const BizTableStub = {
  name: 'BizTable',
  emits: ['search', 'reset', 'page-change'],
  setup(_: unknown, context: { slots: Slots }) {
    return () =>
      h(
        'div',
        context.slots.action?.({
          row: {
            id: '2118520319115857999',
            isDamaged: 0,
            isDeliveryCheck: 1,
            demandId: '2089615514926686209',
            storeId: '5001',
            productAttr: 1,
            ...productionOverrides
          }
        })
      );
  }
};
vi.mock('@/components/BizTable/index.vue', () => ({ default: BizTableStub }));
vi.mock('./DamageEvidenceForm.vue', () => ({
  default: { name: 'DamageEvidenceForm', render: () => null }
}));

// 文案不影响入参，i18n 一律回显 key（`@/lang/index` 是「出库去向」列格式化工具的依赖）。
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock('@/lang/index', () => ({ default: { global: { t: (key: string) => key } } }));

const ProductDetailDialog = (await import('./ProductDetailDialog.vue')).default;

/** 挂载弹框并按需求 id 打开（= 组件里唯一的入口，open() 内部直接触发 loadList）。 */
async function openWithDemand(
  demandId = '2089615514926686209',
  options: { storeId?: string; productType?: string; productUnit?: string; receivedTime?: string } = {}
) {
  listProductionItems.mockResolvedValue({ rows: [], total: 0 });
  const wrapper = mount(ProductDetailDialog, {
    global: {
      stubs: {
        'el-dialog': { template: '<div><slot /></div>' },
        'el-button': { template: '<button><slot /></button>' }
      }
    }
  });
  (
    wrapper.vm as unknown as {
      open: (p: { demandId: string; storeId?: string; productType?: string; productUnit?: string; receivedTime?: string }) => void;
    }
  ).open({
    demandId,
    storeId: '5001',
    productType: 'veg',
    productUnit: '斤',
    ...options
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

describe('V7 到店后 KG 生产产品标损范围', () => {
  beforeEach(() => listProductionItems.mockReset());

  it('KG 生产产品未确认到店时不提供标损', async () => {
    const wrapper = await openWithDemand(undefined, { productType: 'vegetable', productUnit: 'KG' });
    expect(wrapper.text()).not.toContain('storeDemand.damage.markAction');
  });

  it('KG 生产产品确认到店后提供标损', async () => {
    const wrapper = await openWithDemand(undefined, { productType: 'vegetable', productUnit: 'kg', receivedTime: '2026-11-06 10:00:00' });
    expect(wrapper.text()).toContain('storeDemand.damage.markAction');
  });

  it('白条确认到店后仍不提供标损', async () => {
    const wrapper = await openWithDemand(undefined, { productType: 'white_bar', productUnit: 'kg', receivedTime: '2026-11-06 10:00:00' });
    expect(wrapper.text()).not.toContain('storeDemand.damage.markAction');
  });

  it.each([
    { deliverDest: 'mail', deliverType: undefined },
    { deliverDest: 'platform', deliverType: 2 },
    { deliverDest: 'mail', deliverType: 2 }
  ])('邮寄 KG 记录不因关联已到店需求而开放标损：$deliverDest/$deliverType', async (overrides) => {
    Object.assign(productionOverrides, overrides);
    const wrapper = await openWithDemand(undefined, { productType: 'vegetable', productUnit: 'kg', receivedTime: '2026-11-06 10:00:00' });
    expect(wrapper.text()).not.toContain('storeDemand.damage.markAction');
  });

  it('非 KG 生产产品在收货前后的标损行为不变', async () => {
    const before = await openWithDemand(undefined, { productType: 'other', productUnit: '盒' });
    expect(before.text()).toContain('storeDemand.damage.markAction');
    const after = await openWithDemand(undefined, { productType: 'other', productUnit: '盒', receivedTime: '2026-11-06 10:00:00' });
    expect(after.text()).toContain('storeDemand.damage.markAction');
  });

  it.each([{ productAttr: 2 }, { storeId: '5002' }])('已到店 KG 原材料或门店不匹配时不提供标损：$productAttr/$storeId', async (overrides) => {
    Object.assign(productionOverrides, overrides);
    const wrapper = await openWithDemand(undefined, { productType: 'vegetable', productUnit: 'kg', receivedTime: '2026-11-06 10:00:00' });
    expect(wrapper.text()).not.toContain('storeDemand.damage.markAction');
  });
});
