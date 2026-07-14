import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TermForm from '../TermForm.vue';

const MultiLangInputStub = {
  props: ['fieldKey'],
  emits: ['update:modelValue'],
  template: `<button
      :class="fieldKey + '-input'"
      @click="$emit(
        'update:modelValue',
        fieldKey === 'title'
          ? { en: 'Mall', ar: 'مول' }
          : { en: 'Payment terms', ar: 'شروط الدفع' },
      )"
    >
      {{ fieldKey }}
    </button>`,
};

describe('TermForm', () => {
  it('emits term translations', async () => {
    const wrapper = mount(TermForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { MultiLangInput: MultiLangInputStub },
      },
    });
    await wrapper.find('.title-input').trigger('click');
    await wrapper.find('.description-input').trigger('click');
    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as { toMap: () => unknown };
    expect(params.toMap()).toEqual({
      translations: {
        title: { en: 'Mall', ar: 'مول' },
        description: { en: 'Payment terms', ar: 'شروط الدفع' },
      },
    });
  });
});
