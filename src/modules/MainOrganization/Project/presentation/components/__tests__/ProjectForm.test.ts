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
  it('groups required title and date fields and keeps selected terms', async () => {
    const wrapper = shallowMount(ProjectForm, {
      global: {
        stubs: {
          StandardFormLayout: false,
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
    const titleDateRow = wrapper.get('.project-form-title-date-row');
    const updates = wrapper.emitted('updateData');
    const latestParams = updates?.at(-1)?.[0] as { terms?: string };

    expect([...titleDateRow.element.children].map((field) => field.id)).toEqual([
      'project-title-field',
      'date-field',
    ]);
    expect(titleInput.text()).toBe('Title');
    expect(titleInput.attributes('data-required')).toBe('true');
    expect(wrapper.get('#date-field .required-indicator').text()).toBe('*');
    expect(latestParams.terms).toContain('First condition');
    expect(latestParams.terms).toContain('Second condition');
  });
});
