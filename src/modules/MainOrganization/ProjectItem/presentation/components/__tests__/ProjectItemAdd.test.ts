import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectItemPriceEnum } from '../../../core/constant/project.item.Price.enum';
import AddProjectItemParams from '../../../core/params/add.project.Item.params';
import ProjectItemAdd from '../ProjectItemAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  fetchList: vi.fn(),
  listState: { value: { data: [] } },
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/project.Item.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('@/modules/shared/Item/presentation/controllers/Item.controller', () => ({
  default: { getInstance: () => ({}) },
}));

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => ({ fullPath: '/item/add', params: {}, query: { project_id: '4' } }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(),
  }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

const params = new AddProjectItemParams({
  project_id: 4,
  department_id: 7,
  items: [
    {
      price: 150,
      quantity: 3,
      item_id: 9,
      pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
    },
  ],
});

const global = {
  stubs: {
    ProjectItemForm: {
      emits: ['updateData'],
      template: '<div class="item-form-stub" @click="$emit(\'updateData\', params)"></div>',
      setup: () => ({ params }),
    },
    ProjectItemTable: true,
    ProjectFloorShow: true,
    ProjectPricingAdd: true,
    ProjectSteps: true,
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ProjectItemAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.fetchList.mockResolvedValue({});
    mockController.errorMessage.value = null;
  });

  it('creates an item with emitted form params', async () => {
    const wrapper = mount(ProjectItemAdd, { global });
    await flushPromises();

    await wrapper.find('.item-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(params, undefined, '/item/add');
    expect(mockController.fetchList).toHaveBeenCalledTimes(2);
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to save';
    const wrapper = mount(ProjectItemAdd, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to save');
  });
});
