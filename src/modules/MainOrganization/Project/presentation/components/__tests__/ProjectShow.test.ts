import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { nextTick } from 'vue';
import ProjectShowModel from '../../../core/models/project.show.model';
import ProjectShow from '../ProjectShow.vue';

const fetchOne = vi.fn();
const changeProjectStatus = vi.fn().mockResolvedValue(new DataSuccess<void>({}));

const projectResponse = ProjectShowModel.fromJson({
  id: 24,
  organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
  employee: { id: 1, name: 'Techlab Employee' },
  client: { id: 16, name: 'Marny Barnett', phone: '+1 (855) 934-1348', email: null },
  project_type: {
    id: 2,
    title: [{ locale: 'en', title: 'Commercial Project' }],
  },
  location: {
    id: 13,
    title: [{ locale: 'en', title: 'City' }],
    parent: {
      id: 11,
      title: [{ locale: 'en', title: 'Governorate' }],
      parent: {
        id: 8,
        title: [{ locale: 'en', title: 'Country' }],
        parent: null,
      },
    },
  },
  service_type: 3,
  status: 1,
  convert_status: 4,
  title: [{ locale: 'en', title: 'test' }],
  description: [{ locale: 'en', description: 'Project description' }],
  date: '2026-07-08',
  notes: 'Adipisci voluptas re',
  terms: 'First payment after approval\nSecond payment after delivery',
  site_description: 'At quae dignissimos',
  project_floors: [
    {
      id: 14,
      status: 1,
      floor_number: 2,
      project_preview: {
        id: 16,
        engineer: { id: 24, name: 'Adria Byers' },
        pricing_responsible: { id: 9, name: 'Fleur Armstrong' },
        notification_type: 1,
        notification_message: 'dfgsg',
        preview_date: '2026-07-08',
        preview_time: '17:44:00',
        site_link: 'https://www.jojijoluraja.net',
      },
      spaces: [
        {
          id: 25,
          space: { id: 3, title: 'Living Room' },
          length: '87.00',
          width: '66.00',
          height: '35.00',
          notes: 'Officiis corrupti n',
          attachments: [
            {
              id: 66,
              file: 'https://api.buildhub.techlabeg.com/attachments/project_floor_spaces/p1i2wAlkoI_1783600450.png',
              file_size: '23.16 KB',
              alt: 'Living Room Attachment',
            },
          ],
        },
      ],
    },
  ],
  project_floor_spaces: [],
  project_departments: [
    {
      id: 4,
      created_at: '2026-07-08 09:36:38',
      department: { id: 1, title: 'dddd' },
      items: [
        {
          id: 9,
          uuid: 'f643c531-d970-45d4-8d4f-5e90f02507fb',
          item: { id: 5, title: 'Qui impedit nemo ea' },
          quantity: 1,
          price: 5,
          final_price: 5,
          pricing_method: 1,
          project_floor_id: null,
          project_floor_space_id: null,
          created_at: '2026-07-08 09:36:38',
        },
      ],
    },
  ],
  project_department_items: [],
  project_pricing: {
    id: 6,
    total_tax: 14,
    discount_type: 2,
    discount_value: 10,
    price_after_discount: 661.77,
    created_at: '2026-07-08 09:36:38',
  },
  attachments: [],
  created_at: '2026-07-08 14:45:30',
});

vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => ({
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(() => ({})),
  useRoute: () => ({ params: { project_id: '24' } }),
  RouterLink: {
    props: ['to'],
    template: '<a><slot /></a>',
  },
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({
    locale: { value: 'en' },
    t: (key: string, params?: Record<string, number>) => {
      const translations: Record<string, string> = {
        'Project.list_title': 'Projects',
        'ProjectShow.project_details': 'Project Details',
        'ProjectShow.project_information': 'Project Information',
        'ProjectShow.project_information_summary': 'Project Information Summary',
        'ProjectShow.view_all_information': 'View all project information',
        'ProjectShow.project_floors_summary': 'Project Floors Summary',
        'ProjectShow.floor_spaces_details': 'Floor Spaces Details',
        'ProjectShow.additional_information': 'Additional Information',
        'ProjectShow.no_attachments': 'No attachments uploaded',
        'ProjectShow.active': 'Active',
        'ProjectShow.completed': 'Completed',
        'ProjectShow.project_code': 'Project Code',
        'ProjectShow.created_at': 'Created at',
        'ProjectShow.currency_egp': 'EGP',
        'ProjectShow.change_status': 'Change Status',
        'ProjectShow.change_status_title': 'Change Project Status',
        'ProjectShow.change_status_notes_placeholder': 'Add notes about this status change',
        'ProjectShow.save_status': 'Save Status',
        'ProjectShow.changing_status': 'Saving status...',
        'general.actions': 'Actions',
        'ProjectShow.department': 'Department',
        'ProjectShow.departments_count_label': 'Departments',
        'ProjectShow.departments_hint': 'Click a department to view its items',
        'ProjectShow.departments_single_open_hint':
          'Only one department is opened at a time to keep the page clean.',
        'ProjectShow.final_price': 'Final price',
        'ProjectShow.client': 'Client',
        'ProjectShow.organization': 'Organization',
        'ProjectShow.project_manager': 'Project Manager',
        'ProjectShow.pricing_responsible': 'Pricing Responsible',
        'ProjectShow.project_date': 'Project Date',
        'ProjectShow.project_departments': 'Project Departments',
        'ProjectShow.typical_floor': 'Typical Floor',
        'ProjectShow.total_area_all_spaces': 'Total Area (All Spaces)',
        'ProjectShow.no_project_items': 'No project items added yet',
        'ProjectShow.no_project_pricing': 'No project pricing added yet',
        'ProjectShow.attachments_count': 'Attachments',
        'ProjectShow.items_count_label': 'Items',
        'ProjectShow.item_count_label': 'Items',
        'ProjectShow.unit_price': 'Unit price',
        'Project.steps.project_data': 'Project Data',
        'Project.steps.project_preview': 'Project Preview',
        'Project.steps.project_floors': 'Project Floors',
        'Project.steps.project_items': 'Project Items',
        terms: 'Terms',
        'Project.service_types.both': 'Design & Execution',
        'Project.service_type': 'Service Type',
        'Project.engineer': 'Engineer',
        'Project.site_description': 'Site Description',
        'Project.notes': 'Notes',
        'project.convertStatus.pending': 'Pending',
        'project.convertStatus.convertToProject': 'Converted to project',
        'project.convertStatus.sendToClient': 'Sent to client',
        'project.convertStatus.reviseVersion': 'Revised version',
        'project.convertStatus.acceptClient': 'Accepted by client',
        'project.convertStatus.rejectClient': 'Rejected by client',
        'Project.spaces': 'Spaces',
        'Project.preview_date': 'Preview Date',
        'Project.preview_time': 'Preview Time',
        'Project.attachments': 'Attachments',
        'ProjectFloor.floor_numbers.SECOND_FLOOR': 'Second floor',
        'ProjectFloor.space': 'Space',
        'project_item.item': 'Item',
        'project_item.quantity': 'Quantity',
        'project_item.price': 'Price',
        'project_item.pricing_method': 'Pricing method',
        'project_item.pricing_methods.GENERAL_ITEM': 'General item',
        'project_pricing.index.title': 'Project Pricing',
        'project_pricing.total_tax': 'Total tax',
        'project_pricing.discount_type': 'Discount type',
        'project_pricing.discount_value': 'Discount value',
        'project_pricing.final_total': 'Final total',
        'project_pricing.discount_types.PERCENTAGE': 'Percentage',
        status: 'Status',
        cancel: 'Cancel',
        location: 'Location',
        project_type_id: 'Project Type',
        id: 'ID',
        title: 'Title',
        address: 'Address',
        loading: 'Loading...',
        no_data: 'No data',
      };

      if (key === 'ProjectPreview.visit_title') return `Visit ${params?.number ?? ''}`;

      return translations[key] ?? key;
    },
  }),
}));

vi.mock('../../controllers/project.controller', () => ({
  default: {
    getInstance: () => ({
      itemState: { value: {} },
      itemData: { value: projectResponse },
      errorMessage: { value: null },
      fetchOne,
      changeProjectStatus,
    }),
  },
}));

const mountProjectShow = () =>
  mount(ProjectShow, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
        DataStatusBuilder: {
          template: '<div><slot name="success" /></div>',
        },
        Image: {
          props: ['src', 'alt'],
          template: '<img :src="src" :alt="alt" />',
        },
        ProjectHeroBreadcrumb: {
          props: ['currentLabel'],
          template: '<nav>{{ currentLabel }}</nav>',
        },
        Accordion: {
          template: '<div class="p-accordion"><slot /></div>',
        },
        AccordionPanel: {
          template: '<section class="p-accordionpanel"><slot /></section>',
        },
        AccordionHeader: {
          template: '<button class="p-accordionheader"><slot /></button>',
        },
        AccordionContent: {
          template: '<div class="p-accordioncontent"><slot /></div>',
        },
      },
    },
  });

describe('ProjectShow', () => {
  beforeEach(() => {
    fetchOne.mockClear();
    changeProjectStatus.mockClear();
  });

  it('fetches the project and renders show-project data from the same controller response', async () => {
    const wrapper = mountProjectShow();
    await nextTick();

    expect(fetchOne).toHaveBeenCalledTimes(1);
    expect(fetchOne.mock.calls[0][0].toMap()).toEqual({ project_id: 24 });
    expect(wrapper.text()).toContain('test');
    expect(wrapper.text()).toContain('Marny Barnett');
    expect(wrapper.text()).toContain('Techlab Headquarters');
    expect(wrapper.text()).toContain('Adria Byers');
    expect(wrapper.text()).toContain('Fleur Armstrong');
    expect(wrapper.text()).toContain('Living Room');
    expect(wrapper.text()).toContain('Second floor');
    expect(wrapper.text()).toContain('5,742.00');
    expect(wrapper.text()).toContain('Project Departments');
    expect(wrapper.text()).toContain('dddd');
    expect(wrapper.text()).toContain('Qui impedit nemo ea');
    expect(wrapper.text()).toContain('General item');
    expect(wrapper.text()).toContain('5.00 EGP');
    expect(wrapper.text()).toContain('Only one department is opened at a time');
    expect(wrapper.text()).toContain('Project Pricing');
    expect(wrapper.text()).toContain('661.77');
    expect(wrapper.text()).toContain('Terms');
    expect(wrapper.text()).toContain('First payment after approval');
    expect(wrapper.text()).toContain('Second payment after delivery');
    expect(wrapper.find('img[src*="p1i2wAlkoI_1783600450.png"]').exists()).toBe(true);
  });

  it('opens the target dashboard summary sections while keeping dense data accessible', async () => {
    const wrapper = mountProjectShow();
    await nextTick();

    expect(wrapper.find('.project-dashboard-grid').exists()).toBe(true);
    expect(wrapper.find('.project-dashboard-main').exists()).toBe(true);
    expect(wrapper.find('.project-dashboard-side').exists()).toBe(true);
    const visibleCardDisclosures = wrapper.findAll('.project-section-disclosure');

    expect(visibleCardDisclosures).toHaveLength(5);
    expect(wrapper.find('#project-data').attributes('open')).toBe('');
    expect(wrapper.find('#project-preview').attributes('open')).toBe('');
    expect(wrapper.find('#project-items').attributes('open')).toBeUndefined();
    expect(wrapper.find('.project-spaces-card').attributes('open')).toBeUndefined();
    expect(wrapper.find('#project-pricing').attributes('open')).toBeUndefined();
    expect(wrapper.findAll('.project-section-disclosure > summary')).toHaveLength(5);
    expect(wrapper.findAll('.project-stats .project-stat-card')).toHaveLength(4);
    expect(wrapper.findAll('.project-info-summary-grid .project-info-field')).toHaveLength(8);
    expect(wrapper.find('.project-floors-disclosure').attributes('open')).toBe('');
    expect(wrapper.find('.project-terms-disclosure').attributes('open')).toBeUndefined();
    expect(wrapper.find('.project-preview-illustration').exists()).toBe(true);
  });

  it('sends selected project status and notes from the header modal', async () => {
    const wrapper = mountProjectShow();
    await nextTick();

    await wrapper
      .findAll('button')
      .find((button) => button.text().includes('Actions'))
      ?.trigger('click');
    await nextTick();

    const changeStatusButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Sent to client'));

    expect(changeStatusButton).toBeTruthy();

    await changeStatusButton?.trigger('click');
    await nextTick();
    await wrapper.find('textarea').setValue('Approved by client');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(changeProjectStatus).toHaveBeenCalledTimes(1);
    expect(changeProjectStatus.mock.calls[0][0].toMap()).toEqual({
      project_id: 24,
      status: 11,
      notes: 'Approved by client',
    });
  });
});
