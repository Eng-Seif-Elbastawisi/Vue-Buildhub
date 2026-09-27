import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExecutionQuoteAttachments from '../ExecutionQuoteAttachments.vue';

const DialogStub = {
  name: 'Dialog',
  props: ['visible'],
  emits: ['update:visible', 'hide'],
  template: `
    <section v-if="visible" class="attachment-dialog-stub">
      <slot name="header" />
      <slot />
      <slot name="footer" />
    </section>
  `,
};

const attachments = [
  {
    id: 1,
    file: 'https://cdn.example.com/site-plan.png',
    fileSize: '2 MB',
    alt: 'Site plan',
    createdAt: '2026-09-23 12:42:40',
  },
  {
    id: 2,
    file: 'https://cdn.example.com/specification.pdf',
    fileSize: '640 KB',
    alt: 'Specification',
  },
  {
    id: 3,
    file: 'https://cdn.example.com/project-brief.docx',
    alt: 'Project brief',
  },
];

const translate = (key: string) => {
  const messages: Record<string, string> = {
    'execution_quote.show.preview_unavailable': 'Preview is not available',
    'execution_quote.show.no_attachments': 'No attachments',
  };

  return messages[key] ?? key;
};

const mountAttachments = () =>
  mount(ExecutionQuoteAttachments, {
    props: { attachments },
    global: {
      mocks: { $t: translate },
      stubs: { Dialog: DialogStub },
    },
  });

describe('ExecutionQuoteAttachments', () => {
  it('renders the available attachment metadata as preview actions', () => {
    const wrapper = mountAttachments();

    expect(wrapper.findAll('.quote-attachments__card')).toHaveLength(3);
    expect(wrapper.text()).toContain('Site plan');
    expect(wrapper.text()).toContain('2 MB');
    expect(wrapper.text()).toContain('PNG');
  });

  it('previews an image inside the dialog', async () => {
    const wrapper = mountAttachments();

    await wrapper.findAll('.quote-attachments__card')[0]?.trigger('click');

    const dialog = wrapper.get('.attachment-dialog-stub');
    const preview = dialog.get<HTMLImageElement>('img');
    expect(dialog.text()).toContain('Site plan');
    expect(preview.attributes('src')).toBe('https://cdn.example.com/site-plan.png');
  });

  it('previews a PDF inside the dialog', async () => {
    const wrapper = mountAttachments();

    await wrapper.findAll('.quote-attachments__card')[1]?.trigger('click');

    expect(wrapper.get<HTMLIFrameElement>('iframe').attributes('src')).toBe(
      'https://cdn.example.com/specification.pdf',
    );
  });

  it('offers the original file when an inline preview is unavailable', async () => {
    const wrapper = mountAttachments();

    await wrapper.findAll('.quote-attachments__card')[2]?.trigger('click');

    const dialog = wrapper.get('.attachment-dialog-stub');
    expect(dialog.text()).toContain('Project brief');
    expect(dialog.text()).toContain('Preview is not available');
    expect(dialog.get<HTMLAnchorElement>('.quote-attachment-dialog__open').attributes('href')).toBe(
      'https://cdn.example.com/project-brief.docx',
    );
  });

  it('shows an intentional empty state when the quote has no attachments', () => {
    const wrapper = mount(ExecutionQuoteAttachments, {
      props: { attachments: [] },
      global: {
        mocks: { $t: translate },
        stubs: { Dialog: DialogStub },
      },
    });

    expect(wrapper.find('.quote-attachments__empty').exists()).toBe(true);
    expect(wrapper.text()).toContain('No attachments');
    expect(wrapper.find('.quote-attachments__card').exists()).toBe(false);
  });
});
