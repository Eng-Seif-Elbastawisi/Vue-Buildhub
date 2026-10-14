import { afterEach, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import Details from '../PurchaseOrderDetails.vue';
import Model from '../../../core/models/purchase.order.model';
import { orderRecord } from '../../../__tests__/order-fixtures';
import { attachmentGallery } from '@/shared/AttachmentGallery/attachmentGallery';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
afterEach(() => attachmentGallery.close());
function mountDetails(locale: string, file: string | null) {
  const localization = createI18n({ legacy: false, locale, messages: { en, ar } });
  return mount(Details, {
    props: { order: Model.fromJson({ ...orderRecord(), file }) },
    global: { plugins: [PrimeVue, localization], mocks: { $t: localization.global.t } },
  });
}
it.each(['en', 'ar'])(
  'renders confirmed read-only details in %s and opens the shared gallery with the URL',
  async (locale) => {
    const wrapper = mountDetails(locale, 'https://example.com/order.pdf');
    expect(wrapper.attributes('dir')).toBe(locale === 'ar' ? 'rtl' : 'ltr');
    expect(wrapper.text()).toContain('1500.00');
    expect(wrapper.text()).toContain('Supplier 3');
    expect(wrapper.text()).toContain('Techlab Employee');
    expect(wrapper.text()).toContain(locale === 'ar' ? 'غير مدفوع' : 'Not Paid');
    expect(wrapper.get('.procurement-status').text()).toBe(
      (locale === 'ar' ? ar : en)['procurement.confirmed'],
    );
    await wrapper.get('button').trigger('click');
    expect(attachmentGallery.visible.value).toBe(true);
    expect(attachmentGallery.current.value?.url).toBe('https://example.com/order.pdf');
    expect(wrapper.findAll('button')).toHaveLength(1);
  },
);
it('has no attachment action or empty preview for null or unsafe URLs', () => {
  for (const file of [null, 'javascript:alert(1)']) {
    const wrapper = mountDetails('en', file);
    expect(wrapper.find('button').exists()).toBe(false);
    expect(attachmentGallery.visible.value).toBe(false);
  }
});
