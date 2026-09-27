import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ProductsShowModel from '../../../../core/models/products.show.model';
import ProductShowHeader from '../ProductShowHeader.vue';

const product = new ProductsShowModel({ id: 9, code: 'P-009', title: 'Cement' });

describe('ProductShowHeader', () => {
  it('renders the real code and emits the existing page actions', async () => {
    const wrapper = mount(ProductShowHeader, {
      props: { product },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          ConfirmCancelDialog: {
            template: '<div><slot name="trigger" :open="() => $emit(\'confirm\')" /></div>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('#P-009');

    await wrapper.get('.header-btn--ghost').trigger('click');
    await wrapper.get('.header-btn--primary').trigger('click');
    await wrapper.get('.header-btn--danger').trigger('click');

    expect(wrapper.emitted('back')).toHaveLength(1);
    expect(wrapper.emitted('edit')).toHaveLength(1);
    expect(wrapper.emitted('delete')).toHaveLength(1);
  });
});
