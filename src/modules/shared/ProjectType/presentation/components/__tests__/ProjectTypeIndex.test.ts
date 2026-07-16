import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ProjectTypeIndex from '../ProjectTypeIndex.vue';
const fetchList = vi.fn().mockResolvedValue({});
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ user: { isMaster: true } }) }));
vi.mock('../../controllers/project-type.controller', () => ({
  default: {
    getInstance: () => ({ fetchList, delete: vi.fn(), listState: ref({}), pagination: ref(null) }),
  },
}));
describe('ProjectTypeIndex', () => {
  it('renders and fetches projects', () => {
    const wrapper = mount(ProjectTypeIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: { template: '<div><slot name="empty" /></div>' },
          AppTable: true,
          Pagination: true,
          TableSkelaton: true,
          DeleteDialog: true,
          RouterLink: true,
        },
      },
    });
    expect(wrapper.text()).toContain('project.list_title');
    expect(wrapper.text()).toContain('project_type.empty_title');
    expect(wrapper.text()).toContain('project_type.empty_description');
    expect(wrapper.text()).not.toContain('project.empty_title');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });
});
