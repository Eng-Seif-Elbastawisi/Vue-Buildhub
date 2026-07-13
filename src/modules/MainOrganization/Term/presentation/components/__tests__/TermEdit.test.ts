import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddTermParams from '../../../core/params/add.term.params';
import EditTermParams from '../../../core/params/edit.term.params';
import TermEdit from '../TermEdit.vue';

const fetchOne = vi.fn();
const update = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/term/edit/2', params: { term_id: '2' } }),
}));
vi.mock('../../controllers/term.controller', () => ({
  default: {
    getInstance: () => ({ fetchOne, update, itemData: ref(null), errorMessage: ref('') }),
  },
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

describe('TermEdit', () => {
  it('loads and updates project', async () => {
    const wrapper = mount(TermEdit, {
      global: { mocks: { $t: (key: string) => key }, stubs: { TermForm: FormStub } },
    });
    await flushPromises();
    expect(fetchOne).toHaveBeenCalledWith(expect.objectContaining({ termId: 2, allLocales: true }));
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    expect(update).toHaveBeenCalledWith(expect.any(EditTermParams), undefined, '/term/edit/2');
  });
});
