import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, reactive } from 'vue';
import { ConvertStatus } from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';
import { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';
import ProjectIndex from '../ProjectIndex.vue';

const fetchList = vi.fn();
const deleteProject = vi.fn();
const routerPush = vi.fn();
let routeName = 'project';
const routeQuery = reactive<Record<string, string | string[] | undefined>>({});
const routeMeta = reactive<Record<string, unknown>>({
  breadcrumb: 'project.breadcrumb.requests',
  pageHeaderDescription: 'project.page.requests_description',
  pageHeaderActionLabel: 'project.page.add_request',
});

vi.mock('vue-router', () => ({
  useRoute: () => ({ name: routeName, query: routeQuery, meta: routeMeta }),
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('../../controllers/project.controller', () => ({
  default: {
    getInstance: () => ({
      listState: { value: {} },
      pagination: { value: { current_page: 1, last_page: 1, per_page: 10, total: 1 } },
      fetchList,
      delete: deleteProject,
    }),
  },
}));

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
};

const globalOptions = {
  stubs: {
    RouterLink: routerLinkStub,
    UpdatedCustomInputSelect: {
      name: 'UpdatedCustomInputSelect',
      props: ['modelValue', 'staticOptions'],
      emits: ['update:modelValue'],
      template: `
        <button
          type="button"
          class="custom-service-type-select"
          @click="$emit('update:modelValue', staticOptions.find((option) => option.id === 2))"
        >
          {{ modelValue?.title }}
        </button>
      `,
    },
    DataStatusBuilder: {
      props: ['controller', 'onRetry'],
      template: '<div><slot name="success" :data="[{ id: 7, title: `Tower` }]" /></div>',
    },
    AppTable: {
      props: ['headers', 'items'],
      template: `
        <div class="app-table">
          <span v-for="header in headers" :key="header.key" class="table-header">
            {{ $t(header.label) }}
          </span>
          <slot name="cell-serviceType" :item="{ serviceType: 3 }" />
          <slot name="actions" :item="items[0]" />
        </div>
      `,
    },
    Pagination: {
      emits: ['changePage', 'countPerPage'],
      template: '<button class="change-page" @click="$emit(`changePage`, 2)">next</button>',
    },
    TableSkelaton: true,
    DeleteDialog: {
      emits: ['delete'],
      template:
        '<button class="delete-dialog" @click="$emit(`delete`)"><slot name="btn" /></button>',
    },
  },
};

const mountProjectIndex = (props = {}) =>
  mount(ProjectIndex, {
    props,
    global: globalOptions,
  });

describe('ProjectIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeName = 'project';
    Object.keys(routeQuery).forEach((key) => delete routeQuery[key]);
    routeMeta.breadcrumb = 'project.breadcrumb.requests';
    routeMeta.pageHeaderDescription = 'project.page.requests_description';
    routeMeta.pageHeaderActionLabel = 'project.page.add_request';
  });

  it('renders translated project index actions and fetches the list', async () => {
    const wrapper = mountProjectIndex();
    await nextTick();

    expect(fetchList).toHaveBeenCalled();
    expect(fetchList.mock.calls[0][0].toMap()).toMatchObject({
      status: [ConvertStatus.WAITING_PREVIEW, ConvertStatus.WAITING_PREVIEW_RESULT],
    });
    expect(wrapper.find('button.action-btn.delete').attributes('title')).toBe('Delete');
  });

  it.each([
    {
      breadcrumb: 'project.breadcrumb.requests',
      description: 'project.page.requests_description',
      action: 'project.page.add_request',
      english: ['Requests', 'Manage new organization requests', 'Add request'],
      arabic: ['طلبات', 'إدارة طلبات الشركات الجديدة', 'إضافة طلب'],
    },
    {
      breadcrumb: 'project.breadcrumb.offers',
      description: 'project.page.offers_description',
      action: 'project.page.add_offer',
      english: ['Offer Project', 'Manage project offers', 'Add offer'],
      arabic: ['عروض المشاريع', 'إدارة عروض المشاريع', 'إضافة عرض'],
    },
    {
      breadcrumb: 'project.breadcrumb.converted',
      description: 'project.page.converted_description',
      action: 'project.page.add_project',
      english: ['Project', 'Manage converted projects', 'Add project'],
      arabic: ['المشروع', 'إدارة المشروعات المحوّلة', 'إضافة مشروع'],
    },
  ])(
    'uses $breadcrumb metadata for all localized page-header copy',
    async ({ breadcrumb, description, action, english, arabic }) => {
      routeMeta.breadcrumb = breadcrumb;
      routeMeta.pageHeaderDescription = description;
      routeMeta.pageHeaderActionLabel = action;
      const wrapper = mountProjectIndex();
      await nextTick();
      const i18n = wrapper.vm.$i18n as { locale: string };
      const pageHeader = wrapper.get('.page-header');
      const actionButton = pageHeader.get('.toolbar .btn-primary');

      expect(pageHeader.get('h4').text()).toBe(english[0]);
      expect(pageHeader.get('p').text()).toBe(english[1]);
      expect(actionButton.text()).toBe(english[2]);

      i18n.locale = 'ar';
      await nextTick();

      expect(pageHeader.get('h4').text()).toBe(arabic[0]);
      expect(pageHeader.get('p').text()).toBe(arabic[1]);
      expect(actionButton.text()).toBe(arabic[2]);
      i18n.locale = 'en';
    },
  );

  it('fetches projects with the provided status filters', async () => {
    mountProjectIndex({
      statuses: [
        ConvertStatus.CONVERT_TO_PROJECT,
        ConvertStatus.SEND_TO_CLIENT,
        ConvertStatus.REVISE_VERSION,
      ],
    });
    await nextTick();

    expect(fetchList.mock.calls.at(-1)?.[0].toMap()).toMatchObject({
      status: [
        ConvertStatus.CONVERT_TO_PROJECT,
        ConvertStatus.SEND_TO_CLIENT,
        ConvertStatus.REVISE_VERSION,
      ],
    });
  });

  it('sends the route service type as an array and refetches when it changes', async () => {
    routeQuery.service_type = String(DepartmentTypeEnum.DESIGN);
    mountProjectIndex();
    await nextTick();

    expect(fetchList.mock.calls.at(-1)?.[0].toMap()).toMatchObject({
      service_type: [DepartmentTypeEnum.DESIGN],
    });

    routeQuery.service_type = [
      String(DepartmentTypeEnum.SUPERVISION),
      String(DepartmentTypeEnum.DESIGN),
    ];
    await nextTick();

    expect(fetchList.mock.calls.at(-1)?.[0].toMap()).toMatchObject({
      service_type: [DepartmentTypeEnum.SUPERVISION, DepartmentTypeEnum.DESIGN],
    });
  });

  it('shows the service-type column and writes the quick filter to the route', async () => {
    const wrapper = mountProjectIndex();
    await nextTick();

    expect(wrapper.findAll('.table-header').map((header) => header.text())).toContain('Service type');
    expect(wrapper.get('.service-type-badge').text()).toBe('Design and Execution');

    await wrapper.get('.custom-service-type-select').trigger('click');

    expect(routerPush).toHaveBeenLastCalledWith({
      query: expect.objectContaining({
        page: '1',
        service_type: String(DepartmentTypeEnum.SUPERVISION),
      }),
    });
  });

  it.each(['offers-projects', 'converted-projects'])(
    'hides the service-type quick filter on the %s page',
    async (name) => {
      routeName = name;
      const wrapper = mountProjectIndex();
      await nextTick();

      expect(wrapper.find('.service-type-filter').exists()).toBe(false);
    },
  );

  it('omits invalid route service types from the list request', async () => {
    routeQuery.service_type = 'invalid';
    mountProjectIndex();
    await nextTick();

    expect(fetchList.mock.calls.at(-1)?.[0].toMap()).not.toHaveProperty('service_type');
  });

  it('deletes a project from the row action', async () => {
    const wrapper = mountProjectIndex();

    await wrapper.find('.delete-dialog').trigger('click');

    expect(deleteProject).toHaveBeenCalled();
    expect(deleteProject.mock.calls[0][0].toMap()).toEqual({ projectId: 7 });
  });
});
