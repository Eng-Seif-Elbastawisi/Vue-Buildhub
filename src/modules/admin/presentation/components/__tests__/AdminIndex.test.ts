import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeleteAdminParams from '../../../core/params/delete.admin.params';
import AdminIndex from '../AdminIndex.vue';

const push = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ query: {} as Record<string, string> }));
const mockController = vi.hoisted(() => ({
  fetchList: vi.fn(),
  delete: vi.fn(),
  listState: { value: { status: 'success' } },
  pagination: { value: { currentPage: 1, lastPage: 1, perPage: 10, total: 0 } },
}));

vi.mock('../../controllers/admin.controller', () => ({
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
        "<div><slot name=\"success\" :data=\"[{ id: 7, name: 'Admin User', email: 'admin@example.com', phone: '010' }]\" /></div>",
    },
    AppTable: {
      template:
        '<div class="app-table-stub"><slot name="actions" :item="{ id: 7, name: \'Admin User\' }" /></div>',
    },
    Pagination: {
      emits: ['changePage'],
      template: '<button class="pagination-stub" @click="$emit(\'changePage\', 2)" />',
    },
    DeleteDialog: {
      emits: ['delete'],
      template:
        '<button class="delete-dialog-stub" @click="$emit(\'delete\')"><slot name="btn" /></button>',
    },
    TableSkelaton: true,
    'router-link': true,
  },
  mocks: { $t: (key: string) => key },
};

describe('AdminIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.query = {};
    mockController.fetchList.mockResolvedValue({});
    mockController.delete.mockResolvedValue({});
  });

  it('fetches admins on mount', async () => {
    mount(AdminIndex, { global });
    await flushPromises();
    expect(mockController.fetchList).toHaveBeenCalledTimes(1);
  });

  it('deletes an admin and refreshes the list', async () => {
    const wrapper = mount(AdminIndex, { global });
    await wrapper.find('.delete-dialog-stub').trigger('click');
    await flushPromises();

    expect(mockController.delete).toHaveBeenCalledWith(expect.any(DeleteAdminParams));
    expect(mockController.delete.mock.calls[0]?.[0].id).toBe(7);
    expect(mockController.fetchList).toHaveBeenCalledTimes(2);
  });

  it('pushes page changes into route query', async () => {
    const wrapper = mount(AdminIndex, { global });
    await wrapper.find('.pagination-stub').trigger('click');
    await flushPromises();
    expect(push).toHaveBeenCalledWith({ query: { page: '2', word: undefined } });
  });
});
