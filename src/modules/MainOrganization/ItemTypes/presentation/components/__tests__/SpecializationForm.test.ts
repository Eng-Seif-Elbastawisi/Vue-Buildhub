import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import SpecializationForm from '../SpecializationForm.vue';

const MultiLangInputStub = {
  emits: ['update:modelValue'],
  template:
    "<button class=\"title-input\" @click=\"$emit('update:modelValue', { en: 'Mall', ar: 'مول' })\">title</button>",
};

describe('SpecializationForm', () => {
  it('emits specialization translations', async () => {
    const wrapper = mount(SpecializationForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { MultiLangInput: MultiLangInputStub },
      },
    });
    await wrapper.find('.title-input').trigger('click');
    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as { toMap: () => unknown };
    expect(params.toMap()).toEqual({
      translations: {
        title: { en: 'Mall', ar: 'مول' },
      },
    });
  });
});
