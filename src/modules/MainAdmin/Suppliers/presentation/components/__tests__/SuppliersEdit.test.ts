import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddSuppliersParams from '../../../core/params/add.Suppliers.params';
import EditSuppliersParams from '../../../core/params/edit.Suppliers.params';
import SuppliersEdit from '../SuppliersEdit.vue';

const fetchOne = vi.fn().mockResolvedValue({});
const update = vi.fn().mockResolvedValue({});

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/Suppliers/edit/8', params: { id: '8' } }),
}));
vi.mock('../../controllers/Suppliers.controller.ts', () => ({
  default: {
    getInstance: () => ({ fetchOne, update, itemData: ref(null), errorMessage: ref('') }),
  },
}));

const SuppliersFormStub = {
  emits: ['updateData'],
  template: '<button class="emit-form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({
    params: new AddSuppliersParams({
      name: 'Build Supply',
      Specialization: 'Concrete',
      phone: '01000000000',
      materials: 'Cement',
    }),
  }),
};

describe('SuppliersEdit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads all locales and updates the supplier emitted by the form', async () => {
    const wrapper = mount(SuppliersEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { SuppliersForm: SuppliersFormStub, IconAccept: true },
      },
    });

    await flushPromises();

    expect(fetchOne).toHaveBeenCalledWith(
      expect.objectContaining({ suppliers_id: 8, allLocales: true }),
    );

    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();

    expect(update).toHaveBeenCalledWith(
      expect.any(EditSuppliersParams),
      undefined,
      '/Suppliers/edit/8',
    );
    expect(update.mock.calls[0][0].toMap()).toEqual({
      suppliers_id: 8,
      name: 'Build Supply',
      Specialization: 'Concrete',
      phone: '01000000000',
      materials: 'Cement',
    });
  });
});
