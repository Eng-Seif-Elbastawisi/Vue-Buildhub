import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ClientIndex from '../clientIndex.vue';

const fetchList = vi.fn().mockResolvedValue({});

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ user: { isMaster: true } }) }));
vi.mock('../../controllers/client.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: vi.fn(),
      listState: ref({}),
      pagination: ref(null),
    }),
  },
}));

describe('ClientIndex', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses client labels and fetches the list on mount', () => {
    const wrapper = mount(ClientIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: true,
          AppTable: true,
          Pagination: true,
          TableSkelaton: true,
          DeleteDialog: true,
          IndexDelete: true,
          RouterLink: true,
        },
      },
    });

    expect(wrapper.text()).toContain('client.list_title');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });
});
