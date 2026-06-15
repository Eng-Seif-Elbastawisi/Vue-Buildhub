import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ProjectIndex from '../ProjectIndex.vue';
const fetchList = vi.fn().mockResolvedValue({});
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('../../controllers/project.controller', () => ({
  default: {
    getInstance: () => ({ fetchList, delete: vi.fn(), listState: ref({}), pagination: ref(null) }),
  },
}));
describe('ProjectIndex', () => {
  it('renders and fetches projects', () => {
    const wrapper = mount(ProjectIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: true,
          AppTable: true,
          Pagination: true,
          TableSkelaton: true,
          DeleteDialog: true,
          RouterLink: true,
        },
      },
    });
    expect(wrapper.text()).toContain('project.list_title');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });
});
