/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';

interface ScaleCfgMock {
  autoFill: boolean;
  markManualEdit: (v: number | undefined) => void;
}
const scaleCfg = vi.hoisted(() => ({ value: null as null | ScaleCfgMock }));
vi.mock('@/store/modules/scaleConfig', () => ({ useScaleConfigStore: () => scaleCfg.value }));
vi.mock('@element-plus/icons-vue', () => ({ Back: { template: '<i />' } }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key.split('.').pop() }) }));
import WeightNumpad from './WeightNumpad.vue';

const render = (props: Record<string, unknown>) =>
  mount(WeightNumpad, { props: { modelValue: undefined, ...props }, global: { stubs: { ElIcon: { template: '<i><slot /></i>' } } } });
const keysShown = (w: ReturnType<typeof render>) => (w.find('.numpad-keys').element as HTMLElement).style.display !== 'none';
const digit = (w: ReturnType<typeof render>, d: string) => w.findAll('.numpad-key').find((k) => k.text() === d)!;

beforeEach(() => {
  scaleCfg.value = reactive({ autoFill: true, markManualEdit: vi.fn() });
});

describe('V7-R3 keypad collapses while auto-fill is on', () => {
  it('hides the keys but keeps the weight box when auto-fill is on', () => {
    const w = render({ collapseOnAutoFill: true });
    expect(keysShown(w)).toBe(false);
    expect(w.find('.numpad-input').exists()).toBe(true);
  });

  it('shows the keys again as soon as auto-fill is switched off, and they still type', async () => {
    const w = render({ collapseOnAutoFill: true });
    scaleCfg.value!.autoFill = false;
    await w.vm.$nextTick();
    expect(keysShown(w)).toBe(true);
    await w.findAll('.numpad-key')[0].trigger('click');
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([1]);
  });

  it('never collapses a keypad that is not a scale weight entry (box / copy counts)', () => {
    const w = render({ precision: 0 });
    expect(keysShown(w)).toBe(true);
    expect(w.find('.numpad-toggle').exists()).toBe(false);
  });
});

describe('D-0149 展开键盘 while auto-fill stays on', () => {
  it('offers 展开键盘 when collapsed, expands the keys without touching auto-fill, then offers 收起键盘', async () => {
    const w = render({ collapseOnAutoFill: true });
    const toggle = w.find('.numpad-toggle');
    expect(toggle.text()).toBe('expandKeys');
    await toggle.trigger('click');
    expect(keysShown(w)).toBe(true);
    expect(scaleCfg.value!.autoFill).toBe(true);
    expect(w.find('.numpad-toggle').text()).toBe('collapseKeys');
    await w.find('.numpad-toggle').trigger('click');
    expect(keysShown(w)).toBe(false);
  });

  it('has no toggle when auto-fill is off (keys are already open)', async () => {
    scaleCfg.value!.autoFill = false;
    const w = render({ collapseOnAutoFill: true });
    expect(w.find('.numpad-toggle').exists()).toBe(false);
    expect(keysShown(w)).toBe(true);
  });

  it('reports every hand edit of the scale keypad so auto-fill holds it, and never for box / copy keypads', async () => {
    const w = render({ collapseOnAutoFill: true });
    await w.find('.numpad-toggle').trigger('click');
    await digit(w, '7').trigger('click');
    await digit(w, '.').trigger('click');
    await digit(w, '5').trigger('click');
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([7.5]);
    expect(scaleCfg.value!.markManualEdit).toHaveBeenLastCalledWith(7.5);

    const box = render({ precision: 0 });
    await digit(box, '3').trigger('click');
    expect(scaleCfg.value!.markManualEdit).toHaveBeenCalledTimes(3);
  });
});

describe('D-0147 大框显示实重', () => {
  it('shows the net weight with a 实重 label and the gross / tare line, while keys still edit the gross', async () => {
    scaleCfg.value!.autoFill = false;
    const w = render({ modelValue: 50, displayValue: 49, displayLabel: '实重', displayHint: '称重：50.000Kg，去皮：1.000Kg', unit: 'kg' });
    expect(w.find('.numpad-input').exists()).toBe(false);
    expect(w.find('.numpad-net-label').text()).toBe('实重');
    expect(w.find('.numpad-net').text()).toBe('49.000');
    expect(w.find('.numpad-net').classes()).not.toContain('invalid');
    expect(w.find('.numpad-hint').text()).toBe('称重：50.000Kg，去皮：1.000Kg');
    await digit(w, '1').trigger('click');
    // 按键接在称重 50 后面 → 501（称重），不是接在实重上
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([501]);
  });

  it('turns the net red when it is zero or below', () => {
    const w = render({ modelValue: 0.5, displayValue: -0.5, displayLabel: '实重' });
    expect(w.find('.numpad-net').classes()).toContain('invalid');
  });

  it('shows — when nothing has been weighed yet', () => {
    const w = render({ displayValue: undefined, displayLabel: '实重' });
    expect(w.find('.numpad-net').text()).toBe('—');
  });

  it('keeps today’s editable box when no tare is chosen', () => {
    const w = render({ modelValue: 50 });
    expect((w.find('.numpad-input').element as HTMLInputElement).value).toBe('50');
    expect(w.find('.numpad-net').exists()).toBe(false);
    expect(w.find('.numpad-hint').exists()).toBe(false);
  });
});
