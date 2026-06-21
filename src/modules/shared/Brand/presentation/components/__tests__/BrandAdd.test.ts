import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import { EquipmentTypeEnum } from '../../../core/constant/equipment.type.enum';
import AddBrandParams from '../../../core/params/add.brand.params';
import BrandAdd from '../BrandAdd.vue';

const create = vi.fn().mockResolvedValue({});
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/brand/add' }) }));
vi.mock('../../controllers/brand.controller.ts', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
}));

const BrandFormStub = {
  emits: ['updateData'],
  template: `<button class="emit-form" @click="$emit('updateData', params)">form</button>`,
  data: () => ({
    params: new AddBrandParams({ name: 'Acme', equipment: EquipmentTypeEnum.materials }),
  }),
};

describe('BrandAdd', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates the brand emitted by the form', async () => {
    const wrapper = mount(BrandAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { BrandForm: BrandFormStub } },
    });

    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();

    expect(create).toHaveBeenCalledWith(expect.any(AddBrandParams), undefined, '/brand/add');
    expect(create.mock.calls[0][0].toMap()).toEqual({
      name: 'Acme',
      equipment: EquipmentTypeEnum.materials,
    });
  });
});
