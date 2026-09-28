/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

const api = vi.hoisted(() => ({
  getBurnPigs: vi.fn(),
  getBurnProducts: vi.fn(),
  getCutBars: vi.fn(),
  getCutProducts: vi.fn(),
  getShipStores: vi.fn(),
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
const whiteBar = { productId, productCode: 'HALF', productName: '白条', isWhiteBar: true, recordedCount: 0, maxCount: 2 };
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
  api.getRecentOutDests.mockResolvedValue({ data: [{ value: 'kitchen', label: '食堂', count: 8 }] });
  api.submitBurn.mockResolvedValue({ data: { receiptId: '9260928000000004' } });
  api.checkBurnFinish.mockResolvedValue({ data: { confirmationRequired: false, message: '' } });
  api.checkCutFinish.mockResolvedValue({ data: { confirmationRequired: false, message: '' } });
  api.finishBurn.mockResolvedValue({ data: null });
  api.finishCut.mockResolvedValue({ data: null });
  messageBox.confirm.mockResolvedValue('confirm');
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
