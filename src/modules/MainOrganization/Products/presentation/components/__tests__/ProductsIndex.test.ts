import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ProductsIndex from '../ProductsIndex.vue';

const toastSuccess = vi.hoisted(() => vi.fn());
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

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: { toastSuccess },
}));

describe('ProductsIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('shows the backend success message after a product is deleted', async () => {
    controller.delete.mockResolvedValueOnce(
      new DataSuccess<void>({ message: 'تم حذف المنتج بنجاح' }),
    );

    const wrapper = mount(ProductsIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: {
            template: '<div><slot name="success" :data="[{ id: 6, title: \'Door\' }]" /></div>',
          },
          ChangeStatusButton: true,
          DeleteDialog: {
            emits: ['delete'],
            template: '<button class="delete-dialog" @click="$emit(\'delete\')" />',
          },
          Pagination: true,
          IndexAddIcon: true,
          RouterLink: true,
        },
      },
    });
    await flushPromises();

    await wrapper.get('.delete-dialog').trigger('click');
    await flushPromises();

    expect(toastSuccess).toHaveBeenCalledWith('تم حذف المنتج بنجاح');
  });
});
