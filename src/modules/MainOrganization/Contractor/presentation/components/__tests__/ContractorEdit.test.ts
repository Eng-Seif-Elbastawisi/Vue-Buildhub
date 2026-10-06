import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddContractorParams from '../../../core/params/add.contractor.params';
import ContractorEdit from '../ContractorEdit.vue';
import ContractorForm from '../ContractorForm.vue';

const update = vi.fn().mockResolvedValue(undefined);
const fetchOne = vi.fn().mockResolvedValue(undefined);
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { contractor_id: '9' },
    fullPath: '/organization/contractors/edit/9',
  }),
}));
vi.mock('@/router', () => ({ default: { push: vi.fn() } }));
vi.mock('../../controllers/contractor.controller', () => ({
  default: {
    getInstance: () => ({ update, fetchOne, itemData: ref(null), errorMessage: ref('') }),
  },
}));

describe('ContractorEdit', () => {
  it('loads the contractor and submits its ID in the update body', async () => {
    const wrapper = mount(ContractorEdit, {
      global: { mocks: { $t: (key: string) => key }, stubs: { ContractorForm: true } },
    });
    wrapper
      .getComponent(ContractorForm)
      .vm.$emit('updateData', new AddContractorParams('Builder', [4]));
    await wrapper.get('button').trigger('click');

    expect(fetchOne).toHaveBeenCalledWith(expect.objectContaining({ contractorId: 9 }));
    const params = update.mock.calls.at(-1)?.[0];
    expect(params.toMap()).toEqual({ id: 9, name: 'Builder', stage_ids: [4] });
  });
});
