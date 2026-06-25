import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeleteLocationParams from '../../../../core/params/delete.location.params';
import IndexLocationParams from '../../../../core/params/index.location.params';
import { LocationTypeEnum } from '../../../../core/constant/location.type.enum';
import LocationIndex from '../locationIndex.vue';

const push = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ query: {} as Record<string, string> }));
const mockController = vi.hoisted(() => ({
  fetchList: vi.fn(),
  delete: vi.fn(),
  listState: { value: { status: 'success' } },
  pagination: { value: { currentPage: 1, lastPage: 1, perPage: 10, total: 0 } },
}));

vi.mock('../../../controllers/location.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 1 } }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: { value: 'en' }, t: (key: string) => key }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}));

const global = {
  stubs: {
    DataStatusBuilder: {
      template:
        '<div><slot name="success" :data="[{ id: 5, type: 3, translations: { title: { en: \'Cairo\' } } }]" /></div>',
    },
    AppTable: {
      template:
        '<div class="app-table-stub"><slot name="actions" :item="{ id: 5, type: 3, translations: { title: { en: \'Cairo\' } } }" /></div>',
    },
    Pagination: {
      emits: ['changePage', 'countPerPage'],
      template:
        '<button class="pagination-stub" @click="$emit(\'changePage\', 2)" @dblclick="$emit(\'countPerPage\', 25)" />',
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

describe('CityLocationIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.query = {};
    mockController.fetchList.mockResolvedValue({});
    mockController.delete.mockResolvedValue({});
  });

  it('fetches city locations on mount', async () => {
    mount(LocationIndex, { global });
    await flushPromises();

    expect(mockController.fetchList).toHaveBeenCalledWith(expect.any(IndexLocationParams));
    expect(mockController.fetchList.mock.calls[0]?.[0].type).toBe(LocationTypeEnum.CITY);
  });

  it('deletes a city location and refreshes the list', async () => {
    const wrapper = mount(LocationIndex, { global });

    await wrapper.find('.delete-dialog-stub').trigger('click');
    await flushPromises();

    expect(mockController.delete).toHaveBeenCalledWith(expect.any(DeleteLocationParams));
    expect(mockController.delete.mock.calls[0]?.[0].location_id).toBe(5);
    expect(mockController.fetchList).toHaveBeenCalledTimes(2);
  });
});
