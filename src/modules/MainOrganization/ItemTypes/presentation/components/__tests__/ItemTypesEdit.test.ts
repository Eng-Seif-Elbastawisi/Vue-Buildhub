import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import AddItemTypesParams from '../../../core/params/add.item.types.params';
import ItemTypesEdit from '../ItemTypesEdit.vue';

const controller = vi.hoisted(() => ({
  fetchOne: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  itemData: { value: {} },
  errorMessage: { value: '' },
}));

vi.mock('../../controllers/item.types.controller', () => ({
  default: { getInstance: () => controller },
}));

vi.mock('vue-router', async (importOriginal) => {
  const vueRouter = await importOriginal();
  return {
    ...vueRouter,
    useRoute: () => ({
      fullPath: '/organization/item_types/edit/4',
      params: { item_types_id: '4' },
    }),
  };
});

describe('ItemTypesEdit', () => {
  it('preserves the form status in the update request', async () => {
    const wrapper = mount(ItemTypesEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          ItemTypesForm: {
            name: 'ItemTypesForm',
            template: '<div />',
          },
        },
      },
    });
    await flushPromises();

    wrapper
      .findComponent({ name: 'ItemTypesForm' })
      .vm.$emit('update-data', new AddItemTypesParams({ status: false }));
    await wrapper.get('button').trigger('click');

    expect(controller.update.mock.calls[0]?.[0].toMap()).toMatchObject({
      item_type_id: 4,
      status: false,
    });
  });
});
