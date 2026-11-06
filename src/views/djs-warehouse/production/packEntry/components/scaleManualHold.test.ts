/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

// 秤连接替身：测试直接改读数，模拟秤桥推帧
const scale = vi.hoisted(() => ({ state: null as null | Record<string, unknown> }));
vi.mock('@/composables/useScaleWeight', () => ({ useScaleWeight: () => scale.state }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key.split('.').pop() }) }));
vi.mock('@element-plus/icons-vue', () => ({ Back: { template: '<i />' } }));
import ScaleFillBar from './ScaleFillBar.vue';
import WeightNumpad from './WeightNumpad.vue';
import { useScaleConfigStore } from '@/store/modules/scaleConfig';

function makeScale() {
  return {
    connected: ref(true),
    weightKg: ref<number | null>(10),
    tareWeightKg: ref<number | null>(0),
    isSteady: ref(true),
    unitName: ref('kg'),
    code: ref<number | null>(1),
    lastError: ref(''),
    connect: vi.fn(),
    close: vi.fn(),
    zero: vi.fn(),
    tare: vi.fn()
  };
}

/** 与 9 个称重页同构：同一个 v-model 同时绑 ScaleFillBar（自动填入）和 WeightNumpad（collapse-on-auto-fill） */
const Host = defineComponent({
  setup() {
    const weight = ref<number | undefined>(undefined);
    return { weight };
  },
  render() {
    return h('div', [
      h(ScaleFillBar, { modelValue: this.weight, inGram: false, 'onUpdate:modelValue': (v: number | undefined) => (this.weight = v) }),
      h(WeightNumpad, {
        modelValue: this.weight,
        unit: 'kg',
        precision: 3,
        collapseOnAutoFill: true,
        'onUpdate:modelValue': (v: number | undefined) => (this.weight = v)
      })
    ]);
  }
});

const stubs = { ElTooltip: { template: '<span><slot /></span>' }, ElSwitch: true, ElIcon: { template: '<i><slot /></i>' } };
const settle = async (w: ReturnType<typeof mount>) => {
  await w.vm.$nextTick();
  await w.vm.$nextTick();
};
const key = (w: ReturnType<typeof mount>, d: string) => w.findAll('.numpad-key').find((k) => k.text() === d)!;
const shown = (w: ReturnType<typeof mount>) => (w.find('.numpad-input').element as HTMLInputElement).value;

let s: ReturnType<typeof makeScale>;
beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  s = makeScale();
  scale.state = s;
});

describe('D-0149 hand edit with auto-fill on: only a new scale reading overwrites it', () => {
  async function typedOver() {
    const w = mount(Host, { global: { stubs } });
    await settle(w);
    expect(shown(w)).toBe('10'); // 自动填入镜像秤读数
    await w.find('.numpad-toggle').trigger('click');
    await w.find('.numpad-back').trigger('click'); // 退格两次清掉 "10"
    await w.find('.numpad-back').trigger('click');
    await key(w, '8').trigger('click');
    await key(w, '.').trigger('click');
    await key(w, '2').trigger('click');
    await settle(w);
    return w;
  }

  it('keeps the typed value while the scale reading does not change (including repeated identical frames)', async () => {
    const w = await typedOver();
    expect(shown(w)).toBe('8.2');
    expect((w.vm as unknown as { weight: number }).weight).toBe(8.2);
    s.weightKg.value = 10; // 同值帧：不触发覆盖
    s.isSteady.value = false;
    s.isSteady.value = true;
    await settle(w);
    expect(shown(w)).toBe('8.2');
    expect(useScaleConfigStore().autoFill).toBe(true);
  });

  it('lets the next different scale reading take over again', async () => {
    const w = await typedOver();
    s.weightKg.value = 12.345;
    await settle(w);
    expect(shown(w)).toBe('12.345');
  });

  it('a programmatic clear (card switch / after submit) still refills from the scale', async () => {
    const w = await typedOver();
    (w.vm as unknown as { weight: number | undefined }).weight = undefined;
    await settle(w);
    expect(shown(w)).toBe('10');
  });

  it('without a hand edit the box keeps mirroring the scale as before', async () => {
    const w = mount(Host, { global: { stubs } });
    await settle(w);
    s.weightKg.value = 3.5;
    await settle(w);
    expect(shown(w)).toBe('3.5');
  });
});
