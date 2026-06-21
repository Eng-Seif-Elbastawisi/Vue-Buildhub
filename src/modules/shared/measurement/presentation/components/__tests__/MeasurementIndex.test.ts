import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeleteMeasurementParams from '../../../core/params/delete.measurement.params';
import ShowMeasurementParams from '../../../core/params/show.measurement.params';
import MeasurementIndex from '../MeasurementIndex.vue';

const push = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ query: {} as Record<string, string>, params: {} }));
const mockController = vi.hoisted(() => ({
  fetchList: vi.fn(),
  fetchOne: vi.fn(),
  delete: vi.fn(),
  listState: { value: { status: 'success' } },
  itemData: { value: null },
  pagination: { value: { currentPage: 1, lastPage: 1, perPage: 10, total: 0 } },
}));

vi.mock('../../controllers/measurement.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (callback: () => void) => callback,
}));

const global = {
  stubs: {
    MeasurementAdd: true,
    DataStatusBuilder: {
      template: '<div><slot name="success" :data="[{ id: 7, title: \'Primary\' }]" /></div>',
    },
    AppTable: {
      emits: ['selectionChange'],
      template:
        '<div class="app-table-stub"><slot name="actions" :item="{ id: 7, title: \'Primary\' }" /></div>',
    },
    Pagination: {
      emits: ['changePage', 'countPerPage'],
      template: '<div class="pagination-stub" />',
    },
    DeleteDialog: {
      emits: ['delete'],
      template:
        '<button class="delete-dialog-stub" @click="$emit(\'delete\')"><slot name="btn" /></button>',
    },
    EditIcon: true,
    'router-link': true,
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('MeasurementIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.query = {};
    mockController.fetchList.mockResolvedValue({});
    mockController.fetchOne.mockResolvedValue({});
    mockController.delete.mockResolvedValue({});
  });

  it('fetches measurements on mount', async () => {
    mount(MeasurementIndex, { global });
    await flushPromises();

    expect(mockController.fetchList).toHaveBeenCalledTimes(1);
  });

  it('fetches one measurement before entering edit mode', async () => {
    const wrapper = mount(MeasurementIndex, { global });

    await wrapper.find('.action-btn.edit').trigger('click');
    await flushPromises();

    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowMeasurementParams));
    expect(mockController.fetchOne.mock.calls[0]?.[0].id).toBe(7);
  });

  it('deletes a measurement and refreshes the list', async () => {
    const wrapper = mount(MeasurementIndex, { global });

    await wrapper.find('.delete-dialog-stub').trigger('click');
    await flushPromises();

    expect(mockController.delete).toHaveBeenCalledWith(expect.any(DeleteMeasurementParams));
    expect(mockController.delete.mock.calls[0]?.[0].id).toBe(7);
    expect(mockController.fetchList).toHaveBeenCalledTimes(2);
  });
});
