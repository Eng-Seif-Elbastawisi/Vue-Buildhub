import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
import { DepartmentTypeEnum } from '../../../core/constants/Type.enum';
import DepartmentIndex from '../DepartmentIndex.vue';

const controllerMocks = vi.hoisted(() => ({
  fetchList: vi.fn(),
  delete: vi.fn(),
  fetchOne: vi.fn(),
  reset: vi.fn(),
  resetItem: vi.fn(),
}));

vi.mock('@/modules/shared/Department/presentation/controllers/department.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      fetchList: controllerMocks.fetchList,
      delete: controllerMocks.delete,
      fetchOne: controllerMocks.fetchOne,
      reset: controllerMocks.reset,
      resetItem: controllerMocks.resetItem,
      pagination: { value: null },
      listState: { value: { status: 'success', data: [] } },
      itemData: { value: null },
    })),
  },
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (fn: () => void) => fn,
}));

describe('DepartmentIndex', () => {
  let router: Router;

  const mountComponent = async (path: string = '/departments') => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/departments', component: { template: '<div />' } }],
    });

    await router.push(path);
    await router.isReady();

    const wrapper = mount(DepartmentIndex, {
      global: {
        plugins: [router],
        mocks: { $t: (key: string) => key },
        stubs: {
          AppTable: true,
          DataStatusBuilder: { template: '<div><slot name="empty" /></div>' },
          DeleteDialog: true,
          DepartmentAdd: true,
          EditIcon: true,
          Pagination: true,
        },
      },
    });

    await flushPromises();

    return wrapper;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controllerMocks.fetchList.mockResolvedValue({});
    controllerMocks.delete.mockResolvedValue({});
    controllerMocks.fetchOne.mockResolvedValue({});
  });

  it('is defined', () => expect(DepartmentIndex).toBeDefined());

  it('shows department-specific copy when the list is empty', async () => {
    const wrapper = await mountComponent();

    expect(wrapper.text()).toContain('department.empty_title');
    expect(wrapper.text()).toContain('department.empty_description');
    expect(wrapper.text()).not.toContain('no_emails_yet');
  });

  it.each([
    [DepartmentTypeEnum.DESIGN, 'department.design_title', 'department.design_description'],
    [
      DepartmentTypeEnum.SUPERVISION,
      'department.execution_title',
      'department.execution_description',
    ],
  ])(
    'identifies the department configuration type in the page header',
    async (type, title, description) => {
      const wrapper = await mountComponent(`/departments?type=${type}`);
      const pageHeader = wrapper.getComponent(IndexPageHeader);

      expect(pageHeader.get('h1').text()).toBe(title);
      expect(pageHeader.get('p').text()).toBe(description);
    },
  );

  it('fetches departments again when the type query changes on the same page', async () => {
    await mountComponent(`/departments?type=${DepartmentTypeEnum.DESIGN}`);

    expect(controllerMocks.fetchList).toHaveBeenCalledTimes(1);
    expect(controllerMocks.fetchList.mock.calls[0][0].toMap()).toMatchObject({
      type: DepartmentTypeEnum.DESIGN,
    });

    controllerMocks.fetchList.mockClear();

    await router.push(`/departments?type=${DepartmentTypeEnum.SUPERVISION}`);
    await flushPromises();

    expect(controllerMocks.fetchList).toHaveBeenCalledTimes(1);
    expect(controllerMocks.fetchList.mock.calls[0][0].toMap()).toMatchObject({
      page: 1,
      type: DepartmentTypeEnum.SUPERVISION,
    });
  });
});
