import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProductShowSortingModel from '../../../core/models/ProductShowSortingModel';
import ProductsShowModel from '../../../core/models/products.show.model';
import AddProductsParams from '../../../core/params/add.products.params';
import EditProductsParams from '../../../core/params/edit.products.params';
import ProductsForm from '../ProductsForm.vue';

const { fetchStagesMock, route } = vi.hoisted(() => ({
  fetchStagesMock: vi.fn(),
  route: { params: {} as Record<string, string> },
}));

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
    getInstance: () => ({ fetchList: fetchStagesMock }),
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

const mountForm = (products?: ProductsShowModel) =>
  mount(ProductsForm, {
    props: { products },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        MultiLangInput: true,
        UpdatedCustomInputSelect: true,
        HandleFilesUpload: true,
        StatusToggleField: {
          props: ['modelValue', 'inputId'],
          emits: ['update:modelValue'],
          template:
            '<button :id="inputId" type="button" @click="$emit(\'update:modelValue\', !modelValue)" />',
        },
      },
    },
  });

const stageFixture = [
  { id: 1, parent_id: null, title: 'Main Stage A' },
  { id: 11, parent_id: 1, title: 'Sub 1' },
  { id: 12, parent_id: 1, title: 'Sub 2' },
  { id: 2, parent_id: null, title: 'Main Stage B' },
];

describe('ProductsForm', () => {
  beforeEach(() => {
    route.params = {};
    fetchStagesMock.mockReset().mockResolvedValue({ data: [] });
  });

  it('keeps grades fields visible when the product status is deactivated', async () => {
    const wrapper = mountForm();
    await flushPromises();

    await wrapper.get('#product-status').trigger('click');
    await wrapper.get('#product-quantity').setValue('10');
    await flushPromises();

    expect(wrapper.find('.image-card').exists()).toBe(true);
    expect(wrapper.find('.sortings-card').exists()).toBe(true);

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddProductsParams;
    expect(params).toBeInstanceOf(AddProductsParams);
    expect(params.toMap()).toMatchObject({ is_active: false, quantity: 10 });
  });

  it('uses a separate grades toggle to hide image and sorting fields', async () => {
    const wrapper = mountForm();
    await flushPromises();

    await wrapper.get('#product-grades-status').trigger('click');
    await flushPromises();

    expect(wrapper.find('.image-card').exists()).toBe(false);
    expect(wrapper.find('.sortings-card').exists()).toBe(false);

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddProductsParams;
    expect(params.toMap()).toMatchObject({
      is_active: true,
      image: undefined,
      sortings: [],
    });
  });

  it('preserves grades when an edited product is deactivated', async () => {
    route.params = { products_id: '9' };

    const product = new ProductsShowModel({
      id: 9,
      isActive: true,
      image: 'https://example.com/old-image.png',
      sortings: [new ProductShowSortingModel({ id: 4, title: 'Sorting 1', price: 50 })],
    });

    const wrapper = mountForm(product);
    await flushPromises();

    await wrapper.get('#product-status').trigger('click');
    await flushPromises();

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as EditProductsParams;
    expect(params).toBeInstanceOf(EditProductsParams);
    expect(params.toMap()).toMatchObject({
      product_id: 9,
      image: 'https://example.com/old-image.png',
      sortings: [expect.objectContaining({ price: 50 })],
      is_active: false,
    });
  });

  it('prefills returned quantity and sends it in edit params', async () => {
    route.params = { products_id: '9' };
    const wrapper = mountForm(new ProductsShowModel({ id: 9, quantity: 8 }));
    await flushPromises();

    expect(wrapper.get<HTMLInputElement>('#product-quantity').element.value).toBe('8');
    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as EditProductsParams;
    expect(params.toMap()).toMatchObject({ product_id: 9, quantity: 8 });

    await wrapper.get('#product-quantity').setValue('');
    const clearedParams = wrapper.emitted('updateData')?.at(-1)?.[0] as EditProductsParams;
    expect(clearedParams.toMap()).not.toHaveProperty('quantity');
  });

  it('selects and deselects every sub-stage from the main stage header', async () => {
    fetchStagesMock.mockResolvedValue({ data: stageFixture });

    const wrapper = mountForm();
    await flushPromises();

    const mainGroup = wrapper.findAll('.stage-group')[0];
    const groupHeader = mainGroup.get('.group-header');

    await groupHeader.trigger('click');

    expect(mainGroup.classes()).toContain('selected');
    expect(
      mainGroup.findAll('.stage-tag').every((stage) => stage.classes().includes('selected')),
    ).toBe(true);

    let params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddProductsParams;
    expect(params.toMap()).toMatchObject({ stage_ids: [11, 12] });

    await groupHeader.trigger('click');

    expect(mainGroup.classes()).not.toContain('selected');
    expect(
      mainGroup.findAll('.stage-tag').some((stage) => stage.classes().includes('selected')),
    ).toBe(false);

    params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddProductsParams;
    expect(params.toMap()).toMatchObject({ stage_ids: [] });
  });

  it('selects the main stage visually only when all sub-stages are selected', async () => {
    fetchStagesMock.mockResolvedValue({ data: stageFixture });

    const wrapper = mountForm();
    await flushPromises();

    const mainGroup = wrapper.findAll('.stage-group')[0];
    const subStages = mainGroup.findAll('.stage-tag');

    await subStages[0].trigger('click');
    expect(mainGroup.classes()).not.toContain('selected');

    await subStages[1].trigger('click');
    expect(mainGroup.classes()).toContain('selected');

    await subStages[0].trigger('click');
    expect(mainGroup.classes()).not.toContain('selected');
  });

  it('disables a main stage that has no sub-stages', async () => {
    fetchStagesMock.mockResolvedValue({ data: stageFixture });

    const wrapper = mountForm();
    await flushPromises();

    const emptyGroup = wrapper.findAll('.stage-group')[1];
    const groupHeader = emptyGroup.get<HTMLButtonElement>('.group-header');

    expect(emptyGroup.classes()).toContain('disabled');
    expect(groupHeader.element.disabled).toBe(true);

    await groupHeader.trigger('click');

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddProductsParams;
    expect(params.toMap()).toMatchObject({ stage_ids: [] });
  });
});
