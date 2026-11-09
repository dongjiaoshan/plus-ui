/** @vitest-environment happy-dom */
import { defineComponent, h, ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import TareSelector from './TareSelector.vue';
import WeightNumpad from './WeightNumpad.vue';
vi.mock('@/store/modules/scaleConfig', () => ({ useScaleConfigStore: () => ({ autoFill: false, markManualEdit: vi.fn() }) }));
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

describe('Tare mode tabs', () => {
  it('retains the configured default and original fixed tare arithmetic', async () => {
    const test = render();
    await flushPromises();
    expect(test.state().mode.value).toBe('cumulative');
    test.state().setMode('fixed');
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
    expect(test.wrapper.text()).toContain('mode');
    expect(test.wrapper.findAll('[role=tab]')).toHaveLength(2);
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

// Exercise the actual composed controls: keyboard edits and scale reads share a gross model.
it('starts a fresh net entry after each capture without adding tare to scale readings', async () => {
  const gross = ref<number | undefined>(50);
  let tare: TareState;
  const wrapper = mount(
    defineComponent({
      setup() {
        tare = useTare('pig_in', gross);
        return () =>
          h('div', [
            h(WeightNumpad, {
              modelValue: gross.value,
              ...tare.numpadProps.value,
              'onUpdate:modelValue': (value: number | undefined) => {
                gross.value = value;
              }
            }),
            h(TareSelector, { tare })
          ]);
      }
    }),
    { global: { stubs: { ElIcon: { template: '<i><slot /></i>' } } } }
  );
  await flushPromises();
  const action = (text: string) => wrapper.findAll('.tare-actions button').find((b) => b.text() === text)!;
  const digit = (text: string) => wrapper.findAll('.numpad-key').find((b) => b.text() === text)!;
  await action('capture').trigger('click');
  await digit('2').trigger('click');
  expect(gross.value).toBe(52);
  expect(tare!.net.value).toBe(2);
  expect(tare!.weighPayload()).toEqual({ grossWeight: '52.000', tareWeight: '50.000' });
  await digit('.').trigger('click');
  await digit('5').trigger('click');
  expect(gross.value).toBe(52.5);
  gross.value = 60; // Scale mirror is still the total gross, without a second offset.
  await flushPromises();
  expect(tare!.net.value).toBe(10);
  await action('capture').trigger('click');
  await action('capture').trigger('click');
  await digit('3').trigger('click');
  expect(gross.value).toBe(63);
  expect(tare!.net.value).toBe(3);
  await action('restore').trigger('click');
  expect(tare!.net.value).toBe(63);
  expect(tare!.weighPayload().tareWeight).toBe('0.000');
  wrapper.unmount();
});
