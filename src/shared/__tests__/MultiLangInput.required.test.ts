import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MultiLangInput from '../MultiLangInput.vue';

describe('MultiLangInput.vue', () => {
  it('shows the required indicator for mandatory multilingual fields', () => {
    const wrapper = mount(MultiLangInput, {
      props: {
        fieldKey: 'description',
        label: 'Description',
        required: true,
      },
    });

    expect(wrapper.get('.required-indicator').text()).toBe('*');
  });
});
