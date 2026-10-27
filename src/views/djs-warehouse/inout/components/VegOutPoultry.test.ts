/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

const api = vi.hoisted(() => ({
  getVegOutProducts: vi.fn(),
  getVegOutStocks: vi.fn(),
  getVegRecentOutDests: vi.fn(),
  submitVegOut: vi.fn(),
  finishVegOut: vi.fn()
}));
const message = vi.hoisted(() => ({ success: vi.fn(), warning: vi.fn(), error: vi.fn() }));
const messageBox = vi.hoisted(() => ({ confirm: vi.fn() }));
const tareApi = vi.hoisted(() => ({ listTareOptions: vi.fn() }));
const weighing = vi.hoisted(() => ({ confirmWeighing: vi.fn() }));
vi.mock('@/api/djs-warehouse/inoutVeg', () => api);
vi.mock('@/api/djs-warehouse/tareSpec', () => tareApi);
vi.mock('../../production/packEntry/components/confirmWeighing', () => weighing);
vi.mock('@/api/system/dict/data', () => ({
  getDicts: () =>
    Promise.resolve({
      data: [
        { dictValue: 'kitchen', dictLabel: '厨房' },
        { dictValue: 'feed', dictLabel: '猪只饲料' },
        { dictValue: 'poultry_feed', dictLabel: '家禽饲料' }
      ]
    })
}));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key.split('.').pop() }) }));
vi.mock('element-plus', async (original) => ({
  ...(await original<typeof import('element-plus')>()),
  ElMessage: message,
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
import VegOutStation from './VegOutStation.vue';

const stubs = {
  ElButton: { props: ['disabled'], template: '<button :disabled="disabled"><slot /></button>' },
  ElSelect: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<select class="out-dest" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>'
  },
  ElOption: { props: ['value', 'label'], template: '<option :value="value">{{ label }}</option>' },
  ElAlert: { props: ['title'], template: '<p class="load-error">{{ title }}</p>' },
  ElEmpty: true
};
const global = { directives: { loading: {}, hasPermi: {} }, stubs };
const productId = '9261008000000301';

function buttonByText(wrapper: ReturnType<typeof mount>, selector: string, text: string) {
  const found = wrapper.findAll(selector).find((b) => b.text().includes(text));
  if (!found) throw new Error(`button ${text} not found in ${selector}`);
  return found;
}

describe('V7 行13 果蔬出库「家禽饲料」去向', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tareApi.listTareOptions.mockResolvedValue({ data: [] });
    weighing.confirmWeighing.mockResolvedValue('confirm');
    api.getVegOutProducts.mockResolvedValue({ data: [{ productId, productName: '水果黄瓜', plotCount: 1, totalStock: '20' }] });
    api.getVegOutStocks.mockResolvedValue({
      data: [{ productId, locationId: '9261008000000302', locationName: '毛菜鲜品库', stockWeight: '20', stockIds: ['s1'] }]
    });
    api.getVegRecentOutDests.mockResolvedValue({ data: [] });
    api.submitVegOut.mockResolvedValue({ data: null });
  });

  it('shows the poultry feed option as the third destination', async () => {
    const wrapper = mount(VegOutStation, { global });
    await flushPromises();
    expect(wrapper.findAll('.destination-options .option').map((b) => b.text())).toEqual(['warehouseOut', 'pigFeed', 'poultryFeed']);
  });

  it('poultry feed hides the destination select and submits like pig feed with its own destination', async () => {
    const wrapper = mount(VegOutStation, { global });
    await flushPromises();
    await wrapper.findAll('.stock-card')[0].trigger('click');
    await buttonByText(wrapper, '.destination-options .option', 'poultryFeed').trigger('click');
    expect(buttonByText(wrapper, '.destination-options .option', 'poultryFeed').classes()).toContain('active');
    expect(wrapper.find('.out-dest').exists()).toBe(false);
    await wrapper.find('.test-weight').setValue('12');
    const submit = buttonByText(wrapper, '.submit-button', 'confirmOut');
    expect(submit.attributes('disabled')).toBeUndefined();
    await submit.trigger('click');
    await flushPromises();
    expect(weighing.confirmWeighing).toHaveBeenCalledWith(expect.objectContaining({ direction: 'out', destination: 'poultryFeed' }));
    expect(api.submitVegOut).toHaveBeenCalledWith({ productId, stockIds: ['s1'], weight: '12.000', destination: 'poultry_feed' });
    expect(message.success).toHaveBeenCalledWith('vegOutSaved');
  });

  it('selecting another product resets the destination back to warehouse', async () => {
    const wrapper = mount(VegOutStation, { global });
    await flushPromises();
    await buttonByText(wrapper, '.destination-options .option', 'poultryFeed').trigger('click');
    await wrapper.findAll('.product-card')[0].trigger('click');
    await flushPromises();
    expect(buttonByText(wrapper, '.destination-options .option', 'warehouseOut').classes()).toContain('active');
  });
});
