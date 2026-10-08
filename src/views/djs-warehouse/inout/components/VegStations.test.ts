/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

const api = vi.hoisted(() => ({
  getVegCrops: vi.fn(),
  getVegPlots: vi.fn(),
  getVegInOptions: vi.fn(),
  submitVegIn: vi.fn(),
  finishVegIn: vi.fn(),
  getVegOutProducts: vi.fn(),
  getVegOutStocks: vi.fn(),
  getVegRecentOutDests: vi.fn(),
  submitVegOut: vi.fn()
}));
const message = vi.hoisted(() => ({ success: vi.fn(), warning: vi.fn() }));
const messageBox = vi.hoisted(() => ({ confirm: vi.fn() }));
vi.mock('@/api/djs-warehouse/inoutVeg', () => api);
vi.mock('@/api/system/dict/data', () => ({
  getDicts: () =>
    Promise.resolve({
      data: [
        { dictValue: 'kitchen', dictLabel: '厨房' },
        { dictValue: 'mine', dictLabel: '矿山' },
        { dictValue: 'feed', dictLabel: '猪只饲料' }
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
import VegInStation from './VegInStation.vue';
import VegOutStation from './VegOutStation.vue';
import { chunkPages, defaultProductId, isValidWeight, toCustomPercent } from './vegStation';

const stubs = {
  ElButton: { props: ['disabled'], template: '<button :disabled="disabled"><slot /></button>' },
  ElSelect: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<select class="out-dest" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>'
  },
  ElOption: { props: ['value', 'label'], template: '<option :value="value">{{ label }}</option>' },
  ElInput: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<input class="custom-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  },
  ElAlert: { props: ['title'], template: '<p class="load-error">{{ title }}</p>' },
  ElEmpty: true,
  ElTag: { template: '<em class="tag"><slot /></em>' }
};
const global = { directives: { loading: {}, hasPermi: {} }, stubs };

const cropId = '9261008000000001';
const plotA = '9261008000000011';
const plotDone = '9261008000000012';
const product1 = '9261008000000021';
const product2 = '9261008000000022';
const team1 = '9261008000000031';
const team2 = '9261008000000032';

function buttonByText(wrapper: ReturnType<typeof mount>, selector: string, text: string) {
  const found = wrapper.findAll(selector).find((b) => b.text().includes(text));
  if (!found) throw new Error(`button ${text} not found in ${selector}`);
  return found;
}

describe('vegStation helpers', () => {
  it('pages cards three columns by two rows', () => {
    expect(chunkPages([1, 2, 3, 4, 5, 6, 7]).map((p) => p.length)).toEqual([6, 1]);
  });
  it('accepts only custom percentages between 1 and 99', () => {
    expect(['0', '100', '12.5', 'a', ''].map(toCustomPercent)).toEqual([null, null, null, null, null]);
    expect(toCustomPercent('35')).toBe(35);
  });
  it('defaults to the first selectable product and validates weight precision', () => {
    expect(defaultProductId([{ productId: 'x', selectable: false }, { productId: 'y' }])).toBe('y');
    expect(defaultProductId([])).toBe('');
    expect([1.005, 0, -1, 1.0005].map(isValidWeight)).toEqual([true, false, false, false]);
  });
});

describe('row282 果蔬入库管理', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getVegCrops.mockResolvedValue({
      data: [
        { cropId, cropName: '黄瓜', expectedYield: '350', harvestWeight: '120' },
        { cropId: '9261008000000002', cropName: '茄子', expectedYield: '220', harvestWeight: '90' }
      ]
    });
    api.getVegPlots.mockResolvedValue({
      data: [
        {
          plantingRecordId: plotA,
          plotId: 'p1',
          plotCode: 'C-C1西-0-001',
          expectYield: '140',
          harvestWeight: '70',
          weighStatus: 'pending',
          processStatus: 'pending',
          products: [
            { productId: product1, productName: '黄瓜', selectable: true },
            { productId: product2, productName: '黄瓜苗', selectable: true }
          ]
        },
        { plantingRecordId: plotDone, plotId: 'p2', plotCode: 'C-C1东-0-002', weighStatus: 'done', processStatus: 'pending', products: [] }
      ]
    });
    api.getVegInOptions.mockResolvedValue({
      data: {
        destinationName: '毛菜鲜品库',
        teams: [
          { teamId: team1, teamName: '一组' },
          { teamId: team2, teamName: '二组' }
        ]
      }
    });
    api.submitVegIn.mockResolvedValue({ data: '77' });
    api.finishVegIn.mockResolvedValue({ data: '77' });
    messageBox.confirm.mockResolvedValue('confirm');
  });

  it('shows crop and plot cards, selects the first crop and keeps the fresh-veg room as the only destination', async () => {
    const wrapper = mount(VegInStation, { global });
    await flushPromises();
    expect(wrapper.findAll('.crop-card').map((c) => c.text())).toEqual([expect.stringContaining('黄瓜'), expect.stringContaining('茄子')]);
    expect(wrapper.find('.crop-card').classes()).toContain('active');
    expect(wrapper.find('.crop-chip').text()).toContain('黄瓜');
    expect(api.getVegPlots).toHaveBeenCalledWith(cropId);
    const plots = wrapper.findAll('.plot-card');
    expect(plots).toHaveLength(2);
    expect(plots[1].attributes('disabled')).toBeDefined();
    expect(plots[1].text()).toContain('weighDone');
    const destination = wrapper.findAll('.info-section .option').filter((b) => b.text() === '毛菜鲜品库');
    expect(destination).toHaveLength(1);
    expect(wrapper.text()).not.toContain('蔬菜保鲜');
  });

  it('defaults the product, needs a team, and submits a harvest with the chosen percent', async () => {
    const wrapper = mount(VegInStation, { global });
    await flushPromises();
    await wrapper.findAll('.plot-card')[0].trigger('click');
    expect(wrapper.find('.selected-hint').text()).toContain('黄瓜');
    await wrapper.find('.test-weight').setValue('12.5');
    const submit = buttonByText(wrapper, '.submit-button', 'confirmIn');
    expect(submit.attributes('disabled')).toBeDefined();
    await buttonByText(wrapper, '.option', '一组').trigger('click');
    await buttonByText(wrapper, '.option', '80%').trigger('click');
    expect(submit.attributes('disabled')).toBeUndefined();
    await submit.trigger('click');
    await flushPromises();
    expect(api.submitVegIn).toHaveBeenCalledWith({
      plantingRecordId: plotA,
      productId: product1,
      weight: '12.500',
      teamIds: [team1],
      perfPercent: 80
    });
    expect(message.success).toHaveBeenCalledWith('vegInSaved');
  });

  it('opens a custom percent input that only accepts 1-99', async () => {
    const wrapper = mount(VegInStation, { global });
    await flushPromises();
    await wrapper.findAll('.plot-card')[0].trigger('click');
    await wrapper.find('.test-weight').setValue('3');
    await buttonByText(wrapper, '.option', '二组').trigger('click');
    expect(wrapper.find('.custom-input').exists()).toBe(false);
    await buttonByText(wrapper, '.option', 'custom').trigger('click');
    await wrapper.find('.custom-input').setValue('100');
    expect(wrapper.find('.field-error').exists()).toBe(true);
    expect(buttonByText(wrapper, '.submit-button', 'confirmIn').attributes('disabled')).toBeDefined();
    await wrapper.find('.custom-input').setValue('45');
    await buttonByText(wrapper, '.submit-button', 'confirmIn').trigger('click');
    await flushPromises();
    expect(api.submitVegIn).toHaveBeenCalledWith(expect.objectContaining({ perfPercent: 45, teamIds: [team2] }));
  });

  it('finish = 0 kg weigh-finish of the selected plot, refused while a weight is pending', async () => {
    const wrapper = mount(VegInStation, { global });
    await flushPromises();
    const finish = buttonByText(wrapper, '.finish-button', 'vegFinishIn');
    expect(finish.attributes('disabled')).toBeDefined();
    await wrapper.findAll('.plot-card')[0].trigger('click');
    await buttonByText(wrapper, '.option', '一组').trigger('click');
    await wrapper.find('.test-weight').setValue('2');
    await finish.trigger('click');
    expect(message.warning).toHaveBeenCalledWith('vegFinishHasWeight');
    expect(api.finishVegIn).not.toHaveBeenCalled();
    await wrapper.find('.test-weight').setValue('');
    await finish.trigger('click');
    await flushPromises();
    expect(messageBox.confirm).toHaveBeenCalled();
    expect(api.finishVegIn).toHaveBeenCalledWith({ plantingRecordId: plotA, teamIds: [team1], perfPercent: 100 });
  });
});

describe('row283 果蔬出库管理', () => {
  const productId = '9261008000000101';
  const fresh = '9261008000000201';
  const shelf = '9261008000000202';
  beforeEach(() => {
    vi.clearAllMocks();
    api.getVegOutProducts.mockResolvedValue({
      data: [
        { productId, productName: '大白菜', plotCount: 1, totalStock: '200' },
        { productId: '9261008000000102', productName: '西红柿', plotCount: 2, totalStock: '150' }
      ]
    });
    api.getVegOutStocks.mockResolvedValue({
      data: [
        {
          productId,
          plotId: 'p1',
          plotCode: 'A-A1西-0-001',
          locationId: fresh,
          locationName: '毛菜鲜品库',
          stockWeight: '120',
          stockIds: ['s1', 's2']
        },
        { productId, locationId: shelf, locationName: '蔬菜保鲜库', stockWeight: '80', stockIds: ['s3'] }
      ]
    });
    api.getVegRecentOutDests.mockResolvedValue({
      data: [
        { value: 'mine', label: '矿山', count: 5 },
        { value: 'retired', label: '旧值', count: 9 }
      ]
    });
    api.submitVegOut.mockResolvedValue({ data: null });
  });

  it('lists products with plot count and total, and plot cards with location plus a no-plot card', async () => {
    const wrapper = mount(VegOutStation, { global });
    await flushPromises();
    const cards = wrapper.findAll('.product-card');
    expect(cards[0].text()).toContain('大白菜');
    expect(cards[0].text()).toContain('1plotUnit');
    expect(cards[0].text()).toContain('200.000 kg');
    const stocks = wrapper.findAll('.stock-card');
    expect(stocks.map((s) => s.text())).toEqual([expect.stringContaining('A-A1西-0-001'), expect.stringContaining('noPlot')]);
    expect(stocks[1].text()).toContain('蔬菜保鲜库');
  });

  it('defaults to warehouse dispatch; a frequent destination syncs the select and submits', async () => {
    const wrapper = mount(VegOutStation, { global });
    await flushPromises();
    expect(buttonByText(wrapper, '.destination-options .option', 'warehouseOut').classes()).toContain('active');
    expect(wrapper.findAll('.recent-destinations .option').map((b) => b.text())).toEqual(['矿山']);
    await wrapper.findAll('.stock-card')[0].trigger('click');
    await wrapper.find('.test-weight').setValue('10');
    const submit = buttonByText(wrapper, '.submit-button', 'confirmOut');
    expect(submit.attributes('disabled')).toBeDefined();
    await buttonByText(wrapper, '.recent-destinations .option', '矿山').trigger('click');
    expect((wrapper.find('.out-dest').element as HTMLSelectElement).value).toBe('mine');
    expect(buttonByText(wrapper, '.recent-destinations .option', '矿山').classes()).toContain('active');
    await submit.trigger('click');
    await flushPromises();
    expect(api.submitVegOut).toHaveBeenCalledWith({ productId, stockIds: ['s1', 's2'], weight: '10.000', destination: 'warehouse', outDest: 'mine' });
    expect(message.success).toHaveBeenCalledWith('vegOutSaved');
  });

  it('pig feed hides the destination select and submits without an out destination', async () => {
    const wrapper = mount(VegOutStation, { global });
    await flushPromises();
    await wrapper.findAll('.stock-card')[1].trigger('click');
    await buttonByText(wrapper, '.destination-options .option', 'pigFeed').trigger('click');
    expect(wrapper.find('.out-dest').exists()).toBe(false);
    await wrapper.find('.test-weight').setValue('3.5');
    await buttonByText(wrapper, '.submit-button', 'confirmOut').trigger('click');
    await flushPromises();
    expect(api.submitVegOut).toHaveBeenCalledWith({ productId, stockIds: ['s3'], weight: '3.500', destination: 'feed' });
  });

  it('blocks weights above the selected card stock', async () => {
    const wrapper = mount(VegOutStation, { global });
    await flushPromises();
    await wrapper.findAll('.stock-card')[1].trigger('click');
    await buttonByText(wrapper, '.destination-options .option', 'pigFeed').trigger('click');
    await wrapper.find('.test-weight').setValue('80.001');
    expect(wrapper.find('.field-error').text()).toBe('overStock');
    expect(buttonByText(wrapper, '.submit-button', 'confirmOut').attributes('disabled')).toBeDefined();
  });

  it('finish dispatch clears the selection without writing anything', async () => {
    const wrapper = mount(VegOutStation, { global });
    await flushPromises();
    await wrapper.findAll('.stock-card')[0].trigger('click');
    await buttonByText(wrapper, '.finish-button', 'vegFinishOut').trigger('click');
    await flushPromises();
    expect(wrapper.findAll('.stock-card.active')).toHaveLength(0);
    expect(api.submitVegOut).not.toHaveBeenCalled();
  });
});
