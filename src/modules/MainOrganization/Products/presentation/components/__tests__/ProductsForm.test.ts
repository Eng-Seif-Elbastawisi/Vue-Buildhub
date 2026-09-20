import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddProductsParams from '../../../core/params/add.products.params';
import ProductsForm from '../ProductsForm.vue';

const { fetchStagesMock } = vi.hoisted(() => ({
  fetchStagesMock: vi.fn(),
}));

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

const mountForm = () =>
  mount(ProductsForm, {
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

const stageFixture = [
  { id: 1, parent_id: null, title: 'Main Stage A' },
  { id: 11, parent_id: 1, title: 'Sub 1' },
  { id: 12, parent_id: 1, title: 'Sub 2' },
  { id: 2, parent_id: null, title: 'Main Stage B' },
];

describe('ProductsForm', () => {
  beforeEach(() => {
    fetchStagesMock.mockReset();
    fetchStagesMock.mockResolvedValue({ data: [] });
  });

  it('emits the status selected in the product form', async () => {
    const wrapper = mountForm();
    await flushPromises();

    await wrapper.get('#product-status').trigger('click');
    await flushPromises();

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddProductsParams;
    expect(params).toBeInstanceOf(AddProductsParams);
    expect(params.toMap()).toMatchObject({ is_active: false });
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
