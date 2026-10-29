/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';

const scaleCfg = vi.hoisted(() => ({ value: null as null | { autoFill: boolean } }));
vi.mock('@/store/modules/scaleConfig', () => ({ useScaleConfigStore: () => scaleCfg.value }));
vi.mock('@element-plus/icons-vue', () => ({ Back: { template: '<i />' } }));
import WeightNumpad from './WeightNumpad.vue';

const render = (props: Record<string, unknown>) =>
  mount(WeightNumpad, { props: { modelValue: undefined, ...props }, global: { stubs: { ElIcon: { template: '<i><slot /></i>' } } } });
const keysShown = (w: ReturnType<typeof render>) => (w.find('.numpad-keys').element as HTMLElement).style.display !== 'none';

describe('V7-R3 keypad collapses while auto-fill is on', () => {
  beforeEach(() => {
    scaleCfg.value = reactive({ autoFill: true });
  });

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
  });
});
