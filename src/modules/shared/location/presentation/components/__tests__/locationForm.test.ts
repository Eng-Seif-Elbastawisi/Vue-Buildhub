import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { LocationTypeEnum } from '../../../core/constant/location.type.enum';
import LocationForm from '../locationForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));

const MultiLangInputStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: `
    <button class="translation-input" @click="$emit('update:modelValue', { en: 'Building', ar: 'مبنى' })">
      translate
    </button>
  `,
};

const SelectStub = {
  props: ['id'],
  emits: ['update:modelValue'],
  template: `
    <button :class="id" @click="$emit('update:modelValue', { id: 3, title: 'building' })">
      select
    </button>
  `,
};

describe('LocationForm', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('emits translated title, code, and type in the location params', async () => {
    const wrapper = mount(LocationForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { MultiLangInput: MultiLangInputStub, UpdatedCustomInputSelect: SelectStub },
      },
    });

    await wrapper.find('.translation-input').trigger('click');
    await wrapper.find<HTMLInputElement>('#location-code').setValue('B-01');
    await wrapper.find('.location-type').trigger('click');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as { toMap: () => Record<string, unknown> };

    expect(params.toMap()).toEqual({
      parent_id: undefined,
      code: 'B-01',
      type: LocationTypeEnum.CITY,
      translations: { title: { en: 'Building', ar: 'مبنى' } },
    });
  });
});
