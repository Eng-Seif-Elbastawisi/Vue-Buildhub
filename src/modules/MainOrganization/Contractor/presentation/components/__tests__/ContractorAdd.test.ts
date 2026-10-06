import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddContractorParams from '../../../core/params/add.contractor.params';
import ContractorAdd from '../ContractorAdd.vue';
import ContractorForm from '../ContractorForm.vue';

const create = vi.fn().mockResolvedValue(undefined);
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/organization/contractors/add' }) }));
vi.mock('@/router', () => ({ default: { push: vi.fn() } }));
vi.mock('../../controllers/contractor.controller', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
}));

describe('ContractorAdd', () => {
  it('submits the form params through the contractor controller', async () => {
    const wrapper = mount(ContractorAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { ContractorForm: true } },
    });
    const params = new AddContractorParams('Builder', [1]);
    wrapper.getComponent(ContractorForm).vm.$emit('updateData', params);
    await wrapper.get('button').trigger('click');

    expect(create).toHaveBeenCalledWith(params, undefined, '/organization/contractors/add');
  });
});
