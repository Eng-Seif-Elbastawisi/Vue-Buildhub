import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectForm from '../ProjectForm.vue';

const termSelectStub = {
  props: ['id'],
  emits: ['update:modelValue'],
  template: `
    <button
      v-if="id === 'term_id'"
      data-test="term-select"
      type="button"
      @click="$emit('update:modelValue', [
        { id: 1, title: 'First condition' },
        { id: 2, title: 'Second condition' }
      ])"
    >
      Select terms
    </button>
  `,
};

const multiLangInputStub = {
  props: {
    fieldKey: String,
    label: String,
    required: Boolean,
  },
  template:
    '<label :data-field-key="fieldKey" :data-required="String(required)">{{ label }}</label>',
};

describe('ProjectForm.vue', () => {
  it('keeps comma-separated terms and marks request fields as required', async () => {
    const wrapper = shallowMount(ProjectForm, {
      global: {
        stubs: {
          DatePicker: true,
          FieldHelpIcon: true,
          MultiLangInput: multiLangInputStub,
          ProjectAttachmentManager: true,
          UpdatedCustomInputSelect: termSelectStub,
        },
      },
    });

    await wrapper.get('[data-test="term-select"]').trigger('click');

    const titleInput = wrapper.get('[data-field-key="title"]');
    const descriptionInput = wrapper.get('[data-field-key="description"]');
    const updates = wrapper.emitted('updateData');
    const latestParams = updates?.at(-1)?.[0] as { terms?: string };

    expect(titleInput.text()).toBe('Project name');
    expect(descriptionInput.attributes('data-required')).toBe('true');
    expect(wrapper.get('#terms').element).toHaveProperty(
      'value',
      'First condition, Second condition',
    );
    expect(wrapper.get('#terms').attributes('required')).toBeDefined();
    expect(wrapper.get('#date-field .required-indicator').text()).toBe('*');
    expect(wrapper.get('#notes-field .field-label').text()).toBe('Notes');
    expect(latestParams.terms).toBe('First condition, Second condition');
  });
});
