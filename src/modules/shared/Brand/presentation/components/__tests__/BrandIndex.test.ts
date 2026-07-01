import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BrandIndex from '../BrandIndex.vue';
vi.mock('@/stores/user.ts', () => ({ useUserStore: () => ({ user: { isMaster: true } }) }));

const fetchList = vi.fn().mockResolvedValue({});
const deleteBrand = vi.fn().mockResolvedValue({});
const routerPush = vi.fn();
let routeQuery: Record<string, string | undefined> = {};

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routeQuery }),
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('../../controllers/brand.controller.ts', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: deleteBrand,
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
      <button class="next-page" @click="$emit('change-page', 3)">next</button>
      <button class="per-page" @click="$emit('count-per-page', 25)">per page</button>
    </div>
  `,
};

const mountBrandIndex = () =>
  mount(BrandIndex, {
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

describe('BrandIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeQuery = {};
  });

  it('renders brand labels and fetches the first page on mount', () => {
    const wrapper = mountBrandIndex();

    expect(wrapper.text()).toContain('Brands');
    expect(wrapper.text()).toContain('All Brands');
    expect(fetchList).toHaveBeenCalledTimes(1);
    expect(fetchList.mock.calls[0][0].toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 10,
    });
  });

  it('uses query filters on mount and pushes route state when the page changes', async () => {
    routeQuery = { page: '2', word: 'acme' };
    const wrapper = mountBrandIndex();

    expect(fetchList.mock.calls[0][0].toMap()).toEqual({
      word: 'acme',
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
      query: { page: '3', word: 'acme' },
    });
  });

  it('updates per-page count before refetching', async () => {
    const wrapper = mountBrandIndex();

    await wrapper.find('.per-page').trigger('click');

    expect(fetchList).toHaveBeenCalledTimes(2);
    expect(fetchList.mock.calls[1][0].toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 25,
    });
  });
});
