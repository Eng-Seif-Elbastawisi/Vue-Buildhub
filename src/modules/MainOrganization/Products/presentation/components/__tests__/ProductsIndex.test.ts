import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ProductsIndex from '../ProductsIndex.vue';

const controller = vi.hoisted(() => ({
  fetchList: vi.fn().mockResolvedValue(undefined),
  fetchStats: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(undefined),
  listState: { value: { status: 'success' } },
  pagination: { value: { currentPage: 1, lastPage: 1 } },
}));

vi.mock('../../controllers/products.controller', () => ({
  default: { getInstance: () => controller },
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (callback: () => void) => callback,
}));

describe('ProductsIndex', () => {
  it('renders the product status action in each product card', () => {
    const wrapper = mount(ProductsIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: {
            template:
              '<div><slot name="success" :data="[{ id: 6, title: \'Door\', isActive: true }]" /></div>',
          },
          ChangeStatusButton: {
            props: ['id', 'type', 'initialIsActive'],
            template: '<div class="change-status" />',
          },
          DeleteDialog: true,
          Pagination: true,
          IndexAddIcon: true,
          RouterLink: true,
        },
      },
    });

    expect(wrapper.get('.change-status').exists()).toBe(true);
  });
});
