import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddSpecializationParams from '../../../core/params/add.specialization.params';
import EditSpecializationParams from '../../../core/params/edit.specialization.params';
import SpecializationEdit from '../SpecializationEdit.vue';

const fetchOne = vi.fn();
const update = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/specialization/edit/2', params: { specialization_id: '2' } }),
}));
vi.mock('../../controllers/specialization.controller', () => ({
  default: {
    getInstance: () => ({ fetchOne, update, itemData: ref(null), errorMessage: ref('') }),
  },
}));

const FormStub = {
  emits: ['updateData'],
  template: '<button class="form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({
    params: new AddSpecializationParams({
      translations: new TranslationParams({ title: { en: 'Mall' } }),
    }),
  }),
};

describe('SpecializationEdit', () => {
  it('loads and updates project', async () => {
    const wrapper = mount(SpecializationEdit, {
      global: { mocks: { $t: (key: string) => key }, stubs: { SpecializationForm: FormStub } },
    });
    await flushPromises();
    expect(fetchOne).toHaveBeenCalledWith(
      expect.objectContaining({ specializationId: 2, allLocales: true }),
    );
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    expect(update).toHaveBeenCalledWith(
      expect.any(EditSpecializationParams),
      undefined,
      '/specialization/edit/2',
    );
  });
});
