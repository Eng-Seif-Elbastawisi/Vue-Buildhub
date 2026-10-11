import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddWarehouseParams from '../../../core/params/add.warehouse.params';
import WarehouseAdd from '../WarehouseAdd.vue';

const create = vi.fn();
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/warehouse/add' }) }));
vi.mock('../../controllers/warehouse.controller', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
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

describe('WarehouseAdd', () => {
  it('creates form data', async () => {
    const wrapper = mount(WarehouseAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { WarehouseForm: FormStub } },
    });
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    await flushPromises();
    expect(create).toHaveBeenCalledWith(
      expect.any(AddWarehouseParams),
      undefined,
      '/warehouse/add',
    );
  });
});
