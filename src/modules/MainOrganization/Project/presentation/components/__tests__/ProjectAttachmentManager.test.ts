import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attachmentGallery } from '@/shared/AttachmentGallery/attachmentGallery';
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

afterEach(() => attachmentGallery.close());

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

  it('opens a grouped attachment at its original position in the full gallery', async () => {
    const wrapper = mountAttachmentManager([
      { file: 'data:image/png;base64,front', name: 'front.png', typeId: 5, typeName: 'Photos' },
      { file: 'data:application/pdf;base64,plan', name: 'plan.pdf', typeId: 2, typeName: 'Plans' },
      { file: 'data:image/png;base64,side', name: 'side.png', typeId: 5, typeName: 'Photos' },
    ]);

    await wrapper.findAll('.attachment-group')[1].get('.attachment-card__open').trigger('click');

    expect(attachmentGallery.visible.value).toBe(true);
    expect(attachmentGallery.activeIndex.value).toBe(1);
    expect(attachmentGallery.attachments.value.map((attachment) => attachment.name)).toEqual([
      'front.png',
      'plan.pdf',
      'side.png',
    ]);
  });

  it('opens a staged file in the gallery before it is added', async () => {
    const wrapper = mountAttachmentManager();
    const firstFile = new File(['front'], 'front.png', { type: 'image/png' });
    const secondFile = new File(['plan'], 'plan.pdf', { type: 'application/pdf' });

    await wrapper.get('.upload-dropzone').trigger('drop', {
      dataTransfer: { files: [firstFile, secondFile] },
    });
    await flushPromises();
    await wrapper.findAll('.staged-file-card__open')[1].trigger('click');

    expect(attachmentGallery.visible.value).toBe(true);
    expect(attachmentGallery.current.value?.name).toBe('plan.pdf');
    expect(attachmentGallery.attachments.value).toHaveLength(2);
  });
});
