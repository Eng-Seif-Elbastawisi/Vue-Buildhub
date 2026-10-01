import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectAttachmentManager, {
  type ProjectAttachmentItem,
} from '../ProjectAttachmentManager.vue';

describe('ProjectAttachmentManager', () => {
  const mountManager = (modelValue: ProjectAttachmentItem[]) =>
    mount(ProjectAttachmentManager, {
      props: { modelValue },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          UpdatedCustomInputSelect: true,
        },
      },
    });

  it('groups the attachment list by attachment type', () => {
    const wrapper = mountManager([
      {
        file: 'data:application/pdf;base64,abc',
        name: 'المخطط_المعماري.Pdf',
        size: '2.4 MB',
        typeId: 5,
        typeName: 'مخطط معماري',
        alt: 'المخطط المعماري',
      },
      {
        file: 'data:image/png;base64,def',
        name: 'front.png',
        typeId: 5,
        typeName: 'مخطط معماري',
        alt: 'Front view',
      },
      {
        file: 'data:application/pdf;base64,ghi',
        name: 'contract.pdf',
        typeId: 2,
        typeName: 'Contract',
        alt: 'Contract',
      },
    ]);

    expect(wrapper.findAll('.attachment-group')).toHaveLength(2);
    expect(wrapper.findAll('.attachment-card')).toHaveLength(3);
    expect(wrapper.text()).toContain('المخطط_المعماري.Pdf');
    expect(wrapper.text()).toContain('2.4 MB');
    expect(wrapper.find('input[type="file"]').attributes('multiple')).toBeDefined();
  });

  it('emits updated alt text without mutating the input list', async () => {
    const modelValue = [
      {
        file: 'data:image/png;base64,abc',
        name: 'front.png',
        typeId: 5,
        typeName: 'Photos',
        alt: 'Front view',
      },
    ];
    const wrapper = mountManager(modelValue);

    await wrapper.find('#project_attachment_alt_0').setValue('Updated front view');

    expect(modelValue[0]?.alt).toBe('Front view');
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual([
      expect.objectContaining({ alt: 'Updated front view' }),
    ]);
  });

  it('removes only the selected attachment', async () => {
    const wrapper = mountManager([
      {
        file: 'data:image/png;base64,front',
        name: 'front.png',
        typeId: 5,
        typeName: 'Photos',
      },
      {
        file: 'data:image/png;base64,side',
        name: 'side.png',
        typeId: 5,
        typeName: 'Photos',
      },
    ]);

    await wrapper.findAll('.remove-btn')[0]?.trigger('click');

    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual([
      expect.objectContaining({ name: 'side.png' }),
    ]);
  });

  it('renders the empty state when no files are attached', () => {
    const wrapper = mount(ProjectAttachmentManager, {
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
    expect(wrapper.find('.attachments-empty').exists()).toBe(true);
  });
});
