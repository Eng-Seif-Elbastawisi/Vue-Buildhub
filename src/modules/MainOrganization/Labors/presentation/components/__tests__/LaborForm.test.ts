/* eslint-disable vue/one-component-per-file */
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddLaborParams from '../../../core/params/add.labor.params';
import EditLaborParams from '../../../core/params/edit.labor.params';
import LaborShowModel from '../../../core/models/labor.show.model';
import LaborForm from '../LaborForm.vue';

const route = vi.hoisted(() => ({
  params: {} as Record<string, string>,
}));

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => route,
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    getFormData: vi.fn(),
    showReturnWarning: vi.fn(),
  }),
}));

vi.mock('@/modules/shared/measurement/presentation/controllers/measurement.controller', () => ({
  default: { getInstance: () => ({}) },
}));

vi.mock(
  '@/modules/MainOrganization/ItemTypes/presentation/controllers/item.types.controller',
  () => ({
    default: { getInstance: () => ({}) },
  }),
);

vi.mock('@/modules/shared/Stages/presentation/controllers/stage.controller', () => ({
  default: { getInstance: () => ({}) },
}));

const selectionIds: Record<string, number> = {
  'labor-item-type': 10,
  'labor-stage': 20,
  'labor-sub-stage': 30,
  'labor-measurement': 40,
};

const SelectStub = defineComponent({
  name: 'UpdatedCustomInputSelect',
  props: {
    id: { type: String, required: true },
    modelValue: { type: Object, default: null },
    params: { type: Object, default: undefined },
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selectValue = () => {
      emit('update:modelValue', {
        id: selectionIds[props.id],
        title: `Option ${selectionIds[props.id]}`,
      });
    };
    return { selectValue };
  },
  template: '<button :id="id" :disabled="disabled" type="button" @click="selectValue" />',
});

const MultiLangInputStub = defineComponent({
  name: 'MultiLangInput',
  emits: ['update:modelValue'],
  template:
    '<button id="labor-title" type="button" @click="$emit(\'update:modelValue\', { en: \'Installation\', ar: \'تركيب\' })" />',
});

describe('LaborForm', () => {
  beforeEach(() => {
    route.params = {};
  });

  it('emits all selected relation IDs in AddLaborParams', async () => {
    const wrapper = mount(LaborForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          UpdatedCustomInputSelect: SelectStub,
          MultiLangInput: MultiLangInputStub,
          FieldHelpIcon: true,
          StatusToggleField: true,
        },
      },
    });

    await wrapper.get('#labor-title').trigger('click');
    await wrapper.get('#labor-item-type').trigger('click');
    await wrapper.get('#labor-stage').trigger('click');
    await flushPromises();
    await wrapper.get('#labor-sub-stage').trigger('click');
    await wrapper.get('#labor-measurement').trigger('click');
    await wrapper.get('#labor-price').setValue('125');

    const emissions = wrapper.emitted('updateData');
    const params = emissions?.at(-1)?.[0] as AddLaborParams | undefined;

    expect(params).toBeInstanceOf(AddLaborParams);
    expect(params?.toMap()).toMatchObject({
      price: 125,
      measurement_unit_id: 40,
      item_type_id: 10,
      stage_id: 20,
      sub_stage_ids: [30],
      status: true,
    });
  });

  it('emits EditLaborParams with the labor ID on the edit route', async () => {
    route.params = { labor_id: '7' };

    const wrapper = mount(LaborForm, {
      props: {
        labor: new LaborShowModel({
          id: 7,
          price: 125,
          measurementId: { id: 40, title: 'Unit' },
          itemType: { id: 10, title: 'Item type' },
          stage: { id: 20, title: 'Stage' },
          subStages: [{ id: 30, title: 'Sub-stage' }],
          translations: { title: { en: 'Installation', ar: 'تركيب' } },
          status: false,
        }),
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          UpdatedCustomInputSelect: SelectStub,
          MultiLangInput: MultiLangInputStub,
          FieldHelpIcon: true,
          StatusToggleField: true,
        },
      },
    });

    await flushPromises();

    const emissions = wrapper.emitted('updateData');
    const params = emissions?.at(-1)?.[0] as EditLaborParams | undefined;

    expect(params).toBeInstanceOf(EditLaborParams);
    expect(params?.toMap()).toMatchObject({
      labor_id: 7,
      price: 125,
      measurement_unit_id: 40,
      item_type_id: 10,
      stage_id: 20,
      sub_stage_ids: [30],
      status: false,
    });
  });

  it('filters sub-stages by the selected stage and clears the previous sub-stage', async () => {
    const wrapper = mount(LaborForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          UpdatedCustomInputSelect: SelectStub,
          MultiLangInput: MultiLangInputStub,
          FieldHelpIcon: true,
          StatusToggleField: true,
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

    expect(findSelect('labor-stage').props('params').toMap()).toMatchObject({
      parent_id: null,
    });

    findSelect('labor-stage').vm.$emit('update:modelValue', { id: 20, title: 'Stage 20' });
    await flushPromises();

    expect(findSelect('labor-sub-stage').props('params').toMap()).toMatchObject({
      parent_id: 20,
    });

    findSelect('labor-sub-stage').vm.$emit('update:modelValue', {
      id: 30,
      title: 'Sub-stage 30',
    });
    findSelect('labor-stage').vm.$emit('update:modelValue', { id: 21, title: 'Stage 21' });
    await flushPromises();

    expect(findSelect('labor-sub-stage').props('params').toMap()).toMatchObject({
      parent_id: 21,
    });

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddLaborParams;
    expect(params.toMap()).toMatchObject({ stage_id: 21, sub_stage_ids: [] });
  });
});
