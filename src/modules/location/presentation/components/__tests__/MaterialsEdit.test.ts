import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddMaterialsParams from '../../../core/params/add.materials.params';
import EditMaterialParams from '../../../core/params/edit.materials.params';
import MaterialsEdit from '../MaterialsEdit.vue';

const fetchOne = vi.fn();
const update = vi.fn();
vi.mock('@/router', () => ({ default: { push: vi.fn() } }));
vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/material/edit/9', params: { material_id: '9' } }),
}));
vi.mock('../../controllers/materials.controller', () => ({
  default: {
    getInstance: () => ({ fetchOne, update, itemData: ref(null), errorMessage: ref('') }),
  },
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

describe('MaterialsEdit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads all translations and updates the material', async () => {
    const wrapper = mount(MaterialsEdit, {
      global: { mocks: { $t: (key: string) => key }, stubs: { MaterialsForm: MaterialsFormStub } },
    });
    await flushPromises();
    expect(fetchOne).toHaveBeenCalledWith(
      expect.objectContaining({ material_id: 9, allLocales: true }),
    );
    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();
    expect(update).toHaveBeenCalledWith(
      expect.any(EditMaterialParams),
      undefined,
      '/material/edit/9',
    );
  });
});
