import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemStatusEnum } from '../../../core/constant/item.status.enum';
import { ItemTypeEnum } from '../../../core/constant/item.type.enum copy';
import ItemShowModel from '../../../core/models/Item.show.model';
import AddItemParams from '../../../core/params/add.Item.params';
import EditItemParams from '../../../core/params/edit.Item.params';
import ShowItemParams from '../../../core/params/show.Item.params';
import ItemEdit from '../ItemEdit.vue';

const mockController = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  update: vi.fn(),
  itemData: { value: null as ItemShowModel | null },
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/Item.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/item/edit/12', params: { id: '12' } }),
}));

const addParams = new AddItemParams({
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
      template: '<div class="item-form-stub" @click="$emit(\'updateData\', addParams)"></div>',
      setup: () => ({ addParams }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ItemEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchOne.mockResolvedValue({});
    mockController.update.mockResolvedValue({});
    mockController.itemData.value = ItemShowModel.example;
    mockController.errorMessage.value = null;
  });

  it('fetches the item on mount using route id', async () => {
    mount(ItemEdit, { global });
    await flushPromises();

    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowItemParams));
    expect(mockController.fetchOne.mock.calls[0]?.[0].item_id).toBe(12);
    expect(mockController.fetchOne.mock.calls[0]?.[0].allLocales).toBe(true);
  });

  it('updates an item with converted edit params', async () => {
    const wrapper = mount(ItemEdit, { global });

    await wrapper.find('.item-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(
      expect.any(EditItemParams),
      undefined,
      '/item/edit/12',
    );
    expect(mockController.update.mock.calls[0]?.[0].item_id).toBe(12);
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to update';
    const wrapper = mount(ItemEdit, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to update');
  });
});
