import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectAttachmentManager from '../ProjectAttachmentManager.vue';

beforeEach(() => {
  vi.stubGlobal(
    'FileReader',
    class {
      public onload: ((event: { target: { result: string } }) => void) | null = null;

      readAsDataURL() {
        this.onload?.({ target: { result: 'data:application/pdf;base64,cGxhbg==' } });
      }
    },
  );
});

const attachmentTypeSelectStub = {
  emits: ['update:modelValue'],
  template: `
    <button
      data-test="attachment-type"
      type="button"
      @click="$emit('update:modelValue', { id: 7, title: 'Architectural plan' })"
    >
      Select type
    </button>
  `,
};

const mountAttachmentManager = (modelValue = []) =>
  mount(ProjectAttachmentManager, {
    props: { modelValue },
    global: {
      stubs: {
        UpdatedCustomInputSelect: attachmentTypeSelectStub,
      },
    },
  });

describe('ProjectAttachmentManager', () => {
  it('renders attachment details and an accessible remove action', () => {
    const wrapper = mountAttachmentManager([
      {
        file: 'data:application/pdf;base64,abc',
        name: 'المخطط_المعماري.Pdf',
        size: '2.4 MB',
        typeName: 'مخطط معماري',
      },
    ]);

    expect(wrapper.text()).toContain('المخطط_المعماري.Pdf');
    expect(wrapper.text()).toContain('2.4 MB');
    expect(wrapper.get('.remove-btn').attributes('aria-label')).toContain('المخطط_المعماري.Pdf');
  });

  it('keeps add disabled until both a file and attachment type are selected', async () => {
    const wrapper = mountAttachmentManager();
    const selectedFile = new File(['plan'], 'floor-plan.pdf', { type: 'application/pdf' });

    expect(wrapper.get('.empty-state').text()).toContain('No attachments added yet');
    expect(wrapper.get('.add-btn').attributes('disabled')).toBeDefined();

    await wrapper.get('.upload-dropzone').trigger('drop', {
      dataTransfer: { files: [selectedFile] },
    });

    expect(wrapper.get('.add-btn').attributes('disabled')).toBeDefined();

    await wrapper.get('[data-test="attachment-type"]').trigger('click');
    expect(wrapper.get('.add-btn').attributes('disabled')).toBeUndefined();

    await wrapper.get('.add-btn').trigger('click');

    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual([
      expect.objectContaining({
        name: 'floor-plan.pdf',
        typeId: 7,
        typeName: 'Architectural plan',
      }),
    ]);
  });

  it('groups added files by type and updates their descriptions', async () => {
    const wrapper = mountAttachmentManager([
      {
        file: 'data:image/png;base64,front',
        name: 'front.png',
        typeId: 5,
        typeName: 'Site photos',
        alt: 'Front view',
      },
      {
        file: 'data:image/jpeg;base64,side',
        name: 'side.jpg',
        typeId: 5,
        typeName: 'Site photos',
        alt: 'Side view',
      },
      {
        file: 'data:application/pdf;base64,contract',
        name: 'contract.pdf',
        typeId: 2,
        typeName: 'Contracts',
        alt: 'Contract',
      },
    ]);

    expect(wrapper.findAll('.attachment-group')).toHaveLength(2);
    expect(wrapper.findAll('.attachment-card')).toHaveLength(3);
    expect(wrapper.text()).toContain('Site photos');
    expect(wrapper.text()).toContain('Contracts');

    await wrapper.get('#project_attachment_alt_0').setValue('Main entrance');

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([
      expect.objectContaining({ alt: 'Main entrance', typeId: 5 }),
      expect.objectContaining({ alt: 'Side view', typeId: 5 }),
      expect.objectContaining({ alt: 'Contract', typeId: 2 }),
    ]);
  });
});
