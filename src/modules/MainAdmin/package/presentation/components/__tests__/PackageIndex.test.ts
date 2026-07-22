import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeletePackageParams from '../../../core/params/delete.package.params';
import PackageIndex from '../PackageIndex.vue';

const push = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ query: {} as Record<string, string> }));
const mockController = vi.hoisted(() => ({
  fetchList: vi.fn(),
  delete: vi.fn(),
  listState: { value: { status: 'success' } },
  pagination: { value: { currentPage: 1, lastPage: 1, perPage: 10, total: 1 } },
}));

vi.mock('../../controllers/package.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}));

const global = {
  stubs: {
    DataStatusBuilder: {
      template:
        '<div><slot name="success" :data="[{ id: 7, duration: 12, price: \'999\' }]" /></div>',
    },
    AppTable: {
      template: '<div><slot name="actions" :item="{ id: 7 }" /></div>',
    },
    Pagination: true,
    DeleteDialog: {
      emits: ['delete'],
      template:
        '<button class="delete-stub" @click="$emit(\'delete\')"><slot name="btn" /></button>',
    },
    TableSkelaton: true,
    'router-link': true,
  },
  mocks: { $t: (key: string) => key },
};

describe('PackageIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchList.mockResolvedValue({});
    mockController.delete.mockResolvedValue({});
    route.query = {};
  });

  it('fetches packages on mount', async () => {
    mount(PackageIndex, { global });
    await flushPromises();
    expect(mockController.fetchList).toHaveBeenCalledTimes(1);
  });

  it('deletes a package and refreshes the list', async () => {
    const wrapper = mount(PackageIndex, { global });
    await wrapper.find('.delete-stub').trigger('click');
    await flushPromises();

    expect(mockController.delete).toHaveBeenCalledWith(expect.any(DeletePackageParams));
    expect(mockController.fetchList).toHaveBeenCalledTimes(2);
  });
});
