import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddSpecializationParams from '../../../core/params/add.specialization.params';
import SpecializationAdd from '../SpecializationAdd.vue';

const create = vi.fn();
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/specialization/add' }) }));
vi.mock('../../controllers/specialization.controller', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
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

describe('SpecializationAdd', () => {
  it('creates form data', async () => {
    const wrapper = mount(SpecializationAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { SpecializationForm: FormStub } },
    });
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    await flushPromises();
    expect(create).toHaveBeenCalledWith(
      expect.any(AddSpecializationParams),
      undefined,
      '/specialization/add',
    );
  });
});
