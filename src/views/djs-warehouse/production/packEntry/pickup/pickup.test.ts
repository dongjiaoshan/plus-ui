/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { reactive, ref } from 'vue';

const api = vi.hoisted(() => ({ listPickupItems: vi.fn(), submitPickup: vi.fn(), submitWhiteBarOut: vi.fn(), submitWarehouseOut: vi.fn() }));
const tareApi = vi.hoisted(() => ({ listTareOptions: vi.fn() }));
const weighing = vi.hoisted(() => ({ confirmWeighing: vi.fn() }));
vi.mock('@/api/djs-warehouse/packEntry', () => api);
vi.mock('@/api/djs-warehouse/tareSpec', () => tareApi);
vi.mock('../components/confirmWeighing', () => weighing);
vi.mock('@/utils/request', () => ({
  default: () => Promise.resolve({ data: [{ storeId: 's1', storeName: 'QA门店', demandQty: 1 }] })
}));
vi.mock('@/store/modules/scaleConfig', () => ({ useScaleConfigStore: () => reactive({ autoFill: false }) }));
vi.mock('../useOptions', () => ({ usePackEntryOptions: () => ({ sources: ref([]), loadSources: () => Promise.resolve() }) }));
vi.mock('../_preview', () => ({ PREVIEW_BADGE: '', blockSubmitInPreview: () => false, isPreviewMode: () => false, previewBars: () => [] }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key.split('.').pop() }) }));
vi.mock('element-plus', async (original) => ({
  ...(await original<typeof import('element-plus')>()),
  ElMessage: { success: vi.fn() },
  ElNotification: { warning: vi.fn() }
}));
vi.mock('../components/ScaleFillBar.vue', () => ({ default: { template: '<span />' } }));
vi.mock('../components/WeightNumpad.vue', () => ({
  default: {
    props: ['modelValue', 'displayValue', 'displayLabel', 'displayHint'],
    emits: ['update:modelValue'],
    template:
      '<div><input class="test-weight" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" /><p v-if="displayLabel" class="test-net">{{ displayLabel }} {{ displayValue }}</p></div>'
  }
}));
vi.mock('../components/DestToggle.vue', () => ({
  default: {
    props: ['modelValue', 'options'],
    emits: ['update:modelValue'],
    template:
      '<div><button v-for="o in options" :key="o.value" class="test-dest" @click="$emit(\'update:modelValue\', o.value)">{{ o.value }}</button></div>'
  }
}));
import PickupPage from './index.vue';

const render = () =>
  mount(PickupPage, {
    global: {
      directives: { loading: {} },
      config: { globalProperties: { useDict: () => reactive({ djs_stock_out_dest: [{ value: 'kitchen', label: '食堂' }] }) } as never },
      stubs: {
        ElButton: { template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>' },
        ElIcon: { template: '<i />' },
        ElSelect: {
          props: ['modelValue'],
          emits: ['update:modelValue'],
          template: '<select class="test-select" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>'
        },
        ElOption: { props: ['value', 'label'], template: '<option :value="value">{{ label }}</option>' }
      }
    }
  });

beforeEach(() => {
  vi.clearAllMocks();
  api.listPickupItems.mockResolvedValue({ data: [{ barInfoId: 'b1', inhouseId: 'i1', barId: 'B1', earNo: 'E1', productWeight: 60 }] });
  api.submitPickup.mockResolvedValue({ data: 1 });
  api.submitWhiteBarOut.mockResolvedValue({ data: null });
  api.submitWarehouseOut.mockResolvedValue({ data: null });
  tareApi.listTareOptions.mockResolvedValue({ data: [{ id: 't1', specName: '挂钩', tareWeight: '1.500', selected: true }] });
  weighing.confirmWeighing.mockResolvedValue('confirm');
});

async function weigh(dest: 'cut' | 'ship' | 'warehouse') {
  const w = render();
  await flushPromises();
  await w.find('.bar-card').trigger('click');
  await w.find('.test-weight').setValue('51.5');
  await w
    .findAll('.test-dest')
    .find((b) => b.text() === dest)!
    .trigger('click');
  if (dest !== 'cut') {
    await flushPromises();
    await w.find('.test-select').setValue(dest === 'ship' ? 's1' : 'kitchen');
  }
  await w
    .findAll('.el-button')
    .find((b) => b.text() === 'confirmPickup')!
    .trigger('click');
  await flushPromises();
  return w;
}

describe('D-0147 白条出库领用：大框显示实重，三种去向都另存称重 / 皮重', () => {
  it('shows the net weight in the weight box', async () => {
    const w = render();
    await flushPromises();
    await w.find('.test-weight').setValue('51.5');
    expect(w.find('.test-net').text()).toBe('net 50');
  });
  it('分割车间', async () => {
    await weigh('cut');
    expect(api.submitPickup).toHaveBeenCalledWith({ barInfoId: 'b1', inhouseId: 'i1', pickupWeight: 50, grossWeight: '51.500', tareWeight: '1.500' });
  });
  it('发货月台', async () => {
    await weigh('ship');
    expect(api.submitWhiteBarOut).toHaveBeenCalledWith({
      sourceInhouseId: 'i1',
      productWeight: 50,
      storeId: 's1',
      grossWeight: '51.500',
      tareWeight: '1.500'
    });
  });
  it('仓库出库', async () => {
    await weigh('warehouse');
    expect(api.submitWarehouseOut).toHaveBeenCalledWith({
      sourceInhouseId: 'i1',
      productWeight: 50,
      outDest: 'kitchen',
      grossWeight: '51.500',
      tareWeight: '1.500'
    });
  });
});
