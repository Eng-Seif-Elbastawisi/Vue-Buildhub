import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemServiceTypeEnum } from '../../../core/constant/item.service.type.enum';
import { ItemStatusEnum } from '../../../core/constant/item.status.enum';
import { ItemTypeEnum } from '../../../core/constant/item.type.enum copy';
import AddItemParams from '../../../core/params/add.Item.params';
import ItemAdd from '../ItemAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  errorMessage: { value: null as string | null },
}));
const route = vi.hoisted(() => ({
  fullPath: '/item/add',
  query: {} as Record<string, string>,
}));

vi.mock('../../controllers/Item.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useRoute: () => route,
  };
});

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
    route.fullPath = '/item/add';
    route.query = {};
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

  it('adds route service type to create params', async () => {
    route.fullPath = '/item/add?service_type=2';
    route.query = { service_type: String(ItemServiceTypeEnum.SUPERVISION) };
    const wrapper = mount(ItemAdd, { global });

    await wrapper.find('.item-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(
      expect.any(AddItemParams),
      undefined,
      '/item/add?service_type=2',
    );
    expect(mockController.create.mock.calls[0]?.[0].toMap()).toMatchObject({
      service_type: ItemServiceTypeEnum.SUPERVISION,
    });
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to save';
    const wrapper = mount(ItemAdd, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to save');
  });
});
