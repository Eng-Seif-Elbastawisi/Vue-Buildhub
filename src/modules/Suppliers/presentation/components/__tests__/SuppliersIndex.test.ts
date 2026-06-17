import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SuppliersIndex from '../SuppliersIndex.vue';
vi.mock('@/stores/user.ts', () => ({ useUserStore: () => ({ user: { isMaster: true } }) }));

const fetchList = vi.fn().mockResolvedValue({});
const deleteSupplier = vi.fn().mockResolvedValue({});
const routerPush = vi.fn();
let routeQuery: Record<string, string | undefined> = {};

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routeQuery }),
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('../../controllers/Suppliers.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: deleteSupplier,
      listState: ref({}),
      pagination: ref({ total: 0, per_page: 10, current_page: 1 }),
    }),
  },
}));

const DataStatusBuilderStub = {
  name: 'DataStatusBuilderStub',
  template: '<div><slot name="success" :data="[]" /></div>',
};

const PaginationStub = {
  name: 'PaginationStub',
  emits: ['change-page', 'count-per-page'],
  template: `
    <div>
      <button class="next-page" @click="$emit('change-page', 4)">next</button>
      <button class="per-page" @click="$emit('count-per-page', 30)">per page</button>
    </div>
  `,
};

const mountSuppliersIndex = () =>
  mount(SuppliersIndex, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        DataStatusBuilder: DataStatusBuilderStub,
        AppTable: true,
        Pagination: PaginationStub,
        TableSkelaton: true,
        DeleteDialog: true,
        Dialog: true,
        UpdatedCustomInputSelect: true,
        RouterLink: true,
      },
    },
  });

describe('SuppliersIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeQuery = {};
  });

  it('renders supplier labels and fetches the first page on mount', () => {
    const wrapper = mountSuppliersIndex();

    expect(wrapper.text()).toContain('Suppliers');
    expect(wrapper.text()).toContain('All Suppliers');
    expect(fetchList).toHaveBeenCalledTimes(1);
    expect(fetchList.mock.calls[0][0].toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 10,
    });
  });

  it('uses query filters on mount and pushes route state when the page changes', async () => {
    routeQuery = { page: '2', word: 'build' };
    const wrapper = mountSuppliersIndex();

    expect(fetchList.mock.calls[0][0].toMap()).toEqual({
      word: 'build',
      with_pagination: 1,
      page: 2,
      per_page: 10,
    });

    await wrapper.find('.next-page').trigger('click');

    expect(fetchList).toHaveBeenCalledTimes(2);
    expect(fetchList.mock.calls[1][0].toMap()).toEqual({
      with_pagination: 1,
      page: 2,
      per_page: 10,
    });
    expect(routerPush).toHaveBeenCalledWith({
      query: { page: '4', word: 'build' },
    });
  });

  it('updates per-page count before refetching', async () => {
    const wrapper = mountSuppliersIndex();

    await wrapper.find('.per-page').trigger('click');

    expect(fetchList).toHaveBeenCalledTimes(2);
    expect(fetchList.mock.calls[1][0].toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 30,
    });
  });
});
