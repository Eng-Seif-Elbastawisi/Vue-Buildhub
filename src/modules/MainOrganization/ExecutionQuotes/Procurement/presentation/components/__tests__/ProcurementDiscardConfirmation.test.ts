import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import ProcurementDiscardConfirmation from '../ProcurementDiscardConfirmation.vue';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

it.each(['en', 'ar'] as const)('offers accessible leave choices in %s', async (locale) => {
  const wrapper = mount(ProcurementDiscardConfirmation, {
    props: { visible: true },
    global: {
      plugins: [createI18n({ legacy: false, locale, messages: { en, ar } })],
      stubs: { Dialog: { template: '<section><slot /></section>' } },
    },
  });
  expect(wrapper.findAll('button')).toHaveLength(2);
  expect(wrapper.findAll('button').every((button) => button.attributes('type') === 'button')).toBe(
    true,
  );
  await wrapper.findAll('button')[0]?.trigger('click');
  await wrapper.findAll('button')[1]?.trigger('click');
  expect(wrapper.emitted('keep')).toHaveLength(1);
  expect(wrapper.emitted('discard')).toHaveLength(1);
  wrapper.unmount();
});
