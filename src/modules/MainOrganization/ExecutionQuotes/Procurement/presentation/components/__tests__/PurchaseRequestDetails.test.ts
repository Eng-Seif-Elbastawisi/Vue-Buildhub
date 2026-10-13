import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PurchaseRequestDetails from '../PurchaseRequestDetails.vue';
import PurchaseRequestModel from '../../../core/models/purchase-request.model';
import { requestRecord } from '../../../__tests__/fixtures';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
it.each(['en', 'ar'])(
  'renders read-only fetched details without invented actions in %s',
  (locale) => {
    const localization = createI18n({ legacy: false, locale, messages: { en, ar } });
    const wrapper = mount(PurchaseRequestDetails, {
      props: { request: PurchaseRequestModel.fromJson(requestRecord()) },
      global: { plugins: [localization], mocks: { $t: localization.global.t } },
    });
    expect(wrapper.text()).toContain('Creator');
    expect(wrapper.text()).toContain('Responsible Employee');
    expect(wrapper.text()).toContain('Main Stage');
    expect(wrapper.text()).toContain('Material Title');
    expect(wrapper.text()).toContain('10.00');
    expect(wrapper.findAll('button')).toHaveLength(0);
    expect(wrapper.text()).not.toContain('procurement.');
    wrapper.unmount();
  },
);
