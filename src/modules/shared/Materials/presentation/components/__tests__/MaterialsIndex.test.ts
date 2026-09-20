import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import MaterialsIndex from '../MaterialsIndex.vue';
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ user: { isMaster: true } }) }));

const fetchList = vi.fn().mockResolvedValue({});
const fetchStats = vi.fn().mockResolvedValue({});
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({ locale: ref('en'), t: (key: string) => key }),
}));
vi.mock('../../controllers/materials.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      fetchStats,
      delete: vi.fn(),
      listState: ref({}),
      pagination: ref(null),
    }),
  },
}));

describe('MaterialsIndex', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses Material labels and fetches the list on mount', () => {
    const wrapper = mount(MaterialsIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: true,
          AppTable: true,
          Pagination: true,
          TableSkelaton: true,
          DeleteDialog: true,
          ChangeStatusButton: true,
          RouterLink: true,
        },
      },
    });
    expect(wrapper.text()).toContain('material.list_title');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });

  it('renders the material status action in the list', () => {
    const wrapper = mount(MaterialsIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: {
            template: '<div><slot name="success" :data="[{ id: 5, status: true }]" /></div>',
          },
          AppTable: {
            props: ['items'],
            template: '<div><slot name="actions" :item="items[0]" /></div>',
          },
          ChangeStatusButton: {
            props: ['id', 'type', 'initialIsActive'],
            template: '<div class="change-status" />',
          },
          MaterialStatsCard: true,
          Pagination: true,
          DeleteDialog: true,
          RouterLink: true,
        },
      },
    });

    expect(wrapper.get('.change-status').exists()).toBe(true);
  });
});
