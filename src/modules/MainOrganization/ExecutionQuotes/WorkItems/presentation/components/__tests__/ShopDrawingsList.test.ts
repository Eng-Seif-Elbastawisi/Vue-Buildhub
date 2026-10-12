import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import ShopDrawingQuoteModel from '../../../core/models/shop-drawing.model';
import ShopDrawingsList from '../ShopDrawingsList.vue';
it.each(['en', 'ar'])('shows backend revisions and safe file action in %s', (locale) => {
  const drawing = ShopDrawingQuoteModel.fromJson({
    id: 1,
    employee: { id: 1, name: 'Creator', type: 1 },
    quote_id: 140,
    project_id: 86,
    title: 'MEP',
    date: null,
    version_number: 'V1',
    file: 'https://example.test/drawing.pdf',
    custom_number: 1,
    stages: [{ id: 7, stage: { id: 129, title: 'Main' }, sub_stage: null }],
    created_at: null,
  });
  const wrapper = mount(ShopDrawingsList, {
    props: { state: new DataSuccess({ data: [drawing] }) },
    global: { plugins: [createI18n({ legacy: false, locale, messages: { en, ar } })] },
  });
  expect(wrapper.get('h3').text()).toBe('MEP');
  expect(wrapper.text()).toContain('V1');
  expect(wrapper.get('a').attributes('href')).toBe(drawing.file);
  expect(wrapper.get('a').attributes('rel')).toBe('noopener noreferrer');
  wrapper.unmount();
});
it.each([null, 'javascript:alert(1)'])(
  'has no active link for missing or unsafe file %s',
  (file) => {
    const drawing = ShopDrawingQuoteModel.fromJson({
      ...{
        id: 1,
        employee: { id: 1, name: 'Creator', type: 1 },
        quote_id: 140,
        project_id: 86,
        title: 'MEP',
        date: null,
        version_number: 'V1',
        file: 'https://example.test/drawing.pdf',
        custom_number: 1,
        stages: [{ id: 7, stage: { id: 129, title: 'Main' }, sub_stage: null }],
        created_at: null,
      },
      file,
    });
    const wrapper = mount(ShopDrawingsList, {
      props: { state: new DataSuccess({ data: [drawing] }) },
      global: { plugins: [createI18n({ legacy: false, locale: 'en', messages: { en } })] },
    });
    expect(wrapper.find('a').exists()).toBe(false);
    wrapper.unmount();
  },
);
