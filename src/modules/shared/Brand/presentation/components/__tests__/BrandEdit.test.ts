import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddBrandParams from '../../../core/params/add.brand.params';
import EditBrandParams from '../../../core/params/edit.brand.params';
import BrandEdit from '../BrandEdit.vue';

const fetchOne = vi.fn().mockResolvedValue({});
const update = vi.fn().mockResolvedValue({});
vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/brand/edit/8', params: { id: '8' } }),
}));
vi.mock('../../controllers/brand.controller.ts', () => ({
  default: {
    getInstance: () => ({ fetchOne, update, itemData: ref(null), errorMessage: ref('') }),
  },
}));

const BrandFormStub = {
  emits: ['updateData'],
  template: `<button class="emit-form" @click="$emit('updateData', params)">form</button>`,
  data: () => ({ params: new AddBrandParams({ name: 'Acme' }) }),
};

describe('BrandEdit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads and updates the selected brand id', async () => {
    const wrapper = mount(BrandEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { BrandForm: BrandFormStub, IconAccept: true },
      },
    });
    await flushPromises();

    expect(fetchOne).toHaveBeenCalledWith(expect.objectContaining({ brand_id: 8 }));
    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();

    expect(update).toHaveBeenCalledWith(expect.any(EditBrandParams), undefined, '/brand/edit/8');
    expect(update.mock.calls[0][0].toMap()).toEqual({ brand_id: 8, equipment: undefined });
  });
});
