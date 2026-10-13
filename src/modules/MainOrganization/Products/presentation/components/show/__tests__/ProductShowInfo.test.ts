import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import type * as VueI18nModule from 'vue-i18n';
import { describe, expect, it, vi } from 'vitest';

import AttachmentModel from '../../../../core/models/attachment.model';
import ProductsShowModel from '../../../../core/models/products.show.model';
import ProductShowInfo from '../ProductShowInfo.vue';
import { attachmentGallery } from '@/shared/AttachmentGallery/attachmentGallery';

vi.mock('vue-i18n', async (importOriginal) => {
  const vueI18n = await importOriginal<typeof VueI18nModule>();

  return {
    ...vueI18n,
    useI18n: () => ({ locale: ref('en') }),
  };
});

describe('ProductShowInfo', () => {
  it('opens the product attachment in the shared gallery', async () => {
    const product = new ProductsShowModel({
      code: 'P-009',
      quantity: 10,
      attachments: [
        new AttachmentModel({
          id: 3,
          file: 'https://assets.test/specification.pdf',
          type: 2,
        }),
      ],
    });

    const wrapper = mount(ProductShowInfo, {
      props: { product, title: 'Cement' },
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.text()).toContain('#P-009');
    expect(wrapper.text()).toContain('Products.form.quantity');
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('specification.pdf');
    await wrapper.get('.attachment-view-btn').trigger('click');
    expect(attachmentGallery.current.value?.url).toBe('https://assets.test/specification.pdf');
    expect(attachmentGallery.visible.value).toBe(true);
    attachmentGallery.close();
  });
});
