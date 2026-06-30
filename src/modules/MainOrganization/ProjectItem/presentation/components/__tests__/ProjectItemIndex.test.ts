import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectItemPriceEnum } from '../../../core/constant/project.item.Price.enum';
import DeleteProjectItemParams from '../../../core/params/delete.project.Item.params';
import ProjectItemIndex from '../ProjectItemIndex.vue';

const push = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ query: {} as Record<string, string> }));
const mockController = vi.hoisted(() => ({
  fetchList: vi.fn(),
  delete: vi.fn(),
  listState: { value: { status: 'success' } },
  pagination: { value: { currentPage: 1, lastPage: 1, perPage: 10, total: 0 } },
}));

vi.mock('../../controllers/project.Item.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: { value: 'en' }, t: (key: string) => key }),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 1, isMaster: true } }),
}));

const global = {
  stubs: {
    DataStatusBuilder: {
      template: `<div><slot name="success" :data="[{ id: 7, item_id: { id: 9, title: 'Concrete' }, quantity: 3, price: 150, pricing_method: ${ProjectItemPriceEnum.GENERAL_ITEM}, project_floor_id: 2 }]" /></div>`,
    },
    AppTable: {
      template:
        '<div class="app-table-stub"><slot name="actions" :item="{ id: 7, item_id: { id: 9, title: \'Concrete\' }, quantity: 3, price: 150, pricing_method: 1, project_floor_id: 2 }" /></div>',
    },
    Pagination: {
      emits: ['changePage', 'countPerPage'],
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
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ProjectItemIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.query = {};
    mockController.fetchList.mockResolvedValue({});
    mockController.delete.mockResolvedValue({});
  });

  it('fetches items on mount', async () => {
    mount(ProjectItemIndex, { global });
    await flushPromises();

    expect(mockController.fetchList).toHaveBeenCalledTimes(1);
  });

  it('deletes an item and refreshes the list', async () => {
    const wrapper = mount(ProjectItemIndex, { global });

    await wrapper.find('.delete-dialog-stub').trigger('click');
    await flushPromises();

    expect(mockController.delete).toHaveBeenCalledWith(expect.any(DeleteProjectItemParams));
    expect(mockController.delete.mock.calls[0]?.[0].project_item_id).toBe(7);
    expect(mockController.fetchList).toHaveBeenCalledTimes(2);
  });

  it('pushes page changes into the route query', async () => {
    const wrapper = mount(ProjectItemIndex, { global });

    await wrapper.find('.pagination-stub').trigger('click');
    await flushPromises();

    expect(push).toHaveBeenCalledWith({ query: { page: '2', word: undefined } });
  });
});
