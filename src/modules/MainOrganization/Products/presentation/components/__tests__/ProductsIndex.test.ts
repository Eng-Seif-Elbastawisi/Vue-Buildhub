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

vi.mock('@/modules/shared/Stages/presentation/controllers/stage.controller', () => ({
  default: { getInstance: () => stageController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routeQuery }),
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (callback: () => void) => callback,
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: { toastSuccess },
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

const mockGroupedStages = () => {
  stageController.fetchList
    .mockResolvedValueOnce({
      data: [
        new StageModel({ id: 1, title: 'Main Stage A', children: [] }),
        new StageModel({ id: 2, title: 'Main Stage B', children: [] }),
      ],
    })
    .mockResolvedValueOnce({
      data: [
        new StageModel({ id: 11, title: 'Sub 1', children: [] }),
        new StageModel({ id: 12, title: 'Sub 2', children: [] }),
      ],
    })
    .mockResolvedValueOnce({ data: [] });
};

describe('ProductsIndex', () => {
  beforeEach(() => {
    Object.keys(routeQuery).forEach((key) => delete routeQuery[key]);
    controller.fetchList.mockReset().mockResolvedValue(undefined);
    controller.fetchStats.mockReset().mockResolvedValue({});
    controller.delete.mockReset().mockResolvedValue(undefined);
    stageController.fetchList.mockReset().mockResolvedValue({ data: [] });
    routerPush.mockReset();
  });

  it('renders the product status action in each product card', async () => {
    const wrapper = mountIndex();
    await flushPromises();

    expect(wrapper.get('.change-status').exists()).toBe(true);
  });
});
