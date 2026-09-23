import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import type * as VueI18nModule from 'vue-i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import arabicMessages from '@/locales/ar.json';
import ProductShowSortingModel from '../../../../core/models/ProductShowSortingModel';
import DeleteProductsSortingParams from '../../../../core/params/delete.products.sorting.params';
import ProductShowSortings from '../ProductShowSortings.vue';

const controllerMocks = vi.hoisted(() => ({
  deleteProductSorting: vi.fn(),
  storeProductSorting: vi.fn(),
}));

vi.mock('../../../controllers/products.controller.ts', () => ({
  default: {
    getInstance: () => controllerMocks,
  },
}));

vi.mock('vue-i18n', async (importOriginal) => {
  const vueI18n = await importOriginal<typeof VueI18nModule>();

  return {
    ...vueI18n,
    useI18n: () => ({ t: (key: string) => key }),
  };
});

const DialogStub = defineComponent({
  props: {
    visible: Boolean,
  },
  template: '<div v-if="visible" class="dialog-stub"><slot name="container" /></div>',
});

const arabicLabels: Record<string, string> = {
  'Products.delete_item_dialog.title': arabicMessages.Products.delete_item_dialog.title,
  'Products.delete_item_dialog.message': arabicMessages.Products.delete_item_dialog.message,
  confirm: arabicMessages.confirm,
  cancel: arabicMessages.cancel,
};

const mountSortings = () =>
  mount(ProductShowSortings, {
    props: {
      productId: 9,
      sortings: [new ProductShowSortingModel({ id: 4, title: 'Sorting 1', price: 50 })],
    },
    global: {
      mocks: {
        $t: (key: string) => arabicLabels[key] ?? key,
      },
      stubs: {
        Dialog: DialogStub,
      },
    },
  });

describe('ProductShowSortings', () => {
  beforeEach(() => {
    controllerMocks.deleteProductSorting.mockReset().mockResolvedValue({
      data: { status: false },
    });
  });

  it('keeps the sorting when the confirmation dialog is canceled', async () => {
    const wrapper = mountSortings();

    await wrapper.get('.delete-sorting-btn').trigger('click');

    expect(wrapper.get('.dialog-title').text()).toBe('هل تريد المسح؟');
    expect(wrapper.get('.dialog-message').text()).toBe('هل أنت متأكد أنك تريد حذف هذا العنصر؟');
    expect(wrapper.get('.btn-dialog-confirm').text()).toBe('تأكيد');
    expect(wrapper.get('.btn-dialog-cancel').text()).toBe('إلغاء');
    expect(controllerMocks.deleteProductSorting).not.toHaveBeenCalled();

    await wrapper.get('.btn-dialog-cancel').trigger('click');

    expect(controllerMocks.deleteProductSorting).not.toHaveBeenCalled();
  });

  it('deletes the sorting only after confirmation', async () => {
    const wrapper = mountSortings();

    await wrapper.get('.delete-sorting-btn').trigger('click');
    expect(controllerMocks.deleteProductSorting).not.toHaveBeenCalled();

    await wrapper.get('.btn-dialog-confirm').trigger('click');
    await flushPromises();

    expect(controllerMocks.deleteProductSorting).toHaveBeenCalledOnce();
    const deleteParams = controllerMocks.deleteProductSorting.mock.calls[0][0];

    expect(deleteParams).toBeInstanceOf(DeleteProductsSortingParams);
    expect(deleteParams.toMap()).toEqual({ product_sorting_id: 4 });
  });
});
