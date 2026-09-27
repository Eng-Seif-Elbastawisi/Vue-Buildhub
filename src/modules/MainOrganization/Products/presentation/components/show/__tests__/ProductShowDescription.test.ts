import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ProductShowDescription from '../ProductShowDescription.vue';

describe('ProductShowDescription', () => {
  it('renders the real additional product description', () => {
    const wrapper = mount(ProductShowDescription, {
      props: { description: 'Suitable for structural concrete work.' },
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.get('.description-text').text()).toBe('Suitable for structural concrete work.');
  });
});
