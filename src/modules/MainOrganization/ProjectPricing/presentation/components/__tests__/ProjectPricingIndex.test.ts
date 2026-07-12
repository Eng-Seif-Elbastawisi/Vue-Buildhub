import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../../core/constant/project.pricing.discount.enum';
import DeleteProjectPricingParams from '../../../core/params/delete.project.pricing.params';
import ProjectPricingIndex from '../ProjectPricingIndex.vue';

const push = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ query: {} as Record<string, string> }));
const mockController = vi.hoisted(() => ({
  fetchList: vi.fn(),
  delete: vi.fn(),
  listState: { value: { status: 'success' } },
  pagination: { value: { currentPage: 1, lastPage: 1, perPage: 10, total: 0 } },
}));

vi.mock('../../controllers/project.pricing.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 1, isMaster: true } }),
}));

const global = {
  stubs: {
    DataStatusBuilder: {
      template: `<div><slot name="success" :data="[{ id: 7, total_tax: 14, discount_type: ${ProjectPricingDiscountEnum.FIXED}, discount_value: 250 }]" /></div>`,
    },
    AppTable: {
      template:
        '<div class="app-table-stub"><slot name="actions" :item="{ id: 7, total_tax: 14, discount_type: 1, discount_value: 250 }" /></div>',
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

describe('ProjectPricingIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.query = {};
    mockController.fetchList.mockResolvedValue({});
    mockController.delete.mockResolvedValue({});
  });

  it('fetches project pricing on mount', async () => {
    mount(ProjectPricingIndex, { global });
    await flushPromises();

    expect(mockController.fetchList).toHaveBeenCalledTimes(1);
  });

  it('deletes project pricing and refreshes the list', async () => {
    const wrapper = mount(ProjectPricingIndex, { global });

    await wrapper.find('.delete-dialog-stub').trigger('click');
    await flushPromises();

    expect(mockController.delete).toHaveBeenCalledWith(expect.any(DeleteProjectPricingParams));
    expect(mockController.delete.mock.calls[0]?.[0].project_pricing_id).toBe(7);
    expect(mockController.fetchList).toHaveBeenCalledTimes(2);
  });

  it('pushes page changes into the route query', async () => {
    const wrapper = mount(ProjectPricingIndex, { global });

    await wrapper.find('.pagination-stub').trigger('click');
    await flushPromises();

    expect(push).toHaveBeenCalledWith({ query: { page: '2', word: undefined } });
  });
});
