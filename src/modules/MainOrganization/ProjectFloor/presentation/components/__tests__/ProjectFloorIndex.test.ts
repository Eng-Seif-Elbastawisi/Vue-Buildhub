import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ProjectFloorIndex from '../ProjectFloorIndex.vue';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: {}, query: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { isMaster: false } })),
}));

vi.mock('../../controllers/project.floor.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      listState: { value: {} },
      pagination: { value: {} },
      fetchList: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

describe('ProjectFloorIndex.vue', () => {
  it('is defined', () => {
    expect(ProjectFloorIndex).toBeDefined();
  });

  it('shows project-floor-specific copy and add route when the list is empty', () => {
    const wrapper = mount(ProjectFloorIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: { template: '<div><slot name="empty" /></div>' },
          RouterLink: {
            props: ['to'],
            template: '<a :data-route-name="to.name"><slot /></a>',
          },
          AppTable: true,
          DeleteDialog: true,
          Pagination: true,
          TableSkelaton: true,
        },
      },
    });

    expect(wrapper.text()).toContain('project_floor.empty_title');
    expect(wrapper.text()).toContain('project_floor.empty_description');
    expect(wrapper.get('[data-route-name="add-project_floor"]').text()).toContain(
      'project_floor.add',
    );
  });
});
