import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectAttachmentManager from '../ProjectAttachmentManager.vue';

describe('ProjectAttachmentManager', () => {
  it('renders correctly and displays attachments list', () => {
    const wrapper = mount(ProjectAttachmentManager, {
      props: {
        modelValue: [
          {
            file: 'data:application/pdf;base64,abc',
            name: 'المخطط_المعماري.Pdf',
            size: '2.4 MB',
            typeName: 'مخطط معماري',
          },
        ],
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          UpdatedCustomInputSelect: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('المخطط_المعماري.Pdf');
    expect(wrapper.text()).toContain('2.4 MB');
  });
});
