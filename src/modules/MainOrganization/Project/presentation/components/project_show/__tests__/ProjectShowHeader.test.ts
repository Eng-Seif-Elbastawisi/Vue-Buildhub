import { DOMWrapper, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { ConvertStatus } from '../../../../core/constants/convert.status.enum';
import ProjectShowHeader from '../ProjectShowHeader.vue';

const mountHeader = (
  props: Record<string, unknown> = {},
  attachTo?: Element,
  globalStubs: Record<string, boolean> = {},
) =>
  mount(ProjectShowHeader, {
    attachTo,
    props: {
      project: {
        id: 24,
        convert_status: ConvertStatus.READY_TO_SENT,
        date: '2026-07-08',
        created_at: '2026-07-08 14:45:30',
      },
      projectTitle: 'Test Project',
      projectTypeLabel: 'Villa',
      imageSource: '/project.png',
      fallbackImageSource: '/fallback-villa.png',
      statusMeta: { label: 'Active', className: 'is-active' },
      projectCodeLabel: 'Project Code',
      createdAtLabel: 'Created at',
      downloadPdfLabel: 'Download PDF',
      generatingPdfLabel: 'Generating PDF...',
      editProjectLabel: 'Edit Project',
      historyLabel: 'History',
      pricePercentageLabel: 'Price Percentage',
      addInvoiceActionLabel: 'Add Invoice Action',
      autoInvoicesLabel: 'View Automatic Invoices',
      actionsLabel: 'Actions',
      exportingPdf: false,
      statusActions: [
        { status: ConvertStatus.SEND_TO_CLIENT, label: 'Sent to client', tone: 'info' },
      ],
      changeStatusModalTitle: 'Change Project Status',
      notesLabel: 'Notes',
      notesPlaceholder: 'Add notes',
      cancelLabel: 'Cancel',
      saveStatusLabel: 'Save Status',
      changingStatusLabel: 'Saving status...',
      changeStatusLoading: false,
      hasAutoInvoices: true,
      formatDate: () => '08 Jul 2026',
      formatTime: () => '02:45 PM',
      ...props,
    },
    global: {
      stubs: {
        ProjectHeroBreadcrumb: {
          props: ['currentLabel'],
          template: '<nav class="project-hero-breadcrumb-stub">{{ currentLabel }}</nav>',
        },
        AutoInvoicesModal: {
          props: ['projectId'],
          emits: ['close'],
          template:
            '<div class="auto-invoices-modal-stub"><button class="close-auto-invoices" @click="$emit(\'close\')">close</button></div>',
        },
        RouterLink: {
          props: ['to'],
          template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
        },
        ...globalStubs,
      },
    },
  });

describe('ProjectShowHeader', () => {
  it('renders project metadata and emits pdf download action', async () => {
    const wrapper = mountHeader();

    expect(wrapper.text()).toContain('Test Project');
    expect(wrapper.text()).toContain('Villa');
    expect(wrapper.text()).toContain('Project Code: 24');
    expect(wrapper.text()).toContain('Active');
    expect(wrapper.text()).toContain('Actions');
    expect(wrapper.find('img[alt="Test Project"]').attributes('src')).toBe('/project.png');

    await wrapper.find('.project-actions__trigger').trigger('click');
    await wrapper
      .findAll('.project-actions__item')
      .find((item) => item.text().includes('Download PDF'))
      ?.trigger('click');

    expect(wrapper.emitted('downloadPdf')).toHaveLength(1);
  });

  it('uses the villa fallback once when the backend hero image fails', async () => {
    const wrapper = mountHeader();
    const image = wrapper.find<HTMLImageElement>('.project-hero__background');

    await image.trigger('error');

    expect(image.attributes('src')).toBe('/fallback-villa.png');
    expect(image.attributes('data-fallback-applied')).toBe('true');

    await image.trigger('error');

    expect(image.attributes('src')).toBe('/fallback-villa.png');
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

  it('supports keyboard navigation and restores focus when the actions menu closes', async () => {
    const wrapper = mountHeader({}, document.body);
    const trigger = wrapper.find<HTMLButtonElement>('.project-actions__trigger');

    trigger.element.focus();
    await trigger.trigger('keydown', { key: 'ArrowDown' });
    await nextTick();

    const menuItems = wrapper.findAll<HTMLElement>('[role="menuitem"]');

    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
    expect(document.activeElement).toBe(menuItems[0].element);

    await menuItems[0].trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItems[1].element);

    await menuItems[1].trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
    expect(document.activeElement).toBe(trigger.element);

    wrapper.unmount();
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
      .find((item) => item.text().includes('Sent to client'))
      ?.trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Change Project Status');
    expect(wrapper.find('input[readonly]').exists()).toBe(false);
    expect(wrapper.find('select').exists()).toBe(false);

    await wrapper.find('textarea').setValue('Client approved');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('changeProjectStatus')).toEqual([
      [{ status: ConvertStatus.SEND_TO_CLIENT, notes: 'Client approved' }],
    ]);
  });

  it('teleports the status modal outside the isolated project hero', async () => {
    const wrapper = mountHeader({}, document.body, { teleport: false });
    const documentWrapper = new DOMWrapper(document.body);

    await wrapper.find('.project-actions__trigger').trigger('click');
    await nextTick();
    await documentWrapper
      .findAll('.project-actions__item')
      .find((item) => item.text().includes('Sent to client'))
      ?.trigger('click');
    await nextTick();

    expect(document.body.querySelector('.project-status-modal')).not.toBeNull();
    expect(wrapper.element.querySelector('.project-status-modal')).toBeNull();

    wrapper.unmount();
  });

  it('renders accept and reject actions for sent-to-client projects', async () => {
    const wrapper = mountHeader({
      statusActions: [
        { status: ConvertStatus.ACCEPT_CLIENT, label: 'Accepted by client', tone: 'success' },
        { status: ConvertStatus.REJECT_CLIENT, label: 'Rejected by client', tone: 'danger' },
      ],
    });

    await wrapper.find('.project-actions__trigger').trigger('click');

    expect(wrapper.text()).toContain('Accepted by client');
    expect(wrapper.text()).toContain('Rejected by client');

    await wrapper
      .findAll('.project-actions__item')
      .find((item) => item.text().includes('Rejected by client'))
      ?.trigger('click');
    await nextTick();
    await wrapper.find('textarea').setValue('Client rejected');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('changeProjectStatus')).toEqual([
      [{ status: ConvertStatus.REJECT_CLIENT, notes: 'Client rejected' }],
    ]);
  });

  it('does not render status actions when the project is accepted', async () => {
    const wrapper = mountHeader({
      statusActions: [],
    });

    await wrapper.find('.project-actions__trigger').trigger('click');

    expect(wrapper.text()).not.toContain('Sent to client');
    expect(wrapper.text()).not.toContain('Accepted by client');
    expect(wrapper.text()).not.toContain('Rejected by client');
  });

  it('links the invoice offer settings before automatic invoices exist', async () => {
    const wrapper = mountHeader({ hasAutoInvoices: false });

    await wrapper.find('.project-actions__trigger').trigger('click');

    const link = wrapper
      .findAll('.project-actions__item')
      .find((item) => item.text().includes('Price Percentage'));

    expect(link?.attributes('data-to')).toBe(
      JSON.stringify({ name: 'project-price-percentage', params: { project_id: 24 } }),
    );
  });

  it('hides the price percentage action unless the project is ready to send', async () => {
    const wrapper = mountHeader({
      hasAutoInvoices: false,
      project: {
        id: 24,
        convert_status: ConvertStatus.WAITING_PRICING,
        date: '2026-07-08',
        created_at: '2026-07-08 14:45:30',
      },
    });

    await wrapper.find('.project-actions__trigger').trigger('click');

    expect(wrapper.text()).not.toContain('Price Percentage');
  });

  it('links the add invoice action page to the current project', async () => {
    const wrapper = mountHeader();

    await wrapper.find('.project-actions__trigger').trigger('click');

    const link = wrapper
      .findAll('.project-actions__item')
      .find((item) => item.text().includes('Add Invoice Action'));

    expect(link?.attributes('data-to')).toBe(
      JSON.stringify({ name: 'project-invoice-action-add', params: { project_id: 24 } }),
    );
  });

  it('opens the automatic invoices modal from the actions menu', async () => {
    const wrapper = mountHeader();

    await wrapper.find('.project-actions__trigger').trigger('click');
    await wrapper.find('.project-actions__auto-invoices').trigger('click');

    expect(wrapper.find('.auto-invoices-modal-stub').exists()).toBe(true);

    await wrapper.find('.close-auto-invoices').trigger('click');
    expect(wrapper.find('.auto-invoices-modal-stub').exists()).toBe(false);
  });

  it('hides the automatic invoices action when the project has no automatic invoices', async () => {
    const wrapper = mountHeader({ hasAutoInvoices: false });

    await wrapper.find('.project-actions__trigger').trigger('click');

    expect(wrapper.find('.project-actions__auto-invoices').exists()).toBe(false);
  });
});
