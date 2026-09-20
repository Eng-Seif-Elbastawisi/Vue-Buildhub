import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import ItemTypesModel from '@/modules/MainOrganization/ItemTypes/core/models/item.types.model';
import BrandModel from '@/modules/shared/Brand/core/models/brand.model';
import { BrandTypeEnum } from '@/modules/shared/Brand/core/constant/Brand.type.enum';
import MeasurementModel from '@/modules/shared/measurement/core/models/measurement.model';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';
import AddMaterialsParams from '../../../core/params/add.materials.params';
import EditMaterialParams from '../../../core/params/edit.materials.params';
import MaterialsShowModel from '../../../core/models/materials.show.model';
import MaterialsForm from '../MaterialsForm.vue';

const route = vi.hoisted(() => ({
  params: {} as Record<string, string>,
}));

vi.mock('vue-router', async (importOriginal) => {
  const vueRouter = await importOriginal();
  return { ...vueRouter, onBeforeRouteLeave: vi.fn(), useRoute: () => route };
});
vi.mock('@/modules/shared/Brand/presentation/controllers/brand.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));
vi.mock('@/modules/shared/measurement/presentation/controllers/measurement.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));
vi.mock(
  '@/modules/MainOrganization/ItemTypes/presentation/controllers/item.types.controller',
  () => ({
    default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
  }),
);
vi.mock('@/modules/shared/Stages/presentation/controllers/stage.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));

const MultiLangInputStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    "<button class=\"translation-input\" @click=\"$emit('update:modelValue', { en: 'Cement', ar: 'Cement AR' })\">translate</button>",
};

const SelectStub = defineComponent({
  name: 'UpdatedCustomInputSelect',
  props: {
    id: { type: String, required: true },
    params: { type: Object, default: undefined },
  },
  emits: ['update:modelValue'],
  template:
    "<button :class=\"id\" @click=\"$emit('update:modelValue', id === 'material-brand' ? { id: 7, title: 'Acme' } : { id: 2, title: 'bag' })\">select</button>",
});

describe('MaterialsForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    route.params = {};
  });

  it('emits translated title, price, brand, and unit in the material params', async () => {
    const wrapper = mount(MaterialsForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MultiLangInput: MultiLangInputStub,
          UpdatedCustomInputSelect: SelectStub,
          StatusToggleField: true,
          FieldHelpIcon: true,
        },
      },
    });

    await wrapper.find('.translation-input').trigger('click');
    await wrapper.find<HTMLInputElement>('#material-price').setValue('125');
    await wrapper.find('.material-brand').trigger('click');
    await wrapper.find('.material-measurement').trigger('click');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as AddMaterialsParams;
    expect(params).toBeInstanceOf(AddMaterialsParams);
    expect(params.toMap()).toMatchObject({
      price: 125,
      brand_id: 7,
      measurement_unit_id: 2,
      translations: { title: { en: 'Cement', ar: 'Cement AR' } },
      status: true,
    });
  });

  it('emits EditMaterialParams with the material ID on the edit route', async () => {
    route.params = { material_id: '9' };

    const wrapper = mount(MaterialsForm, {
      props: {
        material: new MaterialsShowModel({
          id: 9,
          price: 100,
          brand: new BrandModel({
            id: 2,
            title: 'Brand',
            translations: { title: { en: 'Brand' } },
            type: BrandTypeEnum.MATERIALS,
          }),
          measurementId: new MeasurementModel({ id: 3, title: 'Unit' }),
          itemType: new ItemTypesModel({ id: 4, title: 'Item type' }),
          stage: StageModel.fromJson({ id: 5, title: 'Stage' }),
          subStage: StageModel.fromJson({ id: 6, title: 'Sub-stage' }),
          translations: { title: { en: 'Steel' } },
          status: false,
        }),
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MultiLangInput: MultiLangInputStub,
          UpdatedCustomInputSelect: SelectStub,
          StatusToggleField: true,
          FieldHelpIcon: true,
        },
      },
    });

    await flushPromises();

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as EditMaterialParams;
    expect(params).toBeInstanceOf(EditMaterialParams);
    expect(params.toMap()).toMatchObject({
      material_id: 9,
      brand_id: 2,
      measurement_unit_id: 3,
      item_type_id: 4,
      stage_id: 5,
      sub_stage_id: 6,
      status: false,
    });
  });

  it('filters sub-stages by the selected stage and clears the previous sub-stage', async () => {
    const wrapper = mount(MaterialsForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MultiLangInput: MultiLangInputStub,
          UpdatedCustomInputSelect: SelectStub,
          StatusToggleField: true,
          FieldHelpIcon: true,
        },
      },
    });

    const findSelect = (id: string) => {
      const select = wrapper
        .findAllComponents(SelectStub)
        .find((candidate) => candidate.props('id') === id);

      if (!select) throw new Error(`Missing select: ${id}`);
      return select;
    };

    expect(findSelect('material-stage').props('params').toMap()).toMatchObject({
      parent_id: null,
    });

    findSelect('material-stage').vm.$emit('update:modelValue', { id: 20, title: 'Stage 20' });
    await flushPromises();

    expect(findSelect('material-sub-stage').props('params').toMap()).toMatchObject({
      parent_id: 20,
    });

    findSelect('material-sub-stage').vm.$emit('update:modelValue', {
      id: 30,
      title: 'Sub-stage 30',
    });
    findSelect('material-stage').vm.$emit('update:modelValue', { id: 21, title: 'Stage 21' });
    await flushPromises();

    expect(findSelect('material-sub-stage').props('params').toMap()).toMatchObject({
      parent_id: 21,
    });

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as {
      toMap: () => Record<string, unknown>;
    };
    expect(params.toMap()).toMatchObject({ stage_id: 21, sub_stage_id: undefined });
  });
});
