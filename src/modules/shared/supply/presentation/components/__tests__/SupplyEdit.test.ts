import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddSupplyParams from '../../../core/params/add.supply.params';
import EditSupplyParams from '../../../core/params/edit.supply.params';
import SupplyEdit from '../SupplyEdit.vue';

const fetchOne = vi.fn();
const update = vi.fn();
vi.mock('@/router', () => ({ default: { push: vi.fn() } }));
vi.mock('@/modules/shared/Brand/presentation/controllers/brand.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));
vi.mock('@/modules/shared/measurement/presentation/controllers/measurement.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));
vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/supply/edit/9', params: { supply_id: '9' } }),
}));
vi.mock('../../controllers/supply.controller', () => ({
  default: {
    getInstance: () => ({ fetchOne, update, itemData: ref(null), errorMessage: ref('') }),
  },
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

describe('SupplyEdit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads all translations and updates the supply', async () => {
    const wrapper = mount(SupplyEdit, {
      global: { mocks: { $t: (key: string) => key }, stubs: { SupplyForm: SupplyFormStub } },
    });
    await flushPromises();
    expect(fetchOne).toHaveBeenCalledWith(
      expect.objectContaining({ supply_id: 9, allLocales: true }),
    );
    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();
    expect(update).toHaveBeenCalledWith(expect.any(EditSupplyParams), undefined, '/supply/edit/9');
  });
});
