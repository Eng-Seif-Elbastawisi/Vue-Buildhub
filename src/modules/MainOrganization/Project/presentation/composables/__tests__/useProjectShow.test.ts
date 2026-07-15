import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectShow } from '../useProjectShow';
import { ConvertStatus } from '../../../core/constants/convert.status.enum';

const fetchOne = vi.fn();
const itemData = {
  value: {
    id: 24,
    status: 1,
    convert_status: 1,
    title: [{ locale: 'en', title: 'Project Alpha' }],
    client: { id: 16, name: 'Marny Barnett', phone: '+1 (855) 934-1348' },
    organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
    location: { id: 13, title: [{ locale: 'en', title: 'City' }], parent: null },
    project_type: { id: 2, title: [{ locale: 'en', title: 'Commercial Project' }] },
    employee: { id: 1, name: 'Techlab Employee' },
    service_type: 3,
    date: '2026-07-08',
    notes: 'Project notes',
    terms: 'First payment after approval\nSecond payment after delivery',
    site_description: 'Site description',
    project_previews: [
      {
        id: 38,
        notification_type: 1,
        notification_message: 'Preview ready',
        preview_date: '2026-07-16',
        preview_time: '13:40:00',
        site_link: 'http://localhost:5173/organization/project_preview/add?project_id=32',
        address: 'Preview address',
      },
      {
        id: 37,
        notification_type: 2,
        notification_message: 'Second preview',
        preview_date: '2026-07-20',
        preview_time: '12:39:00',
        site_link: 'http://localhost:5173/organization/project_preview/add?project_id=32',
        address: 'Second preview address',
      },
    ],
    project_floors: [],
    project_floor_spaces: [],
    project_department_items: [],
    project_departments: [
      {
        id: 4,
        created_at: '2026-07-08 09:36:38',
        department: { id: 1, title: 'Engineering' },
        items: [
          {
            id: 9,
            item: { id: 5, title: 'Concrete' },
            quantity: 1,
            price: 5,
            final_price: 5,
            pricing_method: 1,
            created_at: '2026-07-08 09:36:38',
          },
        ],
      },
    ],
    project_pricing: null,
    attachments: [],
    created_at: '2026-07-08 14:45:30',
  },
};

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { project_id: '24' } }),
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({
    locale: { value: 'en' },
    t: (key: string) => key,
  }),
}));

vi.mock('../../controllers/project.controller', () => ({
  default: {
    getInstance: () => ({
      itemState: { value: {} },
      itemData,
      errorMessage: { value: null },
      fetchOne,
      convertMeasurementToProject: vi.fn(),
      storeVersion: vi.fn(),
      reviseVersion: vi.fn(),
    }),
  },
}));

const mountComposable = () => {
  const exposed = {} as ReturnType<typeof useProjectShow>;

  mount({
    setup() {
      Object.assign(exposed, useProjectShow());

      return () => null;
    },
  });

  return exposed;
};

describe('useProjectShow', () => {
  beforeEach(() => {
    fetchOne.mockClear();
    itemData.value.status = ConvertStatus.PENDING;
    itemData.value.convert_status = ConvertStatus.PENDING;
  });

  it('fetches the project and exposes grouped props for the show page sections', async () => {
    const projectShow = mountComposable();
    await nextTick();

    expect(fetchOne).toHaveBeenCalledTimes(1);
    expect(fetchOne.mock.calls[0][0].toMap()).toEqual({ project_id: 24 });
    expect(projectShow.headerProps.value.projectTitle).toBe('Project Alpha');
    expect(projectShow.headerProps.value.convertActionLabel).toBe(
      'project.convertActions.convertMeasurementToProject',
    );
    expect(projectShow.headerProps.value.statusActions).toEqual([
      {
        status: ConvertStatus.SEND_TO_CLIENT,
        label: 'project.convertStatus.sendToClient',
        tone: 'info',
      },
    ]);
    expect(projectShow.tabsProps.value.activeTab).toBe('project-data');
    expect(projectShow.sideColumnProps.value.terms).toBe(
      'First payment after approval\nSecond payment after delivery',
    );
    expect(projectShow.sideColumnProps.value.preview?.id).toBe(38);
    expect(projectShow.sideColumnProps.value.previews).toHaveLength(2);
    expect(projectShow.sideColumnProps.value.preview?.notification_message).toBe('Preview ready');
    expect(projectShow.departmentsSectionProps.value.departments).toHaveLength(1);
    expect(projectShow.departmentsSectionProps.value.departments[0].department.title).toBe(
      'Engineering',
    );

    projectShow.goToSection('project-items');

    expect(projectShow.tabsProps.value.activeTab).toBe('project-items');
    expect(projectShow.departmentsSectionProps.value.class).toEqual({
      'project-card--active-section': true,
    });

    projectShow.goToSection('project-terms');

    expect(projectShow.tabsProps.value.activeTab).toBe('project-terms');
    expect(projectShow.sideColumnProps.value.class).toEqual({
      'project-side-column--active-preview': false,
      'project-side-column--active-terms': true,
    });
  });

  it('exposes status actions based on the current status badge', async () => {
    itemData.value.convert_status = ConvertStatus.SEND_TO_CLIENT;
    itemData.value.status = ConvertStatus.SEND_TO_CLIENT;

    const sentToClientProjectShow = mountComposable();
    await nextTick();

    expect(sentToClientProjectShow.headerProps.value.convertActionLabel).toBe('');
    expect(sentToClientProjectShow.headerProps.value.statusActions).toEqual([
      {
        status: ConvertStatus.ACCEPT_CLIENT,
        label: 'project.convertStatus.acceptClient',
        tone: 'success',
      },
      {
        status: ConvertStatus.REJECT_CLIENT,
        label: 'project.convertStatus.rejectClient',
        tone: 'danger',
      },
    ]);

    itemData.value.convert_status = ConvertStatus.ACCEPT_CLIENT;
    itemData.value.status = ConvertStatus.ACCEPT_CLIENT;

    const acceptedProjectShow = mountComposable();
    await nextTick();

    expect(acceptedProjectShow.headerProps.value.statusActions).toEqual([]);

    itemData.value.convert_status = ConvertStatus.REJECT_CLIENT;
    itemData.value.status = ConvertStatus.REJECT_CLIENT;

    const rejectedProjectShow = mountComposable();
    await nextTick();

    expect(rejectedProjectShow.headerProps.value.statusActions).toEqual([
      {
        status: ConvertStatus.REVISE_VERSION,
        label: 'project.convertStatus.reviseVersion',
        tone: 'warning',
      },
    ]);
  });
});
