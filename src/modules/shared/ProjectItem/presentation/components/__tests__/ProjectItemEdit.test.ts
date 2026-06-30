import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectItemPriceEnum } from '../../../core/constant/project.item.Price.enum';
import ProjectItemShowModel from '../../../core/models/project.Item.show.model';
import AddProjectItemParams from '../../../core/params/add.project.Item.params';
import EditProjectItemParams from '../../../core/params/edit.project.Item.params';
import ShowProjectItemParams from '../../../core/params/show.project.Item.params';
import ProjectItemEdit from '../ProjectItemEdit.vue';

const mockController = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  update: vi.fn(),
  itemData: { value: null as ProjectItemShowModel | null },
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/project.Item.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('@/modules/shared/Item/presentation/controllers/Item.controller', () => ({
  default: { getInstance: () => ({}) },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/item/edit/12', params: { id: '12' } }),
}));

const addParams = new AddProjectItemParams({
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
      template: '<div class="item-form-stub" @click="$emit(\'updateData\', addParams)"></div>',
      setup: () => ({ addParams }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ProjectItemEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchOne.mockResolvedValue({});
    mockController.update.mockResolvedValue({});
    mockController.itemData.value = ProjectItemShowModel.example;
    mockController.errorMessage.value = null;
  });

  it('fetches the item on mount using route id', async () => {
    mount(ProjectItemEdit, { global });
    await flushPromises();

    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowProjectItemParams));
    expect(mockController.fetchOne.mock.calls[0]?.[0].project_item_id).toBe(12);
    expect(mockController.fetchOne.mock.calls[0]?.[0].allLocales).toBe(true);
  });

  it('updates an item with converted edit params', async () => {
    const wrapper = mount(ProjectItemEdit, { global });

    await wrapper.find('.item-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(
      expect.any(EditProjectItemParams),
      undefined,
      '/item/edit/12',
    );
    expect(mockController.update.mock.calls[0]?.[0].project_item_id).toBe(12);
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to update';
    const wrapper = mount(ProjectItemEdit, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to update');
  });
});
