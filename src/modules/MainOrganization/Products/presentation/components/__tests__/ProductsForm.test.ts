import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import AddProductsParams from '../../../core/params/add.products.params';
import ProductsForm from '../ProductsForm.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: {} }),
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
});
