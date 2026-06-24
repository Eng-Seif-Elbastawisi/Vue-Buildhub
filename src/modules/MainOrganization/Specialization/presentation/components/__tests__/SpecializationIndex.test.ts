import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import SpecializationIndex from '../SpecializationIndex.vue';

const fetchList = vi.fn().mockResolvedValue({});
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ user: { isMaster: true } }) }));
vi.mock('../../controllers/specialization.controller', () => ({
  default: {
    getInstance: () => ({ fetchList, delete: vi.fn(), listState: ref({}), pagination: ref(null) }),
  },
}));

describe('SpecializationIndex', () => {
  it('renders and fetches projects', () => {
    const wrapper = mount(SpecializationIndex, {
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
    expect(wrapper.text()).toContain('Specialization.list_title');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });
});
