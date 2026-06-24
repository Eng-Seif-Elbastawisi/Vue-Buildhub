import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectTypeForm from '../ProjectTypeForm.vue';

const MultiLangInputStub = {
  emits: ['update:modelValue'],
  template: `<button class="title-input" @click="$emit('update:modelValue', { en: 'Mall', ar: 'مول' })">title</button>`,
};

describe('ProjectTypeForm', () => {
  it('emits translated project title', async () => {
    const wrapper = mount(ProjectTypeForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { MultiLangInput: MultiLangInputStub },
      },
    });

    await wrapper.find('.title-input').trigger('click');

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as {
      toMap: () => Record<string, unknown>;
    };
    expect(params.toMap()).toEqual({
      name: undefined,
      project_type: undefined,
      translations: { title: { en: 'Mall', ar: 'مول' } },
    });
  });
});
