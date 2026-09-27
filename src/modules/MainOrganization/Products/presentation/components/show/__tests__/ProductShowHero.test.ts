import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import type * as VueI18nModule from 'vue-i18n';
import { describe, expect, it, vi } from 'vitest';

import AttachmentModel from '../../../../core/models/attachment.model';
import ProductsShowModel from '../../../../core/models/products.show.model';
import ProductShowHero from '../ProductShowHero.vue';

vi.mock('vue-i18n', async (importOriginal) => {
  const vueI18n = await importOriginal<typeof VueI18nModule>();

  return {
    ...vueI18n,
    useI18n: () => ({ locale: ref('en') }),
  };
});

describe('ProductShowHero', () => {
  it('switches the main image when a gallery thumbnail is selected', async () => {
    const product = new ProductsShowModel({
      title: 'Cement',
      image: 'https://assets.test/main.webp',
      attachments: [
        new AttachmentModel({ file: 'https://assets.test/main.webp', type: 1 }),
        new AttachmentModel({ file: 'https://assets.test/second.webp', type: 1 }),
      ],
    });

    const wrapper = mount(ProductShowHero, {
      props: { product, title: 'Cement' },
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.get('.main-image img').attributes('src')).toBe('https://assets.test/main.webp');

    await wrapper.findAll('.thumbnail')[1].trigger('click');

    expect(wrapper.get('.main-image img').attributes('src')).toBe(
      'https://assets.test/second.webp',
    );
  });
});
