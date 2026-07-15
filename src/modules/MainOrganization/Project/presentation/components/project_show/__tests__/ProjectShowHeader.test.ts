import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { ConvertStatus } from '../../../../core/constants/convert.status.enum';
import ProjectShowHeader from '../ProjectShowHeader.vue';

const mountHeader = (props: Record<string, unknown> = {}) =>
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
      historyLabel: 'History',
      actionsLabel: 'Actions',
      exportingPdf: false,
      changeStatusLabel: 'Change Status',
      changeStatusModalTitle: 'Change Project Status',
      statusLabel: 'Status',
      notesLabel: 'Notes',
      notesPlaceholder: 'Add notes',
      cancelLabel: 'Cancel',
      saveStatusLabel: 'Save Status',
      changingStatusLabel: 'Saving status...',
      changeStatusLoading: false,
      statusOptions: [
        { value: ConvertStatus.PENDING, label: 'Pending' },
        { value: ConvertStatus.ACCEPT_CLIENT, label: 'Accepted by client' },
      ],
      currentStatus: ConvertStatus.PENDING,
      formatDate: () => '08 Jul 2026',
      formatTime: () => '02:45 PM',
      ...props,
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
    expect(wrapper.text()).toContain('Actions');

    await wrapper.find('.project-actions__trigger').trigger('click');
    await wrapper
      .findAll('.project-actions__item')
      .find((item) => item.text().includes('Download PDF'))
      ?.trigger('click');

    expect(wrapper.emitted('downloadPdf')).toHaveLength(1);
  });

  it('renders convert status action and emits it', async () => {
    const wrapper = mountHeader({
      convertActionLabel: 'Store Version',
      convertActionDisabled: false,
    });

    await wrapper.find('.project-actions__trigger').trigger('click');

    expect(wrapper.text()).toContain('Store Version');

    await wrapper
      .findAll('.project-actions__item')
      .find((item) => item.text().includes('Store Version'))
      ?.trigger('click');

    expect(wrapper.emitted('convertStatusAction')).toHaveLength(1);
  });

  it('hides convert status action when no label is provided', () => {
    const wrapper = mountHeader();

    expect(wrapper.text()).not.toContain('Store Version');
    expect(wrapper.findAll('button')).toHaveLength(1);
  });

  it('opens status modal and emits selected status with notes', async () => {
    const wrapper = mountHeader();

    await wrapper.find('.project-actions__trigger').trigger('click');
    await wrapper
      .findAll('.project-actions__item')
      .find((item) => item.text().includes('Change Status'))
      ?.trigger('click');

    expect(wrapper.text()).toContain('Change Project Status');
    expect(wrapper.find('input[readonly]').exists()).toBe(false);

    await wrapper.find('select').setValue(String(ConvertStatus.ACCEPT_CLIENT));
    await wrapper.find('textarea').setValue('Client approved');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('changeProjectStatus')).toEqual([
      [{ status: ConvertStatus.ACCEPT_CLIENT, notes: 'Client approved' }],
    ]);
  });
});
