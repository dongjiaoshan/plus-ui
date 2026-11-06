/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';

const api = vi.hoisted(() => ({ listCuttable: vi.fn(), submitCutOut: vi.fn(), submitCutDone: vi.fn() }));
const tareApi = vi.hoisted(() => ({ listTareOptions: vi.fn() }));
const weighing = vi.hoisted(() => ({ confirmWeighing: vi.fn() }));
vi.mock('@/api/djs-warehouse/packEntry', () => api);
vi.mock('@/api/djs-warehouse/tareSpec', () => tareApi);
vi.mock('@/api/djs-warehouse/product', () => ({
  listProduct: () => Promise.resolve({ rows: [{ id: 'p1', productName: '五花肉' }] })
}));
vi.mock('../components/confirmWeighing', () => weighing);
vi.mock('../useOptions', () => ({
  usePackEntryOptions: () => ({
    locations: ref([{ id: 'loc1', locationName: '猪肉鲜品库' }]),
    locationLoading: ref(false),
    loadLocations: () => Promise.resolve()
  })
}));
vi.mock('../_preview', () => ({
  PREVIEW_BADGE: '',
  blockSubmitInPreview: () => false,
  isPreviewMode: () => false,
  previewCutProducts: () => [],
  previewCuttable: () => []
}));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key.split('.').pop() }) }));
vi.mock('element-plus', async (original) => ({
  ...(await original<typeof import('element-plus')>()),
  ElMessage: { success: vi.fn() },
  ElNotification: { warning: vi.fn() }
}));
vi.mock('../components/ScaleFillBar.vue', () => ({ default: { template: '<span />' } }));
vi.mock('../components/ProductCardGrid.vue', () => ({
  default: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<button class="test-product" @click="$emit(\'update:modelValue\', \'p1\')" />'
  }
}));
vi.mock('../components/WeightNumpad.vue', () => ({
  default: {
    props: ['modelValue', 'displayValue', 'displayLabel', 'displayHint'],
    emits: ['update:modelValue'],
    template:
      '<div><input class="test-weight" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" /><p v-if="displayLabel" class="test-net">{{ displayLabel }} {{ displayValue }} | {{ displayHint }}</p></div>'
  }
}));
import CutPage from './index.vue';

const render = () =>
  mount(CutPage, {
    global: {
      directives: { loading: {} },
      stubs: {
        ElButton: { template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>' },
        ElIcon: { template: '<i />' },
        ElDialog: true,
        DestToggle: true
      }
    }
  });

beforeEach(() => {
  vi.clearAllMocks();
  api.listCuttable.mockResolvedValue({
    data: [
      { id: 1, cutId: 'CUT-1', barId: 'B1', earNo: '01-01-2-251026-010', ageDays: 400, remainingWeight: 60, isHalf: 0, cutStatus: 'cutting' },
      { id: 2, cutId: 'CUT-2', barId: 'B2', earNo: '01-01-2-251026-011', ageDays: 365, remainingWeight: 60, isHalf: 0, cutStatus: 'cutting' },
      { id: 3, cutId: 'CUT-3', barId: 'B3', markId: 'WG-1', ageDays: null, remainingWeight: 60, isHalf: 0, cutStatus: 'cutting' }
    ]
  });
  api.submitCutOut.mockResolvedValue({ data: null });
  tareApi.listTareOptions.mockResolvedValue({ data: [] });
  weighing.confirmWeighing.mockResolvedValue('confirm');
});

describe('V7 第35行 白条分割管理卡片日龄', () => {
  it('shows the age as 「400天」 without the word 日龄, and nothing when it is unknown', async () => {
    const w = render();
    await flushPromises();
    const chips = w.findAll('.cut-chip');
    expect(chips[0].find('.chip-age').text()).toBe('400dayUnit');
    expect(chips[1].find('.chip-age').text()).toBe('365dayUnit');
    expect(chips[2].find('.chip-age').exists()).toBe(false);
  });

  it('marks only bars older than 365 days, both unselected and selected', async () => {
    const w = render();
    await flushPromises();
    const chips = () => w.findAll('.cut-chip');
    // 默认选最早一条（CUT-1，超龄）
    expect(chips()[0].classes()).toEqual(expect.arrayContaining(['over-age', 'active']));
    expect(chips()[1].classes()).not.toContain('over-age');
    expect(chips()[2].classes()).not.toContain('over-age');
    await chips()[1].trigger('click');
    expect(chips()[0].classes()).toContain('over-age');
    expect(chips()[0].classes()).not.toContain('active');
  });
});

describe('D-0147 白条分割管理称重', () => {
  it('shows the net in the weight box and stores gross / tare alongside the net weight', async () => {
    tareApi.listTareOptions.mockResolvedValue({ data: [{ id: 't1', specName: '托盘', tareWeight: '0.350', selected: true }] });
    const w = render();
    await flushPromises();
    expect(tareApi.listTareOptions).toHaveBeenCalledWith('bar_cut');
    await w.find('.test-product').trigger('click');
    await w.find('.test-weight').setValue('5.6');
    expect(w.find('.test-net').text()).toBe('net 5.25 | gross：5.600Kg，tareWeight：0.350Kg');
    const submit = w.findAll('.el-button').find((b) => b.text() === 'confirmCutOut')!;
    await submit.trigger('click');
    await flushPromises();
    expect(weighing.confirmWeighing).toHaveBeenCalledWith(expect.objectContaining({ gross: 5.6, tare: 0.35, net: 5.25 }));
    expect(api.submitCutOut).toHaveBeenCalledWith({
      cutRecordId: 1,
      locationId: 'loc1',
      partItems: [{ productId: 'p1', productWeight: 5.25, grossWeight: '5.600', tareWeight: '0.350' }]
    });
  });

  it('without tare keeps the editable box and stores tare 0.000', async () => {
    const w = render();
    await flushPromises();
    await w.find('.test-product').trigger('click');
    await w.find('.test-weight').setValue('5.6');
    expect(w.find('.test-net').exists()).toBe(false);
    await w
      .findAll('.el-button')
      .find((b) => b.text() === 'confirmCutOut')!
      .trigger('click');
    await flushPromises();
    expect(api.submitCutOut.mock.calls[0][0].partItems[0]).toEqual({
      productId: 'p1',
      productWeight: 5.6,
      grossWeight: '5.600',
      tareWeight: '0.000'
    });
  });
});
