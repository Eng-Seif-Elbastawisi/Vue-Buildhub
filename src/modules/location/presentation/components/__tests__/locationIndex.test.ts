import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import LocationIndex from '../locationIndex.vue';

const fetchList = vi.fn().mockResolvedValue({});

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ locale: ref('en'), t: (key: string) => key }) }));
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ user: { isMaster: true } }) }));
vi.mock('../../controllers/location.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: vi.fn(),
      listState: ref({}),
      pagination: ref(null),
    }),
  },
}));

describe('LocationIndex', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses location labels and fetches the list on mount', () => {
    const wrapper = mount(LocationIndex, {
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

    expect(wrapper.text()).toContain('location.list_title');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });
});
