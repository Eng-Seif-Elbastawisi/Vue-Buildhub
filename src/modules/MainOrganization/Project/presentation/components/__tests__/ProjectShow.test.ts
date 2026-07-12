import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import ProjectShowModel from '../../../core/models/project.show.model';
import ProjectShow from '../ProjectShow.vue';

const fetchOne = vi.fn();

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
  title: [{ locale: 'en', title: 'test' }],
  description: [{ locale: 'en', description: 'Project description' }],
  date: '2026-07-08',
  notes: 'Adipisci voluptas re',
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
  project_departments: [],
  project_department_items: [],
  attachments: [],
  created_at: '2026-07-08 14:45:30',
});

vi.mock('vue-router', () => ({
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
        'ProjectShow.project_floors_summary': 'Project Floors Summary',
        'ProjectShow.floor_spaces_details': 'Floor Spaces Details',
        'ProjectShow.additional_information': 'Additional Information',
        'ProjectShow.no_attachments': 'No attachments uploaded',
        'ProjectShow.active': 'Active',
        'ProjectShow.completed': 'Completed',
        'ProjectShow.project_code': 'Project Code',
        'ProjectShow.created_at': 'Created at',
        'ProjectShow.client': 'Client',
        'ProjectShow.organization': 'Organization',
        'ProjectShow.project_manager': 'Project Manager',
        'ProjectShow.pricing_responsible': 'Pricing Responsible',
        'ProjectShow.project_date': 'Project Date',
        'ProjectShow.typical_floor': 'Typical Floor',
        'ProjectShow.total_area_all_spaces': 'Total Area (All Spaces)',
        'ProjectShow.no_project_items': 'No project items added yet',
        'ProjectShow.attachments_count': 'Attachments',
        'Project.steps.project_data': 'Project Data',
        'Project.steps.project_preview': 'Project Preview',
        'Project.steps.project_floors': 'Project Floors',
        'Project.steps.project_items': 'Project Items',
        'Project.service_types.both': 'Design & Execution',
        'Project.service_type': 'Service Type',
        'Project.engineer': 'Engineer',
        'Project.site_description': 'Site Description',
        'Project.notes': 'Notes',
        'Project.spaces': 'Spaces',
        'Project.preview_date': 'Preview Date',
        'Project.preview_time': 'Preview Time',
        'Project.attachments': 'Attachments',
        'ProjectFloor.floor_numbers.SECOND_FLOOR': 'Second floor',
        'ProjectFloor.space': 'Space',
        status: 'Status',
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
      },
    },
  });

describe('ProjectShow', () => {
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
    expect(wrapper.text()).toContain('No project items added yet');
    expect(wrapper.find('img[src*="p1i2wAlkoI_1783600450.png"]').exists()).toBe(true);
  });
});
