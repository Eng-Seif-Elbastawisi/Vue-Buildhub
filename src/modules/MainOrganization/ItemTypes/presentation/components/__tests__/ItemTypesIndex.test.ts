import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ItemTypesIndex from '../ItemTypesIndex.vue';

const push = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ query: {} as Record<string, string> }));
const fetchList = vi.hoisted(() => vi.fn());

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (callback: () => void) => callback,
}));

vi.mock('../../controllers/item.types.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: vi.fn(),
      listState: ref({}),
      pagination: ref(null),
    }),
  },
}));

const mountIndex = () =>
  mount(ItemTypesIndex, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        DataStatusBuilder: true,
        AppTable: true,
        Pagination: true,
        TableSkelaton: true,
        DeleteDialog: true,
        ChangeStatusButton: true,
        IndexAddIcon: true,
        RouterLink: {
          props: ['to'],
          template: '<a :data-to="to"><slot /></a>',
        },
      },
    },
  });

describe('ItemTypesIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.query = {};
    fetchList.mockResolvedValue(undefined);
  });

  it('shows the shared list heading, search, and existing add destination', async () => {
    const wrapper = mountIndex();
    await flushPromises();

    expect(wrapper.get('h1').text()).toBe('ItemTypes.list_title');
    expect(wrapper.get('input').attributes('placeholder')).toBe('search_itemTypess');
    expect(wrapper.get('[data-to="/organization/item_types/add"]').text()).toContain('ItemTypes');
  });

  it('keeps search input changes synchronized with the route query', async () => {
    const wrapper = mountIndex();
    await wrapper.get('input').setValue('concrete');

    expect(push).toHaveBeenCalledWith({
      query: { page: 1, word: 'concrete' },
    });
  });
});
