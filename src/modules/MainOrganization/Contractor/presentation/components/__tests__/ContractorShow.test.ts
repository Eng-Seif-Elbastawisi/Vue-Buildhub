import { describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ContractorModel from '../../../core/models/contractor.model';
import ContractorShow from '../ContractorShow.vue';

const fetchOne = vi.fn().mockResolvedValue(undefined);
const deleteContractor = vi.fn().mockResolvedValue(new DataSuccess({ data: undefined }));
const routerPush = vi.fn().mockResolvedValue(undefined);
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { contractor_id: '9' } }),
  useRouter: () => ({ push: routerPush }),
}));
vi.mock('../../controllers/contractor.controller', () => ({
  default: {
    getInstance: () => ({
      fetchOne,
      delete: deleteContractor,
      itemData: ref(new ContractorModel(9, 'Builder', [1], [])),
      errorMessage: ref(''),
    }),
  },
}));

describe('ContractorShow', () => {
  it('shows the contractor and deletes with the existing dialog flow', async () => {
    const wrapper = mount(ContractorShow, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DeleteDialog: {
            emits: ['delete'],
            template:
              '<div class="delete-dialog" @click="$emit(\'delete\')"><slot name="btn"/></div>',
          },
          RouterLink: { props: ['to'], template: '<a :href="to"><slot/></a>' },
        },
      },
    });

    expect(fetchOne).toHaveBeenCalledWith(expect.objectContaining({ contractorId: 9 }));
    expect(wrapper.text()).toContain('Builder');
    await wrapper.get('.delete-dialog').trigger('click');
    await flushPromises();
    expect(deleteContractor).toHaveBeenCalledWith(expect.objectContaining({ contractorId: 9 }));
    expect(routerPush).toHaveBeenCalledWith('/organization/contractors');
  });
});
