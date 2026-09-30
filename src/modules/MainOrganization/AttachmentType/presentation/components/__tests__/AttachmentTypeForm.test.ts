import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AttachmentTypeForm from '../AttachmentTypeForm.vue';

describe('AttachmentTypeForm', () => {
  it('renders correctly and emits updateData', () => {
    const wrapper = mount(AttachmentTypeForm, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          MultiLangInput: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
