import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import AddLocationParams from '../../../../core/params/add.location.params';
import LocationShowModel from '../../../../core/models/location.show.model';
import { LocationTypeEnum } from '../../../../core/constant/location.type.enum';
import LocationForm from '../locationForm.vue';

vi.mock('../../../controllers/location.controller', () => ({
  default: { getInstance: () => ({}) },
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    getFormData: vi.fn(),
    showReturnWarning: vi.fn(),
  }),
}));

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
}));

const global = {
  stubs: {
    MultiLangInput: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template:
        "<button class=\"multi-lang-input\" @click=\"$emit('update:modelValue', { en: 'Giza', ar: 'الجيزة' })\" />",
    },
    UpdatedCustomInputSelect: {
      props: ['modelValue', 'id', 'required'],
      emits: ['update:modelValue'],
      template:
        '<button :class="`select-${id}`" :data-required="required" @click="$emit(\'update:modelValue\', { id: id === \'country\' ? 1 : 2, title: id })" />',
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('CityLocationForm', () => {
  it('emits city add params when translations change', async () => {
    const wrapper = mount(LocationForm, { global });

    await wrapper.find('.multi-lang-input').trigger('click');

    const emittedParams = wrapper.emitted('updateData')?.at(-1)?.[0] as AddLocationParams;
    expect(emittedParams).toBeInstanceOf(AddLocationParams);
    expect(emittedParams.type).toBe(LocationTypeEnum.CITY);
  });

  it('uses the selected governorate as parent', async () => {
    const wrapper = mount(LocationForm, { global });

    await wrapper.find('.select-governorate').trigger('click');

    const emittedParams = wrapper.emitted('updateData')?.at(-1)?.[0] as AddLocationParams;
    expect(emittedParams.parentId).toBe(2);
  });

  it('marks country and governorate selects as required', () => {
    const wrapper = mount(LocationForm, { global });

    expect(wrapper.find('.select-country').attributes('data-required')).toBe('true');
    expect(wrapper.find('.select-governorate').attributes('data-required')).toBe('true');
  });

  it('hydrates values from an existing city location', () => {
    const wrapper = mount(LocationForm, {
      global,
      props: { location: LocationShowModel.example },
    });

    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0] as AddLocationParams;
    expect(emittedParams.parentId).toBe(LocationShowModel.example.parent?.id);
  });
});
