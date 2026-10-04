import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { attachmentGallery } from '@/shared/AttachmentGallery/attachmentGallery';
import ExecutionQuoteAttachments from '../ExecutionQuoteAttachments.vue';

const attachments = [
  { id: 1, file: 'https://cdn.example.com/site-plan.png', fileSize: '2 MB', alt: 'Site plan' },
  { id: 2, file: 'https://cdn.example.com/specification.pdf', alt: 'Specification' },
  { id: 3, file: 'https://cdn.example.com/project-brief.docx', alt: 'Project brief' },
];

beforeEach(() => attachmentGallery.close());

describe('ExecutionQuoteAttachments', () => {
  it('opens the clicked file at its position in the complete quote group', async () => {
    const wrapper = mount(ExecutionQuoteAttachments, { props: { attachments } });

    const sectionHeader = wrapper.get('.quote-attachments__header');
    expect(sectionHeader.attributes('aria-expanded')).toBe('true');

    await sectionHeader.trigger('click');
    expect(sectionHeader.attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('.quote-attachments__grid').exists()).toBe(false);
    expect(wrapper.find('.quote-attachments__content').exists()).toBe(false);
    expect(sectionHeader.get('.quote-attachments__toggle i').classes()).not.toContain('is-open');

    await sectionHeader.trigger('click');
    expect(sectionHeader.attributes('aria-expanded')).toBe('true');

    await wrapper.findAll('.quote-attachments__card')[1]?.trigger('click');

    expect(sectionHeader.attributes('aria-expanded')).toBe('true');
    expect(attachmentGallery.visible.value).toBe(true);
    expect(attachmentGallery.activeIndex.value).toBe(1);
    expect(attachmentGallery.attachments.value.map((attachment) => attachment.url)).toEqual(
      attachments.map((attachment) => attachment.file),
    );
    expect(wrapper.text()).toContain('2 MB');
  });

  it('shows the empty state when the quote has no attachments', () => {
    const wrapper = mount(ExecutionQuoteAttachments, { props: { attachments: [] } });

    expect(wrapper.find('.quote-attachments__empty').exists()).toBe(true);
    expect(wrapper.find('.quote-attachments__card').exists()).toBe(false);
  });
});
