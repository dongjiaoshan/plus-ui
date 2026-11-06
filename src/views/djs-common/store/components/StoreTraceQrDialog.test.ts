/** @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import type { ComponentCustomProperties } from 'vue';

/**
 * 门店猪只追溯码弹框（V7 row40）：二维码内容 = 门店级固定 URL `<trace 域名>/trace/store/<门店编码>`，
 * trace 域名按 admin 域名派生（与追溯贴纸同一个 buildTraceUrl）；复制链接 / 下载二维码图片。
 */

const { toDataURL, saveAs } = vi.hoisted(() => ({
  toDataURL: vi.fn(async (url: string) => `data:image/png;base64,QR(${url})`),
  saveAs: vi.fn()
}));
vi.mock('qrcode', () => ({ default: { toDataURL } }));
vi.mock('file-saver', () => ({ default: { saveAs } }));
vi.mock('@/api/trace', () => ({ getPublicTrace: vi.fn() }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const StoreTraceQrDialog = (await import('./StoreTraceQrDialog.vue')).default;

const modal = { msgSuccess: vi.fn(), msgError: vi.fn() };

type DialogVm = { open: (target: { storeName?: string; storeCode?: string }) => Promise<void> };

async function openDialog(target: { storeName?: string; storeCode?: string }) {
  const wrapper = mount(StoreTraceQrDialog, {
    global: {
      // 组件经 getCurrentInstance().proxy.$modal 取提示，只有 globalProperties 能挂到 proxy 上
      config: { globalProperties: { $modal: modal } as unknown as ComponentCustomProperties },
      stubs: {
        ElDialog: { template: '<div class="dlg"><slot/><slot name="footer"/></div>' },
        ElDescriptions: { template: '<div><slot/></div>' },
        ElDescriptionsItem: { props: ['label'], template: '<div :data-label="label"><slot/></div>' },
        ElInput: { props: ['modelValue'], template: '<input class="link" :value="modelValue" readonly/>' },
        ElButton: { props: ['disabled'], emits: ['click'], template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot/></button>' }
      }
    }
  });
  await (wrapper.vm as unknown as DialogVm).open(target);
  await flushPromises();
  return wrapper;
}

function setHost(url: string) {
  (window as unknown as { happyDOM: { setURL: (u: string) => void } }).happyDOM.setURL(url);
}

describe('门店猪只追溯码弹框', () => {
  beforeEach(() => {
    toDataURL.mockClear();
    saveAs.mockClear();
    modal.msgSuccess.mockClear();
    modal.msgError.mockClear();
  });

  it('staging admin → trace-staging 域名的门店固定 URL，二维码 encode 的就是这个 URL', async () => {
    setHost('https://admin-staging.dongjiaoshan.com/system/store');
    const wrapper = await openDialog({ storeName: '东角山静安体验店', storeCode: 'ST0004' });

    const url = 'https://trace-staging.dongjiaoshan.com/trace/store/ST0004';
    expect((wrapper.find('input.link').element as HTMLInputElement).value).toBe(url);
    expect(toDataURL).toHaveBeenCalledTimes(1);
    expect(toDataURL.mock.calls[0][0]).toBe(url);
    expect(wrapper.find('img').attributes('src')).toBe(`data:image/png;base64,QR(${url})`);
    expect(wrapper.find('[data-label="store.traceQr.storeName"]').text()).toBe('东角山静安体验店');
    expect(wrapper.find('[data-label="store.traceQr.storeCode"]').text()).toBe('ST0004');
    wrapper.unmount();
  });

  it('prod admin → trace 生产域名（不带 -staging）', async () => {
    setHost('https://admin.dongjiaoshan.com/system/store');
    const wrapper = await openDialog({ storeName: 'A', storeCode: 'ST0001' });
    expect((wrapper.find('input.link').element as HTMLInputElement).value).toBe('https://trace.dongjiaoshan.com/trace/store/ST0001');
    wrapper.unmount();
  });

  it('复制链接：写入剪贴板并提示成功；剪贴板不可用时提示失败', async () => {
    setHost('https://admin-staging.dongjiaoshan.com/system/store');
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const wrapper = await openDialog({ storeName: 'A', storeCode: 'ST0004' });

    await wrapper.findAll('button')[0].trigger('click');
    await flushPromises();
    expect(writeText).toHaveBeenCalledWith('https://trace-staging.dongjiaoshan.com/trace/store/ST0004');
    expect(modal.msgSuccess).toHaveBeenCalledWith('store.traceQr.copied');

    writeText.mockRejectedValueOnce(new Error('denied'));
    await wrapper.findAll('button')[0].trigger('click');
    await flushPromises();
    expect(modal.msgError).toHaveBeenCalledWith('store.traceQr.copyFailed');
    wrapper.unmount();
  });

  it('下载二维码：保存二维码 PNG，文件名带门店名与编码', async () => {
    setHost('https://admin-staging.dongjiaoshan.com/system/store');
    const wrapper = await openDialog({ storeName: '东角山静安体验店', storeCode: 'ST0004' });

    await wrapper.findAll('button')[1].trigger('click');
    expect(saveAs).toHaveBeenCalledTimes(1);
    expect(saveAs.mock.calls[0][0]).toBe('data:image/png;base64,QR(https://trace-staging.dongjiaoshan.com/trace/store/ST0004)');
    expect(saveAs.mock.calls[0][1]).toBe('东角山静安体验店-ST0004-store.title.traceQr.png');
    wrapper.unmount();
  });

  it('门店没有编码：不生成链接和二维码，两个按钮都禁用', async () => {
    const wrapper = await openDialog({ storeName: 'A', storeCode: '' });
    expect(toDataURL).not.toHaveBeenCalled();
    expect(wrapper.find('img').exists()).toBe(false);
    const buttons = wrapper.findAll('button');
    expect(buttons[0].attributes('disabled')).toBeDefined();
    expect(buttons[1].attributes('disabled')).toBeDefined();
    wrapper.unmount();
  });
});
