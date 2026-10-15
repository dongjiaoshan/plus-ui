/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import type { BurnInhouseAdjustVO } from '@/api/djs-warehouse/burnAdjust';

const { listBurnAdjust, adjustBurnInhouseWeight } = vi.hoisted(() => ({ listBurnAdjust: vi.fn(), adjustBurnInhouseWeight: vi.fn() }));
vi.mock('@/api/djs-warehouse/burnAdjust', () => ({ listBurnAdjust, adjustBurnInhouseWeight }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/BizTable/index.vue', () => ({ default: { name: 'BizTable', render: () => null } }));
const BurnAdjust = (await import('./index.vue')).default;

type AdjustRow = BurnInhouseAdjustVO & { marketingWeight?: number | string };
const baseRow: AdjustRow = {
  id: '2089615514926686209',
  productWeight: '30.000',
  arriveWeight: '60.000',
  inboundedWeight: '60.000',
  pendingWeight: '0.000',
  marketingWeight: '100.000',
  burnFinished: 0
};

async function open(row: AdjustRow = baseRow) {
  const wrapper = mount(BurnAdjust, {
    global: {
      directives: { hasPermi: () => undefined },
      stubs: {
        ElDialog: { template: '<div><slot/><slot name="footer"/></div>' },
        ElDescriptions: { template: '<div><slot/></div>' },
        ElDescriptionsItem: { props: ['label'], template: '<div :data-label="label"><slot/></div>' },
        ElForm: { template: '<div><slot/></div>' },
        ElFormItem: { template: '<div><slot/></div>' },
        ElInputNumber: { name: 'ElInputNumber', props: ['modelValue', 'min', 'max', 'disabled'], emits: ['update:modelValue'], template: '<input/>' },
        ElButton: { props: ['disabled'], template: '<button :disabled="disabled"><slot/></button>' },
        ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' }
      }
    }
  });
  (wrapper.vm as unknown as { openAdjust: (row: AdjustRow) => void }).openAdjust(row);
  await flushPromises();
  return wrapper;
}

describe('燎毛间产品重量调整 row279', () => {
  beforeEach(() => {
    listBurnAdjust.mockReset();
    listBurnAdjust.mockResolvedValue({ rows: [], total: 0 });
    adjustBurnInhouseWeight.mockReset();
  });

  it('本行上限按出栏重减去其他累计产品，而非原接收重', async () => {
    const wrapper = await open();
    expect(wrapper.findComponent({ name: 'ElInputNumber' }).props('max')).toBe(70);
    wrapper.unmount();
  });

  it('产品调大、调小即时更新累计接收重', async () => {
    const wrapper = await open();
    const input = wrapper.findComponent({ name: 'ElInputNumber' });
    input.vm.$emit('update:modelValue', 50);
    await flushPromises();
    expect(wrapper.find('[data-label="burnAdjust.field.arriveWeight"]').text()).toBe('80.000 kg');
    input.vm.$emit('update:modelValue', 10);
    await flushPromises();
    expect(wrapper.find('[data-label="burnAdjust.field.arriveWeight"]').text()).toBe('40.000 kg');
    wrapper.unmount();
  });

  it('精确至三位小数的上限不能被浮点误差缩小', async () => {
    const wrapper = await open({ ...baseRow, productWeight: '0.100', inboundedWeight: '0.300', marketingWeight: '0.700' });
    expect(wrapper.findComponent({ name: 'ElInputNumber' }).props('max')).toBe(0.5);
    wrapper.unmount();
  });

  it('缺出栏重量提示补录并禁提交', async () => {
    const wrapper = await open({ ...baseRow, marketingWeight: undefined });
    expect(wrapper.text()).toContain('burnAdjust.rule.marketingWeightRequired');
    expect(
      wrapper
        .findAll('button')
        .find((button) => button.text() === 'common.confirm')
        ?.attributes('disabled')
    ).toBeDefined();
    wrapper.unmount();
  });

  it('其他产品已达出栏重时不能再录正重量', async () => {
    const wrapper = await open({ ...baseRow, inboundedWeight: '140.000' });
    expect(wrapper.findComponent({ name: 'ElInputNumber' }).props('max')).toBe(0);
    expect(wrapper.text()).toContain('burnAdjust.rule.noRemainingWeight');
    expect(
      wrapper
        .findAll('button')
        .find((button) => button.text() === 'common.confirm')
        ?.attributes('disabled')
    ).toBeDefined();
    wrapper.unmount();
  });

  it('累计数据缺失或小于本行时提示刷新，不能按零累计放行', async () => {
    for (const inboundedWeight of [undefined, '20.000']) {
      const wrapper = await open({ ...baseRow, inboundedWeight });
      expect(wrapper.text()).toContain('burnAdjust.rule.inboundWeightUnavailable');
      expect(wrapper.findComponent({ name: 'ElInputNumber' }).props('disabled')).toBe(true);
      wrapper.unmount();
    }
  });

  it('手工输入超过上限或清空时禁止提交', async () => {
    const wrapper = await open();
    const input = wrapper.findComponent({ name: 'ElInputNumber' });
    for (const value of [70.001, undefined, 0]) {
      input.vm.$emit('update:modelValue', value);
      await flushPromises();
      expect(
        wrapper
          .findAll('button')
          .find((button) => button.text() === 'common.confirm')
          ?.attributes('disabled')
      ).toBeDefined();
    }
    wrapper.unmount();
  });
});
