import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddSupplyParams from '../../../core/params/add.supply.params';
import SupplyAdd from '../SupplyAdd.vue';

const create = vi.fn();
vi.mock('@/router', () => ({ default: { push: vi.fn() } }));
vi.mock('@/modules/shared/Brand/presentation/controllers/brand.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));
vi.mock('@/modules/shared/measurement/presentation/controllers/measurement.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/supply/add' }) }));
vi.mock('../../controllers/supply.controller', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
}));

const SupplyFormStub = {
  emits: ['updateData'],
  template: '<button class="emit-form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({
    params: new AddSupplyParams({
      price: 10,
      brandId: 1,
      measurementId: 1,
      translations: { title: { en: 'Cement' } },
    }),
  }),
};

describe('SupplyAdd', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates the supply emitted by the form', async () => {
    const wrapper = mount(SupplyAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { SupplyForm: SupplyFormStub } },
    });
    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();
    expect(create).toHaveBeenCalledWith(expect.any(AddSupplyParams), undefined, '/supply/add');
  });
});
