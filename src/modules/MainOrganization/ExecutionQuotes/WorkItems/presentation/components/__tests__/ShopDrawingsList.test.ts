import { afterEach, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import ShopDrawingQuoteModel from '../../../core/models/shop-drawing.model';
import { attachmentGallery } from '@/shared/AttachmentGallery/attachmentGallery';
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

afterEach(() => attachmentGallery.close());
it('groups images, PDFs and CAD files in the shared viewer and clears it on owner change', async () => {
  const fields = {
    id: 1,
    employee: null,
    quote_id: 140,
    project_id: 86,
    title: 'MEP',
    date: null,
    version_number: 'V1',
    custom_number: 1,
    stages: [],
    created_at: null,
  };
  const drawings = ['first.png', 'second.jpg', 'plan.pdf', 'plan.dwg', null].map((name, index) =>
    ShopDrawingQuoteModel.fromJson({
      ...fields,
      id: index + 1,
      file: name ? `https://example.test/${name}` : null,
    }),
  );
  const wrapper = mount(ShopDrawingsList, {
    props: { state: new DataSuccess({ data: drawings }) },
    global: { plugins: [createI18n({ legacy: false, locale: 'en', messages: { en } })] },
  });
  const previews = wrapper.findAll('.work-items-drawing-preview');
  expect(previews).toHaveLength(4);
  expect(previews[1]?.attributes('aria-label')).toContain('MEP');
  await previews[1]?.trigger('click');
  expect(attachmentGallery.visible.value).toBe(true);
  expect(attachmentGallery.activeIndex.value).toBe(1);
  expect(attachmentGallery.attachments.value.map((attachment) => attachment.url)).toEqual([
    'https://example.test/first.png',
    'https://example.test/second.jpg',
    'https://example.test/plan.pdf',
    'https://example.test/plan.dwg',
  ]);
  await previews[2]?.trigger('click');
  expect(attachmentGallery.activeIndex.value).toBe(2);
  expect(attachmentGallery.current.value?.type).toBe('pdf');
  await previews[3]?.trigger('click');
  expect(attachmentGallery.activeIndex.value).toBe(3);
  expect(attachmentGallery.current.value?.type).toBe('file');
  expect(attachmentGallery.current.value?.name).toContain('plan.dwg');
  expect(wrapper.findAll('a')).toHaveLength(4);
  expect(wrapper.findAll('img')).toHaveLength(2);
  await wrapper.get('img').trigger('error');
  expect(wrapper.text()).toContain('Image unavailable');
  await wrapper.setProps({ state: new DataSuccess({ data: [] }) });
  expect(attachmentGallery.visible.value).toBe(false);
  wrapper.unmount();
});
