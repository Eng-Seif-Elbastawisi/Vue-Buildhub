import { flushPromises, mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import AttachmentGallery from './AttachmentGallery.vue';
import { attachmentGallery } from './attachmentGallery';

const group = [
  { url: 'https://cdn.example.com/photo.jpg', name: 'photo.jpg' },
  { url: 'https://cdn.example.com/manual.pdf', name: 'manual.pdf' },
  { url: 'https://cdn.example.com/archive.zip', name: 'archive.zip' },
];

const mountGallery = () =>
  mount(AttachmentGallery, {
    attachTo: document.body,
    global: { plugins: [PrimeVue, ToastService], stubs: { Teleport: true, Transition: true } },
  });

beforeEach(() => {
  attachmentGallery.close();
  document.body.innerHTML = '';
});

describe('AttachmentGallery', () => {
  it('shows the selected image and navigates the group', async () => {
    const wrapper = mountGallery();
    attachmentGallery.open(group, 0);
    await nextTick();

    expect(wrapper.find('img[alt="photo.jpg"]').exists()).toBe(true);
    await wrapper.get('button[aria-label="Next"]').trigger('click');
    await nextTick();
    expect(wrapper.text()).toContain('2 / 3');
    expect(wrapper.find('iframe[title="manual.pdf"]').exists()).toBe(true);
    await wrapper.get('button[aria-label="Previous"]').trigger('click');
    await nextTick();
    expect(wrapper.text()).toContain('1 / 3');
    wrapper.unmount();
  });

  it('shows a file placeholder when an image cannot load', async () => {
    attachmentGallery.open(group, 0);
    const wrapper = mountGallery();
    await nextTick();

    await wrapper.get('.attachment-gallery__stage img').trigger('error');
    expect(wrapper.find('.attachment-gallery__stage img').exists()).toBe(false);
    expect(wrapper.text()).toContain('Preview not available');
    wrapper.unmount();
  });

  it('shows an unsupported file fallback and closes without navigation', async () => {
    attachmentGallery.open(group, 2);
    const wrapper = mountGallery();
    await nextTick();

    expect(wrapper.text()).toContain('Preview not available');
    expect(wrapper.text()).toContain('archive.zip');
    await wrapper.get('button[aria-label="Close"]').trigger('click');
    expect(attachmentGallery.visible.value).toBe(false);
    wrapper.unmount();
  });

  it('uses native controls for a video without autoplay', async () => {
    attachmentGallery.open([{ url: 'https://cdn.example.com/clip.mp4', name: 'clip.mp4' }], 0);
    const wrapper = mountGallery();
    await nextTick();

    const video = wrapper.get('video');
    expect(video.attributes('controls')).toBeDefined();
    expect(video.attributes('autoplay')).toBeUndefined();
    wrapper.unmount();
  });

  it('copies and downloads the currently selected PDF while staying open', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    let downloadedLink: { href: string; download: string; target: string } | undefined;
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      downloadedLink = { href: this.href, download: this.download, target: this.target };
    });
    attachmentGallery.open(group, 1);
    const wrapper = mountGallery();

    try {
      await nextTick();
      await wrapper.get('button[aria-label="Copy link"]').trigger('click');
      await wrapper.get('button[aria-label="Download attachment"]').trigger('click');
      await flushPromises();

      expect(writeText).toHaveBeenCalledWith(group[1]?.url);
      expect(downloadedLink).toEqual({
        href: group[1]?.url,
        download: 'manual.pdf',
        target: '',
      });
      expect(attachmentGallery.visible.value).toBe(true);
    } finally {
      clickSpy.mockRestore();
      vi.unstubAllGlobals();
      wrapper.unmount();
    }
  });

  it('shows the existing error toast when starting the download fails', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('Click failed');
    });
    attachmentGallery.open(group, 1);
    const wrapper = mountGallery();
    const toastSpy = vi.spyOn(wrapper.vm.$toast, 'add');

    try {
      await nextTick();
      await wrapper.get('button[aria-label="Download attachment"]').trigger('click');
      await flushPromises();

      expect(toastSpy).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Could not download the attachment',
        life: 3000,
      });
      expect(attachmentGallery.visible.value).toBe(true);
    } finally {
      toastSpy.mockRestore();
      clickSpy.mockRestore();
      wrapper.unmount();
    }
  });

  it('reverses arrow navigation in Arabic and keeps content in RTL', async () => {
    attachmentGallery.open(group, 1);
    const wrapper = mountGallery();
    await nextTick();
    wrapper.vm.$i18n.locale = 'ar';
    await nextTick();
    expect(wrapper.get('.attachment-gallery').attributes('dir')).toBe('rtl');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await nextTick();
    expect(wrapper.text()).toContain('3 / 3');
    wrapper.vm.$i18n.locale = 'en';
    wrapper.unmount();
  });
});
