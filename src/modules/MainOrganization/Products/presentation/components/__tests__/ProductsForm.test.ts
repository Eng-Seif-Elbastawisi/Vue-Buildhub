import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddProductsParams from '../../../core/params/add.products.params';
import EditProductsParams from '../../../core/params/edit.products.params';
import ProductShowSortingModel from '../../../core/models/ProductShowSortingModel';
import ProductsShowModel from '../../../core/models/products.show.model';
import ProductsForm from '../ProductsForm.vue';

const route = vi.hoisted(() => ({ params: {} as Record<string, string> }));

vi.mock('vue-router', () => ({
  useRoute: () => route,
}));

vi.mock('vue-i18n', async (importOriginal) => {
  const vueI18n = await importOriginal();
  return {
    ...vueI18n,
    useI18n: () => ({
      locale: ref('en'),
      t: (key: string) => key,
    }),
  };
});

vi.mock('../../controllers/products.controller', () => ({
  default: {
    getInstance: () => ({ deleteProductSorting: vi.fn() }),
  },
}));

vi.mock('@/modules/shared/Stages/presentation/controllers/stage.controller', () => ({
  default: {
    getInstance: () => ({ fetchList: vi.fn().mockResolvedValue({ data: [] }) }),
  },
}));

vi.mock(
  '@/modules/MainOrganization/ItemTypes/presentation/controllers/item.types.controller',
  () => ({
    default: { getInstance: () => ({}) },
  }),
);

vi.mock('@/modules/shared/measurement/presentation/controllers/measurement.controller', () => ({
  default: { getInstance: () => ({}) },
}));

describe('ProductsForm', () => {
  beforeEach(() => {
    route.params = {};
  });

  it('emits the status selected in the product form', async () => {
    const wrapper = mount(ProductsForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MultiLangInput: true,
          UpdatedCustomInputSelect: true,
          HandleFilesUpload: true,
          StatusToggleField: {
            emits: ['update:modelValue'],
            template:
              '<button id="product-status" type="button" @click="$emit(\'update:modelValue\', false)" />',
          },
        },
      },
    });
    await flushPromises();

    await wrapper.get('#product-status').trigger('click');
    await flushPromises();

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddProductsParams;
    expect(params).toBeInstanceOf(AddProductsParams);
    expect(params.toMap()).toMatchObject({ is_active: false });
  });

  it('emits an empty sorting list and the selected image when deactivating an edited product', async () => {
    route.params = { products_id: '9' };

    const product = new ProductsShowModel({
      id: 9,
      isActive: true,
      image: 'https://example.com/old-image.png',
      sortings: [new ProductShowSortingModel({ id: 4, title: 'Sorting 1', price: 50 })],
    });

    const wrapper = mount(ProductsForm, {
      props: { products: product },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MultiLangInput: true,
          UpdatedCustomInputSelect: true,
          HandleFilesUpload: {
            emits: ['change'],
            template:
              "<button id=\"product-image\" type=\"button\" @click=\"$emit('change', [{ id: 'new-image', name: 'door.png', type: 'image/png', size: '1 KB', url: 'blob:image', base64: 'data:image/png;base64,new-image' }])\" />",
          },
          StatusToggleField: {
            emits: ['update:modelValue'],
            template:
              '<button id="product-status" type="button" @click="$emit(\'update:modelValue\', false)" />',
          },
        },
      },
    });
    await flushPromises();

    await wrapper.get('#product-status').trigger('click');
    await wrapper.get('#product-image').trigger('click');
    await flushPromises();

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as EditProductsParams;
    expect(params).toBeInstanceOf(EditProductsParams);
    expect(params.toMap()).toMatchObject({
      product_id: 9,
      image: 'data:image/png;base64,new-image',
      sortings: [],
      is_active: false,
    });
  });
});
