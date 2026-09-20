import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import EditProductsParams from '../../../core/params/edit.products.params';
import ProductsEdit from '../ProductsEdit.vue';

const controller = vi.hoisted(() => ({
  fetchOne: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  itemData: { value: { id: 8 } },
  errorMessage: { value: '' },
}));

vi.mock('../../controllers/products.controller', () => ({
  default: { getInstance: () => controller },
}));

vi.mock('vue-router', async (importOriginal) => {
  const vueRouter = await importOriginal();

  return {
    ...vueRouter,
    useRoute: () => ({
      fullPath: '/organization/products/edit/8',
      params: { products_id: '8' },
    }),
  };
});

describe('ProductsEdit', () => {
  it('sends the status emitted by the edit form', async () => {
    const wrapper = mount(ProductsEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          ProductsForm: {
            name: 'ProductsForm',
            template: '<div />',
          },
        },
      },
    });
    await flushPromises();

    const params = new EditProductsParams({ productsId: 8, isActive: false });
    wrapper.findComponent({ name: 'ProductsForm' }).vm.$emit('update-data', params);
    await wrapper.vm.$nextTick();
    await wrapper.get('button').trigger('click');

    expect(controller.update).toHaveBeenCalledWith(
      params,
      undefined,
      '/organization/products/edit/8',
    );
  });
});
