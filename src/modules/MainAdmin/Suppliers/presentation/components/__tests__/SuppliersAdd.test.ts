import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddSuppliersParams from '../../../core/params/add.Suppliers.params';
import SuppliersAdd from '../SuppliersAdd.vue';

const create = vi.fn().mockResolvedValue({});

vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/Suppliers/add' }) }));
vi.mock('../../controllers/Suppliers.controller.ts', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
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

describe('SuppliersAdd', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates the supplier emitted by the form', async () => {
    const wrapper = mount(SuppliersAdd, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { SuppliersForm: SuppliersFormStub },
      },
    });

    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();

    expect(create).toHaveBeenCalledWith(
      expect.any(AddSuppliersParams),
      undefined,
      '/Suppliers/add',
    );
    expect(create.mock.calls[0][0].toMap()).toEqual({
      name: 'Build Supply',
      Specialization: 'Concrete',
      phone: '01000000000',
      materials: 'Cement',
    });
  });
});
