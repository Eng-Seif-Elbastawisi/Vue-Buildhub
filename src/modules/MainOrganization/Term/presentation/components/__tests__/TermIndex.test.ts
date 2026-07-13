import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import TermIndex from '../TermIndex.vue';

const fetchList = vi.fn().mockResolvedValue({});
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ user: { isMaster: true } }) }));
vi.mock('../../controllers/term.controller', () => ({
  default: {
    getInstance: () => ({ fetchList, delete: vi.fn(), listState: ref({}), pagination: ref(null) }),
  },
}));

describe('TermIndex', () => {
  it('renders and fetches projects', () => {
    const wrapper = mount(TermIndex, {
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
    expect(wrapper.text()).toContain('Term.list_title');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });
});
