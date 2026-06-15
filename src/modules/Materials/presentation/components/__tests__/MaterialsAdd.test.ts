import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddMaterialsParams from '../../../core/params/add.materials.params';
import MaterialsAdd from '../MaterialsAdd.vue';

const create = vi.fn();
vi.mock('@/router', () => ({ default: { push: vi.fn() } }));
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/material/add' }) }));
vi.mock('../../controllers/materials.controller', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
}));

const MaterialsFormStub = {
  emits: ['updateData'],
  template: '<button class="emit-form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({
    params: new AddMaterialsParams({
      price: 10,
      brandId: 1,
      unit: 1,
      translations: { title: { en: 'Cement' } },
    }),
  }),
};

describe('MaterialsAdd', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates the material emitted by the form', async () => {
    const wrapper = mount(MaterialsAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { MaterialsForm: MaterialsFormStub } },
    });
    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();
    expect(create).toHaveBeenCalledWith(expect.any(AddMaterialsParams), undefined, '/material/add');
  });
});
