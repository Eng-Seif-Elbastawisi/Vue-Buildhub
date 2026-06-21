import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemStatusEnum } from '../../../core/constant/item.status.enum';
import { ItemTypeEnum } from '../../../core/constant/item.type.enum copy';
import AddItemParams from '../../../core/params/add.Item.params';
import ItemAdd from '../ItemAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/Item.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/item/add' }),
}));

const params = new AddItemParams({
  type: ItemTypeEnum.MATERIAL,
  status: ItemStatusEnum.MAIN,
  stage_id: 2,
  department_id: 3,
  measurement_unit_id: 4,
  price: 150,
  notes: 'Ready mix',
  translations: { title: { en: 'Concrete' } },
});

const global = {
  stubs: {
    ItemForm: {
      emits: ['updateData'],
      template: '<div class="item-form-stub" @click="$emit(\'updateData\', params)"></div>',
      setup: () => ({ params }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ItemAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.errorMessage.value = null;
  });

  it('creates an item with emitted form params', async () => {
    const wrapper = mount(ItemAdd, { global });

    await wrapper.find('.item-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(params, undefined, '/item/add');
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to save';
    const wrapper = mount(ItemAdd, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to save');
  });
});
