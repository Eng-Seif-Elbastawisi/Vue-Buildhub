import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectForm from '../ProjectForm.vue';
const SelectStub = {
  emits: ['update:modelValue'],
  template:
    '<button class="type-select" @click="$emit(\'update:modelValue\', { id: 4, title: \'commercial\' })">type</button>',
};
describe('ProjectForm', () => {
  it('emits project name and type', async () => {
    const wrapper = mount(ProjectForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: SelectStub },
      },
    });
    await wrapper.find('#project-name').setValue('Mall');
    await wrapper.find('.type-select').trigger('click');
    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as { toMap: () => unknown };
    expect(params.toMap()).toEqual({ name: 'Mall', project_type: 4 });
  });
});
