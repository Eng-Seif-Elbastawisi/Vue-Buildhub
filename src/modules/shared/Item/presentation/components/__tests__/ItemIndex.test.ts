import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemStatusEnum } from '../../../core/constant/item.status.enum';
import { ItemTypeEnum } from '../../../core/constant/item.type.enum copy';
import DeleteItemParams from '../../../core/params/delete.Item.params';
import ItemIndex from '../ItemIndex.vue';

const push = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ query: {} as Record<string, string> }));
const mockController = vi.hoisted(() => ({
  fetchList: vi.fn(),
  delete: vi.fn(),
  listState: { value: { status: 'success' } },
  pagination: { value: { currentPage: 1, lastPage: 1, perPage: 10, total: 0 } },
}));

vi.mock('../../controllers/Item.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({ global: { t: (key: string) => key } }),
  useI18n: () => ({ locale: { value: 'en' }, t: (key: string) => key }),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { isMaster: true } }),
}));

const global = {
  stubs: {
    DataStatusBuilder: {
      template: `<div><slot name="success" :data="[{ id: 7, translations: { title: { en: 'Concrete' } }, type: ${ItemTypeEnum.MATERIAL}, status: ${ItemStatusEnum.MAIN}, price: 150, notes: 'Ready mix' }]" /></div>`,
    },
    AppTable: {
      template:
        '<div class="app-table-stub"><slot name="actions" :item="{ id: 7, translations: { title: { en: \'Concrete\' } }, type: 2, price: 150, notes: \'Ready mix\' }" /></div>',
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

describe('ItemIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.query = {};
    mockController.fetchList.mockResolvedValue({});
    mockController.delete.mockResolvedValue({});
  });

  it('fetches items on mount', async () => {
    mount(ItemIndex, { global });
    await flushPromises();

    expect(mockController.fetchList).toHaveBeenCalledTimes(1);
  });

  it('deletes an item and refreshes the list', async () => {
    const wrapper = mount(ItemIndex, { global });

    await wrapper.find('.delete-dialog-stub').trigger('click');
    await flushPromises();

    expect(mockController.delete).toHaveBeenCalledWith(expect.any(DeleteItemParams));
    expect(mockController.delete.mock.calls[0]?.[0].item_id).toBe(7);
    expect(mockController.fetchList).toHaveBeenCalledTimes(2);
  });

  it('pushes page changes into the route query', async () => {
    const wrapper = mount(ItemIndex, { global });

    await wrapper.find('.pagination-stub').trigger('click');
    await flushPromises();

    expect(push).toHaveBeenCalledWith({ query: { page: '2', word: undefined } });
  });
});
