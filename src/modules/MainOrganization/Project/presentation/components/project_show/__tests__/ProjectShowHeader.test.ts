import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectShowHeader from '../ProjectShowHeader.vue';

const mountHeader = () =>
  mount(ProjectShowHeader, {
    props: {
      project: { id: 24, date: '2026-07-08', created_at: '2026-07-08 14:45:30' },
      projectTitle: 'Test Project',
      statusMeta: { label: 'Active', className: 'is-active' },
      projectCodeLabel: 'Project Code',
      createdAtLabel: 'Created at',
      downloadPdfLabel: 'Download PDF',
      generatingPdfLabel: 'Generating PDF...',
      editProjectLabel: 'Edit Project',
      exportingPdf: false,
      formatDate: () => '08 Jul 2026',
      formatTime: () => '02:45 PM',
    },
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  });

describe('ProjectShowHeader', () => {
  it('renders project metadata and emits pdf download action', async () => {
    const wrapper = mountHeader();

    expect(wrapper.text()).toContain('Test Project');
    expect(wrapper.text()).toContain('Project Code: 24');
    expect(wrapper.text()).toContain('Active');

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('downloadPdf')).toHaveLength(1);
  });
});
