/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

const api = vi.hoisted(() => ({
  getBurnPigs: vi.fn(),
  getBurnProducts: vi.fn(),
  getCutBars: vi.fn(),
  getCutProducts: vi.fn(),
  getShipStores: vi.fn(),
  getCutStoreDemands: vi.fn(),
  getRecentOutDests: vi.fn(),
  submitBurn: vi.fn(),
  submitCut: vi.fn(),
  checkBurnFinish: vi.fn(),
  checkCutFinish: vi.fn(),
  finishBurn: vi.fn(),
  finishCut: vi.fn()
}));
const messageBox = vi.hoisted(() => ({ confirm: vi.fn() }));
vi.mock('@/api/djs-warehouse/inout', () => api);
vi.mock('@/api/system/dict/data', () => ({ getDicts: () => Promise.resolve({ data: [{ dictValue: 'kitchen', dictLabel: '食堂' }] }) }));
vi.mock('@/store/modules/user', () => ({ useUserStore: () => ({ userId: 'qa' }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key.split('.').pop() }) }));
vi.mock('element-plus', async (original) => ({
  ...(await original<typeof import('element-plus')>()),
  ElMessage: { success: vi.fn() },
  ElMessageBox: messageBox
}));
vi.mock('../../production/packEntry/components/ScaleFillBar.vue', () => ({ default: { template: '<span />' } }));
vi.mock('../../production/packEntry/components/WeightNumpad.vue', () => ({
  default: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<input class="test-weight" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />'
  }
}));
import InoutStation from './InoutStation.vue';

const pigId = '9260928000000001';
const productId = '9260928000000002';
const storeId = '9260928000000003';
const whiteBar = { productId, productCode: 'HALF', productName: '白条', isWhiteBar: true, recordedCount: 0, maxCount: 1 };
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function render(mode: 'burn' | 'cut' = 'burn') {
  return mount(InoutStation, {
    props: { mode },
    global: {
      directives: { loading: {}, hasPermi: {} },
      stubs: {
        ElButton: { props: ['disabled'], template: '<button :disabled="disabled"><slot /></button>' },
        ElSelect: {
          props: ['modelValue', 'disabled'],
          emits: ['update:modelValue'],
          template: '<select :value="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>'
        },
        ElOption: { props: ['value', 'label'], template: '<option :value="value">{{ label }}</option>' },
        ElAlert: { props: ['title'], template: '<p class="load-error">{{ title }}</p>' },
        ElEmpty: true,
        ElImage: true
      }
    }
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  api.getBurnPigs.mockResolvedValue({
    data: [{ id: pigId, barId: 'QA-PIG', earNo: 'QA-EAR', marketingTime: '2026-09-28 08:00:00', status: 'pending_singe' }]
  });
  api.getBurnProducts.mockResolvedValue({ data: [whiteBar] });
  api.getShipStores.mockResolvedValue({ data: [{ storeId, storeName: 'QA门店', copies: 2 }] });
  api.getCutStoreDemands.mockResolvedValue({ data: [] });
  api.getRecentOutDests.mockResolvedValue({ data: [{ value: 'kitchen', label: '食堂', count: 8 }] });
  api.submitBurn.mockResolvedValue({ data: { receiptId: '9260928000000004' } });
  api.checkBurnFinish.mockResolvedValue({ data: { confirmationRequired: false, message: '' } });
  api.checkCutFinish.mockResolvedValue({ data: { confirmationRequired: false, message: '' } });
  api.finishBurn.mockResolvedValue({ data: null });
  api.finishCut.mockResolvedValue({ data: null });
  messageBox.confirm.mockResolvedValue('confirm');
});

describe('row266 cut store demand', () => {
  const productionProductId = '9260929000000005';
  function arrange() {
    api.getCutBars.mockResolvedValue({
      data: [{ barInfoId: pigId, cutRecordId: '9260929000000099', whiteBarNo: 'QA-HALF', inWeight: '40', remainingWeight: '40' }]
    });
    api.getCutProducts.mockResolvedValue({ data: [{ productId, productName: '通排' }] });
    api.getCutStoreDemands.mockResolvedValue({
      data: [
        {
          storeId,
          storeName: '二七滨江',
          productId: productionProductId,
          productName: '通排散装',
          productUnit: 'kg',
          demandQuantity: '15',
          minimumWeight: '15',
          measureWeight: null
        }
      ]
    });
    api.submitCut.mockResolvedValue({ data: { cutRecordId: '9260929000000099', receiptId: '9260929000000100' } });
  }
  it('puts store demand immediately after warehouse dispatch and submits the mapped production SKU with string IDs', async () => {
    arrange();
    const wrapper = render('cut');
    await flushPromises();
    expect(wrapper.findAll('.destination-options button').map((x) => x.text())).toEqual(['warehouseOut', 'storeDemand', 'fresh', 'frozen']);
    await wrapper.findAll('.destination-options button')[1].trigger('click');
    await flushPromises();
    expect(wrapper.find('.store-demand-card').text()).toContain('二七滨江');
    expect(wrapper.find('.store-demand-card').text()).toContain('15 kg');
    await wrapper.find('.store-demand-card').trigger('click');
    await wrapper.find('.test-weight').setValue('15');
    await wrapper.find('.submit-button').trigger('click');
    await flushPromises();
    expect(api.submitCut).toHaveBeenCalledWith(
      expect.objectContaining({ productId, productionProductId, storeId, destination: 'store', weight: '15.000' })
    );
    expect(api.submitCut.mock.calls[0][0]).not.toHaveProperty('outDest');
    wrapper.unmount();
  });
  it('blocks underweight and cancels over-measure without posting', async () => {
    arrange();
    api.getCutStoreDemands.mockResolvedValue({
      data: [
        {
          storeId,
          storeName: '二七滨江',
          productId: productionProductId,
          productName: '通排散装',
          productUnit: 'kg',
          demandQuantity: '15',
          minimumWeight: '15',
          measureWeight: '15'
        }
      ]
    });
    const wrapper = render('cut');
    await flushPromises();
    await wrapper.findAll('.destination-options button')[1].trigger('click');
    await flushPromises();
    await wrapper.find('.store-demand-card').trigger('click');
    await wrapper.find('.test-weight').setValue('14.999');
    expect(wrapper.find('.submit-button').attributes('disabled')).toBeDefined();
    messageBox.confirm.mockRejectedValueOnce('cancel');
    await wrapper.find('.test-weight').setValue('15.451');
    await wrapper.find('.submit-button').trigger('click');
    await flushPromises();
    expect(messageBox.confirm).toHaveBeenCalledTimes(1);
    expect(api.submitCut).not.toHaveBeenCalled();
    await wrapper.find('.submit-button').trigger('click');
    await flushPromises();
    expect(api.submitCut).toHaveBeenCalledWith(expect.objectContaining({ allowOverMeasure: true }));
    wrapper.unmount();
  });
  it('never queries or displays store demand without a selected material', async () => {
    arrange();
    api.getCutProducts.mockResolvedValue({ data: [] });
    const wrapper = render('cut');
    await flushPromises();
    expect(api.getCutStoreDemands).not.toHaveBeenCalled();
    expect(wrapper.find('.store-demand-card').exists()).toBe(false);
    wrapper.unmount();
  });

  it('discards a late store lookup when the material changes and allows lookup retry after a failure', async () => {
    arrange();
    api.getCutProducts.mockResolvedValue({
      data: [
        { productId, productName: '通排' },
        { productId: '9260929000000022', productName: '板油' }
      ]
    });
    const pending = deferred<{
      data: {
        storeId: string;
        storeName: string;
        productId: string;
        productName: string;
        productUnit: string;
        demandQuantity: string;
        minimumWeight: string;
      }[];
    }>();
    const wrapper = render('cut');
    await flushPromises();
    api.getCutStoreDemands.mockReturnValueOnce(pending.promise);
    await wrapper.findAll('.destination-options button')[1].trigger('click');
    await wrapper.findAll('.product-card')[1].trigger('click');
    await flushPromises();
    pending.resolve({
      data: [
        {
          storeId,
          storeName: '过期门店',
          productId: productionProductId,
          productName: '通排',
          productUnit: 'kg',
          demandQuantity: '15',
          minimumWeight: '15'
        }
      ]
    });
    await flushPromises();
    expect(wrapper.text()).not.toContain('过期门店');
    api.getCutStoreDemands.mockRejectedValueOnce(new Error('需求查询失败'));
    await wrapper.findAll('.destination-options button')[1].trigger('click');
    await flushPromises();
    expect(wrapper.find('.load-error').text()).toContain('需求查询失败');
    expect(wrapper.find('.submit-button').attributes('disabled')).toBeDefined();
    await wrapper.findAll('.destination-options button')[1].trigger('click');
    await flushPromises();
    expect(wrapper.find('.store-demand-card').text()).toContain('二七滨江');
    wrapper.unmount();
  });
});

describe('historical half-bar eligibility', () => {
  it('keeps a historical half read-only and selects the eligible right half', async () => {
    api.getBurnProducts.mockResolvedValue({
      data: [
        { ...whiteBar, productName: '半扇', canRecord: false },
        { ...whiteBar, productId: 'right', productName: '右半扇', canRecord: true }
      ]
    });
    const wrapper = render();
    await flushPromises();
    const cards = wrapper.findAll('.product-card');
    expect(cards[0].attributes('disabled')).toBeDefined();
    expect(cards[1].attributes('disabled')).toBeUndefined();
    expect(cards[1].attributes('aria-pressed')).toBe('true');
    await wrapper.find('.test-weight').setValue('25');
    await wrapper.find('.submit-button').trigger('click');
    await flushPromises();
    expect(api.submitBurn).toHaveBeenCalledWith(expect.objectContaining({ productId: 'right' }));
    wrapper.unmount();
  });
});

describe('rows267-270 retest', () => {
  it('lets the right half be entered after the left half is recorded, with one entry per product', async () => {
    api.getBurnProducts.mockResolvedValue({
      data: [
        { ...whiteBar, productName: '左半扇', recordedCount: 1 },
        { ...whiteBar, productId: '9260928000000009', productName: '右半扇', recordedCount: 0 }
      ]
    });
    const wrapper = render();
    await flushPromises();
    const cards = wrapper.findAll('.product-card');
    expect(cards[0].attributes('disabled')).toBeDefined();
    expect(cards[1].attributes('disabled')).toBeUndefined();
    expect(cards[0].text()).toContain('1/1');
    expect(cards[1].text()).toContain('0/1');
    expect(wrapper.find('.destination-select option').text()).toBe('QA门店 (2headUnit)');
    wrapper.unmount();
  });

  it('automatically loads demand for a selected material and defaults to store only when demand exists', async () => {
    api.getCutBars.mockResolvedValue({ data: [{ barInfoId: pigId, cutRecordId: '9260929000000099', productName: '右半扇' }] });
    api.getCutProducts.mockResolvedValue({
      data: [
        { productId, productName: '通排' },
        { productId: '9260929000000022', productName: '板油' }
      ]
    });
    api.getCutStoreDemands.mockImplementation((id: string) =>
      Promise.resolve({
        data:
          id === productId
            ? [
                {
                  storeId,
                  storeName: '二七滨江',
                  productId: '9260929000000005',
                  productName: '通排',
                  productUnit: 'kg',
                  demandQuantity: '2',
                  minimumWeight: '2',
                  measureWeight: '2'
                }
              ]
            : []
      })
    );
    const wrapper = render('cut');
    await flushPromises();
    expect(api.getCutStoreDemands).toHaveBeenCalledWith(productId);
    expect(wrapper.find('.destination-options button.active').text()).toBe('storeDemand');
    expect(wrapper.find('.source-card').text()).toContain('右半扇');
    await wrapper.find('.store-demand-card').trigger('click');
    await wrapper.find('.test-weight').setValue('1.999');
    expect(wrapper.find('.under-demand').text()).toBe('underDemand');
    expect(wrapper.find('.submit-button').attributes('disabled')).toBeDefined();
    await wrapper.findAll('.product-card')[1].trigger('click');
    await flushPromises();
    expect(wrapper.find('.destination-options button.active').text()).toBe('warehouseOut');
    expect(wrapper.find('.store-demand-card').exists()).toBe(false);
    wrapper.unmount();
  });
});

describe('completion confirmation', () => {
  const cutRecordId = '9260928000000099';
  function arrange(mode: 'burn' | 'cut', abnormal = false) {
    const check = mode === 'burn' ? api.checkBurnFinish : api.checkCutFinish;
    const finish = mode === 'burn' ? api.finishBurn : api.finishCut;
    const message = mode === 'burn' ? '请确认录入的接收重量信息是否正确。' : '请确认白条是否已分割完成。';
    check.mockResolvedValue({ data: { confirmationRequired: abnormal, message: abnormal ? message : '' } });
    api.getCutBars.mockResolvedValue({ data: [{ barInfoId: pigId, cutRecordId, whiteBarNo: 'QA-HALF', inWeight: '40', remainingWeight: '35' }] });
    api.getCutProducts.mockResolvedValue({ data: [] });
    return { check, finish, message, id: mode === 'burn' ? pigId : cutRecordId };
  }

  it.each(['burn', 'cut'] as const)('sends no override when %s meets the server rule', async (mode) => {
    const { check, finish, id } = arrange(mode);
    const wrapper = render(mode);
    await flushPromises();
    await wrapper.find('.finish-button').trigger('click');
    await flushPromises();
    expect(check).toHaveBeenCalledWith(id);
    expect(finish).toHaveBeenCalledExactlyOnceWith(id, false);
    expect(messageBox.confirm).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it.each(['burn', 'cut'] as const)('does not finish %s when the weight warning is cancelled', async (mode) => {
    const { finish, message } = arrange(mode, true);
    messageBox.confirm.mockRejectedValueOnce('cancel');
    const wrapper = render(mode);
    await flushPromises();
    await wrapper.find('.finish-button').trigger('click');
    await flushPromises();
    expect(messageBox.confirm).toHaveBeenCalledWith(message, expect.any(String), expect.objectContaining({ confirmButtonText: 'confirmAnyway' }));
    expect(finish).not.toHaveBeenCalled();
    expect(wrapper.find('.finish-button').attributes('disabled')).toBeUndefined();
    wrapper.unmount();
  });

  it.each(['burn', 'cut'] as const)('requires explicit confirmation and prevents duplicate %s completion while the warning is open', async (mode) => {
    const { finish, id, message } = arrange(mode, true);
    const dialog = deferred<'confirm'>();
    messageBox.confirm.mockReturnValueOnce(dialog.promise);
    const wrapper = render(mode);
    await flushPromises();
    await wrapper.find('.finish-button').trigger('click');
    await flushPromises();
    await wrapper.find('.finish-button').trigger('click');
    expect(messageBox.confirm).toHaveBeenCalledWith(message, expect.any(String), expect.any(Object));
    expect(messageBox.confirm).toHaveBeenCalledTimes(1);
    expect(finish).not.toHaveBeenCalled();
    dialog.resolve('confirm');
    await flushPromises();
    expect(finish).toHaveBeenCalledExactlyOnceWith(id, true);
    wrapper.unmount();
  });

  it('does not submit completion or show a success confirmation when the server precheck fails', async () => {
    const { check, finish } = arrange('burn');
    check.mockRejectedValueOnce(new Error('必须录入两片半扇'));
    const wrapper = render();
    await flushPromises();
    await wrapper.find('.finish-button').trigger('click');
    await flushPromises();
    expect(messageBox.confirm).not.toHaveBeenCalled();
    expect(finish).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});

describe('intake workstation interactions', () => {
  it('caps the combined half-bar count across different configured white-bar products', async () => {
    api.getBurnProducts.mockResolvedValue({
      data: [
        { ...whiteBar, recordedCount: 1 },
        { ...whiteBar, productId: '9260928000000009', productName: '另一白条产品', recordedCount: 1 }
      ]
    });
    const wrapper = render();
    await flushPromises();
    expect(wrapper.findAll('.product-card').every((card) => card.attributes('disabled') !== undefined)).toBe(true);
    expect(wrapper.find('.submit-button').attributes('disabled')).toBeDefined();
    expect(api.getShipStores).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('keeps a list-load failure visible and leaves no previously selectable source', async () => {
    api.getBurnPigs.mockRejectedValueOnce(new Error('猪只列表加载失败'));
    const wrapper = render();
    await flushPromises();
    expect(wrapper.find('.load-error').text()).toContain('猪只列表加载失败');
    expect(wrapper.findAll('.source-card')).toHaveLength(0);
    expect(wrapper.find('.submit-button').attributes('disabled')).toBeDefined();
    wrapper.unmount();
  });

  it('defaults a white bar to the first unmet store and submits string IDs with decimal kg exactly once', async () => {
    const pending = deferred<{ data: { receiptId: string } }>();
    api.submitBurn.mockReturnValue(pending.promise);
    const wrapper = render();
    await flushPromises();
    expect(wrapper.find('.ear-chip').text()).toBe('QA-EAR');
    expect(wrapper.find('.destination-select').element).toHaveProperty('value', storeId);
    expect(wrapper.find('.submit-button').text()).toBe('confirmOut');
    await wrapper.find('.test-weight').setValue('32.125');
    await wrapper.find('.submit-button').trigger('click');
    await wrapper.find('.submit-button').trigger('click');
    expect(api.submitBurn).toHaveBeenCalledTimes(1);
    expect(api.submitBurn.mock.calls[0][0]).toMatchObject({ barInfoId: pigId, productId, weight: '32.125', destination: 'store', storeId });
    expect(api.submitBurn.mock.calls[0][0].requestId).toHaveLength(36);
    pending.resolve({ data: { receiptId: '9260928000000004' } });
    await flushPromises();
    wrapper.unmount();
  });

  it('does not allow a late product response to overwrite the newly selected pig', async () => {
    const second = deferred<{ data: (typeof whiteBar)[] }>();
    api.getBurnPigs.mockResolvedValue({
      data: [
        { id: pigId, barId: 'A', marketingTime: '2026-09-28 10:00:00' },
        { id: 'B', barId: 'B', marketingTime: '2026-09-28 09:00:00' },
        { id: 'C', barId: 'C', marketingTime: '2026-09-28 08:00:00' }
      ]
    });
    api.getBurnProducts.mockImplementation((id: string) =>
      id === 'B' ? second.promise : Promise.resolve({ data: [{ ...whiteBar, productName: `产品-${id}` }] })
    );
    const wrapper = render();
    await flushPromises();
    await wrapper.findAll('.source-card')[1].trigger('click');
    await wrapper.findAll('.source-card')[2].trigger('click');
    await flushPromises();
    second.resolve({ data: [{ ...whiteBar, productName: '过期产品B' }] });
    await flushPromises();
    expect(wrapper.find('.ear-chip').text()).toBe('C');
    expect(wrapper.find('.product-grid').text()).toContain('产品-C');
    expect(wrapper.find('.product-grid').text()).not.toContain('过期产品B');
    wrapper.unmount();
  });

  it('fails closed on demand lookup failure instead of treating it as no store demand', async () => {
    api.getShipStores.mockRejectedValue(new Error('门店需求加载失败'));
    const wrapper = render();
    await flushPromises();
    expect(wrapper.find('.load-error').text()).toContain('门店需求加载失败');
    await wrapper.find('.test-weight').setValue('20');
    expect(wrapper.find('.submit-button').attributes('disabled')).toBeDefined();
    expect(api.submitBurn).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('uses the returned cutting record for the next product, keeping frequent destinations synchronized', async () => {
    const cutRecordId = '9260928000000099';
    api.getCutBars
      .mockResolvedValueOnce({
        data: [{ barInfoId: pigId, inhouseId: '9260928000000088', whiteBarNo: 'QA-HALF', inWeight: '40', remainingWeight: '40' }]
      })
      .mockResolvedValue({ data: [{ barInfoId: pigId, cutRecordId, whiteBarNo: 'QA-HALF', inWeight: '40', remainingWeight: '35' }] });
    api.getCutProducts.mockResolvedValue({ data: [{ productId, productName: '通排' }] });
    api.submitCut.mockResolvedValue({ data: { cutRecordId, receiptId: '9260928000000100' } });
    const wrapper = render('cut');
    await flushPromises();
    await wrapper.find('.recent-destinations button').trigger('click');
    expect(wrapper.find('.destination-select').element).toHaveProperty('value', 'kitchen');
    await wrapper.find('.test-weight').setValue('5');
    await wrapper.find('.submit-button').trigger('click');
    await flushPromises();
    await wrapper.find('.recent-destinations button').trigger('click');
    await wrapper.find('.test-weight').setValue('5');
    await wrapper.find('.submit-button').trigger('click');
    await flushPromises();
    const first = api.submitCut.mock.calls[0][0];
    const next = api.submitCut.mock.calls[1][0];
    expect(first).toMatchObject({ inhouseId: '9260928000000088', destination: 'outbound', outDest: 'kitchen', weight: '5.000' });
    expect(next).toMatchObject({ cutRecordId, destination: 'outbound', outDest: 'kitchen', weight: '5.000' });
    expect(next).not.toHaveProperty('inhouseId');
    wrapper.unmount();
  });
});
