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
        "<button class=\"multi-lang-input\" @click=\"$emit('update:modelValue', { en: 'Cairo Governorate', ar: 'القاهرة' })\" />",
    },
    UpdatedCustomInputSelect: {
      props: ['modelValue', 'required'],
      emits: ['update:modelValue'],
      template:
        '<button class="country-select-stub" :data-required="required" @click="$emit(\'update:modelValue\', { id: 1, title: \'Egypt\' })" />',
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('GovernorateLocationForm', () => {
  it('emits governorate add params when translations change', async () => {
    const wrapper = mount(LocationForm, { global });

    await wrapper.find('.multi-lang-input').trigger('click');

    const emittedParams = wrapper.emitted('updateData')?.at(-1)?.[0] as AddLocationParams;
    expect(emittedParams).toBeInstanceOf(AddLocationParams);
    expect(emittedParams.type).toBe(LocationTypeEnum.GOVERNORATE);
  });

  it('uses the selected country as parent', async () => {
    const wrapper = mount(LocationForm, { global });

    await wrapper.find('.country-select-stub').trigger('click');

    const emittedParams = wrapper.emitted('updateData')?.at(-1)?.[0] as AddLocationParams;
    expect(emittedParams.parentId).toBe(1);
  });

  it('marks country select as required', () => {
    const wrapper = mount(LocationForm, { global });

    expect(wrapper.find('.country-select-stub').attributes('data-required')).toBe('true');
  });

  it('hydrates values from an existing governorate location', () => {
    const wrapper = mount(LocationForm, {
      global,
      props: { location: LocationShowModel.example },
    });

    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0] as AddLocationParams;
    expect(emittedParams.parentId).toBe(LocationShowModel.example.parent?.id);
  });
});
