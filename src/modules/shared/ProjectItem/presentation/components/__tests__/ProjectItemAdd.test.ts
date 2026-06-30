import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectItemPriceEnum } from '../../../core/constant/project.item.Price.enum';
import AddProjectItemParams from '../../../core/params/add.project.Item.params';
import ProjectItemAdd from '../ProjectItemAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/project.Item.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('@/modules/shared/Item/presentation/controllers/Item.controller', () => ({
  default: { getInstance: () => ({}) },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/item/add' }),
}));

const params = new AddProjectItemParams({
  price: 150,
  quantity: 3,
  item_id: 9,
  pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
  project_floor_id: 2,
});

const global = {
  stubs: {
    ProjectItemForm: {
      emits: ['updateData'],
      template: '<div class="item-form-stub" @click="$emit(\'updateData\', params)"></div>',
      setup: () => ({ params }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ProjectItemAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.errorMessage.value = null;
  });

  it('creates an item with emitted form params', async () => {
    const wrapper = mount(ProjectItemAdd, { global });

    await wrapper.find('.item-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(params, undefined, '/item/add');
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to save';
    const wrapper = mount(ProjectItemAdd, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to save');
  });
});
