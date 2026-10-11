import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddWarehouseParams from '../../../core/params/add.warehouse.params';
import EditWarehouseParams from '../../../core/params/edit.warehouse.params';
import WarehouseEdit from '../WarehouseEdit.vue';

const fetchOne = vi.fn();
const update = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/warehouse/edit/2', params: { warehouse_id: '2' } }),
}));
vi.mock('../../controllers/warehouse.controller', () => ({
  default: {
    getInstance: () => ({ fetchOne, update, itemData: ref(null), errorMessage: ref('') }),
  },
}));

const FormStub = {
  emits: ['updateData'],
  template: '<button class="form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({
    params: new AddWarehouseParams({
      translations: new TranslationParams({ title: { en: 'Warehouse' } }),
    }),
  }),
};

describe('WarehouseEdit', () => {
  it('loads and updates warehouse', async () => {
    const wrapper = mount(WarehouseEdit, {
      global: { mocks: { $t: (key: string) => key }, stubs: { WarehouseForm: FormStub } },
    });
    await flushPromises();
    expect(fetchOne).toHaveBeenCalledWith(
      expect.objectContaining({ warehouseId: 2, allLocales: true }),
    );
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    expect(update).toHaveBeenCalledWith(
      expect.any(EditWarehouseParams),
      undefined,
      '/warehouse/edit/2',
    );
  });
});
