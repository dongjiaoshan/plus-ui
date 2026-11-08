/** @vitest-environment happy-dom */
import { defineComponent, h, ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import TareSelector from './TareSelector.vue';
import { useTare, type TareState } from './useTare';
import type { TarePosition } from '@/api/djs-warehouse/tareSpec';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key.split('.').at(-1) }) }));
vi.mock('@/api/djs-warehouse/tareSpec', () => ({
  listTareOptions: vi.fn(async () => ({ data: [{ id: 'basket', specName: 'Basket', tareWeight: 4, selected: true }] }))
}));

function render(position: TarePosition = 'pig_in') {
  const gross = ref<number | undefined>(11.5);
  let state: TareState;
  const wrapper = mount(
    defineComponent({
      setup() {
        state = useTare(position, gross);
        return () => h(TareSelector, { tare: state });
      }
    })
  );
  return { wrapper, gross, state: () => state! };
}

describe('TAP tare modes', () => {
  it('retains the configured default and original fixed tare arithmetic', async () => {
    const test = render();
    await flushPromises();
    expect(test.state().mode.value).toBe('fixed');
    expect(test.state().net.value).toBe(7.5);
    expect(test.state().weighPayload()).toEqual({ grossWeight: '11.500', tareWeight: '4.000' });
    test.wrapper.unmount();
  });
  it('repeated capture sets the current total as zero and restore reveals actual gross', async () => {
    const test = render();
    await flushPromises();
    const button = (label: string) => test.wrapper.findAll('button').find((b) => b.text() === label)!;
    await button('cumulative').trigger('click');
    expect(test.state().net.value).toBe(11.5);
    await button('capture').trigger('click');
    expect(test.state().net.value).toBe(0);
    test.gross.value = 12.75;
    expect(test.state().net.value).toBe(1.25);
    await button('capture').trigger('click');
    expect(test.state().net.value).toBe(0);
    test.gross.value = 14.025;
    expect(test.state().net.value).toBe(1.275);
    expect(test.state().weighPayload()).toEqual({ grossWeight: '14.025', tareWeight: '12.750' });
    await button('restore').trigger('click');
    expect(test.state().net.value).toBe(14.025);
    expect(test.state().weighPayload().tareWeight).toBe('0.000');
    test.wrapper.unmount();
  });
  it('switching back to fixed restores the selected specification', async () => {
    const test = render();
    await flushPromises();
    test.state().setMode('cumulative');
    test.state().captureTare();
    test.state().setMode('fixed');
    expect(test.state().net.value).toBe(7.5);
    expect(test.state().selectedId.value).toBe('basket');
    test.wrapper.unmount();
  });
  it.each<TarePosition>(['pig_in', 'cut_out', 'veg_out', 'veg_in'])('offers cumulative controls at requested position %s', async (position) => {
    const test = render(position);
    await flushPromises();
    expect(test.wrapper.text()).toContain('TAP');
    test.state().setMode('cumulative');
    await flushPromises();
    expect(test.wrapper.text()).toContain('capture');
    expect(test.wrapper.text()).toContain('restore');
    test.wrapper.unmount();
  });
  it.each<TarePosition>(['bar_pickup', 'bar_cut'])('keeps existing fixed-only controls at %s', async (position) => {
    const test = render(position);
    await flushPromises();
    expect(test.wrapper.text()).not.toContain('cumulative');
    test.state().setMode('cumulative');
    expect(test.state().mode.value).toBe('fixed');
    test.wrapper.unmount();
  });
  it('does not capture invalid or negative readings', async () => {
    const test = render();
    await flushPromises();
    test.state().setMode('cumulative');
    test.gross.value = undefined;
    test.state().captureTare();
    expect(test.state().tareKg.value).toBe(0);
    test.gross.value = -1;
    test.state().captureTare();
    expect(test.state().tareKg.value).toBe(0);
    test.wrapper.unmount();
  });
});
