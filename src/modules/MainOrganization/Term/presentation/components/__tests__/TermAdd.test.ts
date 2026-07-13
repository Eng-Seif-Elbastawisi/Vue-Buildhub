import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddTermParams from '../../../core/params/add.term.params';
import TermAdd from '../TermAdd.vue';

const create = vi.fn();
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/term/add' }) }));
vi.mock('../../controllers/term.controller', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
}));

const FormStub = {
  emits: ['updateData'],
  template: '<button class="form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({
    params: new AddTermParams({
      translations: new TranslationParams({ title: { en: 'Mall' } }),
    }),
  }),
};

describe('TermAdd', () => {
  it('creates form data', async () => {
    const wrapper = mount(TermAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { TermForm: FormStub } },
    });
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    await flushPromises();
    expect(create).toHaveBeenCalledWith(expect.any(AddTermParams), undefined, '/term/add');
  });
});
